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
      // Fallback: If not found by job, maybe jobId is actually assessmentId
      const assessmentById = await Assessment.findById(jobId);
      if (assessmentById) {
        return res.status(200).json({
          success: true,
          message: 'Found assessment by ID',
          data: {
            applicationId: null, // Need to handle creation below if needed
            questions: assessmentById.questions,
            duration: assessmentById.duration,
            jobTitle: assessmentById.title
          }
        });
      }

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
            duration: assessment.duration,
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

    const job = await Job.findById(jobId);

    res.status(200).json({
      success: true,
      message: 'Assessment started successfully',
      data: {
        applicationId: application._id,
        questions: sanitizedQuestions,
        duration: assessment.duration,
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

    const assessment = await Assessment.findById(application.assessment);
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
      .populate('assessment')
      .populate('candidate')
      .populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.status = 'completed';
    application.completedAt = new Date();

    // Calculate scores
    let totalScore = 0;
    let maxScore = 0;

    application.answers.forEach(answer => {
      totalScore += answer.score || 0;
      maxScore += answer.maxScore || 10;
    });

    application.totalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // AI evaluation logic
    try {
      const insights = await sarvamService.generateCandidateInsights(application);
      application.aiInsights = insights;
    } catch (err) {
      console.error('AI Insights generation error:', err);
    }

    // Check qualification
    const passingScore = application.assessment?.passingScore || 60;
    if (application.totalScore >= passingScore) {
      application.status = 'shortlisted';
    } else {
      application.status = 'rejected';
    }

    await application.save();

    // Update leaderboard
    if (application.job) {
      console.log('🏆 Updating leaderboard...');
      await updateLeaderboard(application.job._id);
    }

    res.status(200).json({
      success: true,
      message: 'Assessment submitted successfully',
      data: {
        applicationId: application._id,
        totalScore: application.totalScore,
        status: application.status,
        insights: application.aiInsights
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

    const applications = await Application.find({ candidate: candidate._id })
      .populate('job', 'title status')
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
        populate: { path: 'userId', select: 'email name profile' }
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
    const { jobId: job } = req.params;
    const { status } = req.query;

    const filter = { job };
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .populate('candidate')
      .populate({
        path: 'candidate',
        populate: { path: 'userId', select: 'email name profile' }
      })
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
      .populate('assessment', 'title description')
      .select('totalScore skillAnalysis aiInsights timeSpent status createdAt');

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
      .populate('candidate')
      .populate('job')
      .populate('assessment');

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
        candidateName: application.candidate?.userId?.name || 'Unknown',
        jobTitle: application.job?.title || 'Unknown Job',
        assessmentTitle: application.assessment?.title || 'Unknown Assessment',
        totalScore: application.totalScore,
        status: application.status,
        completedAt: application.completedAt
      }
    });
  } catch (error) {
    next(error);
  }
};
