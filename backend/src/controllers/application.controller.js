const Application = require('../models/Application');
const Assessment = require('../models/Assessment');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job'); // Use Job instead of JobDescription if that's the model
const Leaderboard = require('../models/Leaderboard');
const sarvamService = require('../services/sarvam.service');
const CodeExecutionService = require('../services/codeExecution.service');
const PlagiarismService = require('../services/plagiarism.service');

exports.startAssessment = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const assessment = await Assessment.findOne({ job: jobId });
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found. Please contact recruiter.'
      });
    }

    const candidate = await Candidate.findOne({ userId: req.user._id });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    // Check if already applied
    const existingApp = await Application.findOne({
      candidate: candidate._id,
      job: jobId
    });

    if (existingApp) {
      // Allow resuming if status is in-progress
      if (existingApp.status === 'in-progress') {
        const sanitizedQuestions = assessment.questions.map(q => {
          const question = q.toObject();
          if (question.type === 'objective') {
            question.options = question.options.map(opt => ({
              text: opt.text,
              _id: opt._id
            }));
          }
          delete question.testCases;
          return question;
        });

        const job = await Job.findById(jobId);

        return res.status(200).json({
          success: true,
          message: 'Resuming assessment',
          data: {
            applicationId: existingApp._id,
            questions: sanitizedQuestions,
            duration: job.assessmentConfig.duration,
            jobTitle: job.title,
            startedAt: existingApp.startedAt
          }
        });
      }

      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assessment',
        existingApplication: existingApp._id
      });
    }

    const application = await Application.create({
      candidate: candidate._id,
      job: jobId,
      assessment: assessment._id,
      status: 'in-progress',
      startedAt: new Date()
    });

    // Return questions without answers
    const sanitizedQuestions = assessment.questions.map(q => {
      const question = q.toObject();
      if (question.type === 'objective') {
        question.options = question.options.map(opt => ({
          text: opt.text,
          _id: opt._id
        }));
      }
      delete question.testCases;
      return question;
    });

    const job = await JobDescription.findById(jobId);

    res.status(200).json({
      success: true,
      message: 'Assessment started successfully',
      data: {
        applicationId: application._id,
        questions: sanitizedQuestions,
        duration: job.assessmentConfig.duration,
        jobTitle: job.title
      }
    });
  } catch (error) {
    console.error('Start assessment error:', error);
    next(error);
  }
};

exports.submitAnswer = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { questionId, type, answer, timeSpent } = req.body;

    const application = await Application.findById(applicationId);
    if (!application || application.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Invalid application or assessment already submitted'
      });
    }

    const assessment = await Assessment.findById(application.assessmentId);
    const question = assessment.questions.id(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    let answerData = {
      questionId,
      type,
      timeSpent: timeSpent || 0
    };

    console.log(`📝 Processing ${type} answer for question ${questionId}`);

    // Process based on question type
    if (type === 'objective') {
      answerData.selectedOption = answer.selectedOption;
      const isCorrect = question.options[answer.selectedOption]?.isCorrect;
      answerData.score = isCorrect ? (question.weight || 10) : 0;
      answerData.maxScore = question.weight || 10;

    } else if (type === 'subjective') {
      answerData.textAnswer = answer.textAnswer;
      answerData.maxScore = question.rubric.maxScore;
      answerData.score = 0; // Will be updated by AI

      // Recruiter AI evaluation (async)
      sarvamService.evaluateAnswer(
        question.question,
        answer.textAnswer,
        question.points || 10
      ).then(evaluation => {
        Application.findOneAndUpdate(
          { _id: applicationId, 'answers.questionId': questionId },
          {
            $set: {
              'answers.$.score': evaluation.score,
              'answers.$.aiEvaluation': {
                feedback: evaluation.feedback,
                strengths: evaluation.strengths,
                improvements: evaluation.weaknesses,
                confidence: 0.9
              }
            }
          }
        ).exec();
        console.log('✅ Subjective answer evaluated with Sarvam');
      }).catch(err => console.error('❌ Sarvam Evaluation error:', err));

    } else if (type === 'programming') {
      answerData.code = answer.code;
      answerData.language = answer.language;
      answerData.maxScore = question.weight || 20;

      console.log('🚀 Executing code...');
      try {
        const executionResults = await CodeExecutionService.executeCode(
          answer.code,
          answer.language,
          question.testCases,
          question.timeLimit || 2,
          question.memoryLimit || 256000
        );

        answerData.executionResults = executionResults;

        const scoreData = CodeExecutionService.calculateScore(
          executionResults,
          question.weight || 20
        );
        answerData.score = scoreData.scored;

        console.log(`✅ Code executed: ${scoreData.testCasesPassed}/${scoreData.totalTestCases} passed`);

        // Check plagiarism (async)
        PlagiarismService.checkCodePlagiarism(answer.code, answer.language)
          .then(plagResult => {
            Application.findByIdAndUpdate(applicationId, {
              $push: {
                'plagiarismCheck.results': {
                  questionId,
                  similarity: plagResult.similarity,
                  suspiciousPatterns: plagResult.suspiciousPatterns
                }
              },
              $set: {
                'plagiarismCheck.codeChecked': true
              }
            }).exec();
          }).catch(err => console.error('Plagiarism check error:', err));

      } catch (execError) {
        console.error('❌ Code execution error:', execError);
        answerData.score = 0;
        answerData.executionResults = [{
          error: execError.message,
          passed: false
        }];
      }
    }

    // Update or add answer
    const existingAnswerIndex = application.answers.findIndex(
      a => a.questionId.toString() === questionId
    );

    if (existingAnswerIndex > -1) {
      application.answers[existingAnswerIndex] = answerData;
    } else {
      application.answers.push(answerData);
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        questionId,
        score: answerData.score,
        maxScore: answerData.maxScore
      }
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    next(error);
  }
};

exports.submitAssessment = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    console.log('📊 Finalizing assessment...');
    const application = await Application.findById(applicationId)
      .populate('assessmentId')
      .populate('candidateId')
      .populate('jobId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.status = 'completed';
    application.submittedAt = new Date();

    // Calculate scores
    const scores = {
      objective: { scored: 0, total: 0 },
      subjective: { scored: 0, total: 0 },
      programming: { scored: 0, total: 0, testCasesPassed: 0, totalTestCases: 0 }
    };

    application.answers.forEach(answer => {
      if (answer.type === 'objective') {
        scores.objective.scored += answer.score || 0;
        scores.objective.total += answer.maxScore || 10;
      } else if (answer.type === 'subjective') {
        scores.subjective.scored += answer.score || 0;
        scores.subjective.total += answer.maxScore || 10;
      } else if (answer.type === 'programming') {
        scores.programming.scored += answer.score || 0;
        scores.programming.total += answer.maxScore || 20;
        if (answer.executionResults) {
          scores.programming.testCasesPassed += answer.executionResults.filter(r => r.passed).length;
          scores.programming.totalTestCases += answer.executionResults.length;
        }
      }
    });

    // Calculate percentages
    scores.objective.percentage = scores.objective.total > 0 ?
      Math.round((scores.objective.scored / scores.objective.total) * 100) : 0;
    scores.subjective.percentage = scores.subjective.total > 0 ?
      Math.round((scores.subjective.scored / scores.subjective.total) * 100) : 0;
    scores.programming.percentage = scores.programming.total > 0 ?
      Math.round((scores.programming.scored / scores.programming.total) * 100) : 0;

    const totalScored = scores.objective.scored + scores.subjective.scored + scores.programming.scored;
    const totalMax = scores.objective.total + scores.subjective.total + scores.programming.total;

    scores.overall = {
      scored: totalScored,
      total: totalMax,
      percentage: totalMax > 0 ? Math.round((totalScored / totalMax) * 100) : 0,
      weightedScore: totalScored
    };

    application.scores = scores;

    // Skill analysis
    const job = application.jobId;
    const skillAnalysis = [];

    if (job.parsedData && job.parsedData.requiredSkills) {
      job.parsedData.requiredSkills.forEach(skillObj => {
        const skillQuestions = application.answers.filter(ans => {
          const question = application.assessmentId.questions.id(ans.questionId);
          return question && question.skillMapping === skillObj.skill;
        });

        if (skillQuestions.length > 0) {
          const skillScore = skillQuestions.reduce((sum, ans) => sum + (ans.score || 0), 0);
          const skillMax = skillQuestions.reduce((sum, ans) => sum + (ans.maxScore || 10), 0);
          const percentage = Math.round((skillScore / skillMax) * 100);

          skillAnalysis.push({
            skill: skillObj.skill,
            score: skillScore,
            maxScore: skillMax,
            performance: percentage >= 80 ? 'excellent' :
              percentage >= 60 ? 'good' :
                percentage >= 40 ? 'average' : 'poor'
          });
        }
      });
    }

    application.skillAnalysis = skillAnalysis;

    // Resume-skill mismatch detection
    if (application.candidateId.resume && application.candidateId.resume.parsedData) {
      console.log('🔍 Analyzing resume-skill mismatch...');
      try {
        const mismatchAnalysis = await GeminiService.analyzeResumeSkillMismatch(
          application.candidateId.resume.parsedData.skills,
          skillAnalysis
        );

        application.resumeSkillMismatch = {
          detected: mismatchAnalysis.mismatches.length > 0,
          mismatches: mismatchAnalysis.mismatches
        };

        if (mismatchAnalysis.mismatches.some(m => m.severity === 'high')) {
          application.status = 'flagged';
        }
      } catch (err) {
        console.error('Mismatch analysis error:', err);
      }
    }

    // Generate AI insights
    console.log('🤖 Generating AI insights...');
    try {
      const insights = await GeminiService.generateCandidateInsights(application.toObject());
      application.aiInsights = insights;
    } catch (err) {
      console.error('Insights generation error:', err);
    }

    // Check qualification
    const cutoff = job.assessmentConfig.cutoffScore || 60;
    if (scores.overall.percentage >= cutoff && application.status !== 'flagged') {
      application.status = 'qualified';
    } else if (application.status !== 'flagged') {
      application.status = 'rejected';
    }

    await application.save();

    // Update leaderboard
    console.log('🏆 Updating leaderboard...');
    await updateLeaderboard(application.jobId._id);

    res.status(200).json({
      success: true,
      message: 'Assessment submitted successfully',
      data: {
        applicationId: application._id,
        scores: application.scores,
        status: application.status,
        skillAnalysis: application.skillAnalysis,
        insights: application.aiInsights,
        rank: application.rank,
        percentile: application.percentile
      }
    });
  } catch (error) {
    console.error('Submit assessment error:', error);
    next(error);
  }
};

// Helper function to update leaderboard
async function updateLeaderboard(jobId) {
  try {
    const applications = await Application.find({
      jobId,
      status: { $in: ['completed', 'qualified', 'rejected', 'flagged'] }
    })
      .sort({ 'scores.overall.weightedScore': -1 })
      .select('candidateId scores.overall.weightedScore status');

    const rankings = applications.map((app, index) => ({
      applicationId: app._id,
      candidateId: app.candidateId,
      rank: index + 1,
      score: app.scores.overall.weightedScore,
      percentile: Math.round(((applications.length - index) / applications.length) * 100),
      status: app.status
    }));

    // Update ranks in applications
    const updatePromises = rankings.map((ranking, index) =>
      Application.findByIdAndUpdate(ranking.applicationId, {
        rank: index + 1,
        percentile: ranking.percentile
      })
    );

    await Promise.all(updatePromises);

    await Leaderboard.findOneAndUpdate(
      { jobId },
      { rankings, lastUpdated: new Date() },
      { upsert: true }
    );

    console.log('✅ Leaderboard updated successfully');
  } catch (error) {
    console.error('❌ Leaderboard update error:', error);
  }
}

exports.getApplications = async (req, res, next) => {
  try {
    // Check if user is a recruiter
    if (req.user.role === 'recruiter') {
      // By default, show all applications globally for recruiters
      const applications = await Application.find()
        .populate('job', 'title status')
        .populate('assessment', 'title')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: applications.length,
        data: applications
      });
    }

    // Default: Candidate logic
    const candidate = await Candidate.findOne({ userId: req.user._id });

    if (!candidate) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const applications = await Application.find({ candidateId: candidate._id })
      .populate('jobId', 'title parsedData.domain status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

exports.getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('assessment')
      .populate({
        path: 'candidate',
        populate: { path: 'userId', select: 'email profile' }
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

exports.getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { status } = req.query;

    const filter = { jobId };
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .populate('candidateId')
      .populate({
        path: 'candidateId',
        populate: { path: 'userId', select: 'email profile' }
      })
      .sort({ 'scores.overall.weightedScore': -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

exports.trackProctoring = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { activityType, severity } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (activityType === 'tab-switch') {
      application.proctoring.tabSwitches += 1;
    }

    application.proctoring.suspiciousActivity.push({
      type: activityType,
      timestamp: new Date(),
      severity: severity || 'low'
    });

    if (application.proctoring.tabSwitches > 5) {
      application.proctoring.flaggedForReview = true;
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Activity tracked'
    });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

exports.bulkUpdate = async (req, res, next) => {
  try {
    const { applicationIds, status } = req.body;

    await Application.updateMany(
      { _id: { $in: applicationIds } },
      { $set: { status } }
    );

    res.status(200).json({
      success: true,
      message: 'Applications updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('assessmentId', 'title description')
      .select('scores skillAnalysis aiInsights timeSpent status createdAt');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

exports.downloadReport = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('candidateId')
      .populate('jobId')
      .populate('assessmentId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Return JSON data as a placeholder for report generation
    res.status(200).json({
      success: true,
      message: 'Report data retrieved successfully',
      data: {
        candidateName: application.candidateId?.userId?.name || 'Unknown',
        jobTitle: application.jobId?.title || 'Unknown Job',
        assessmentTitle: application.assessmentId?.title || 'Unknown Assessment',
        scores: application.scores,
        status: application.status,
        submittedAt: application.submittedAt
      }
    });
  } catch (error) {
    next(error);
  }
};
