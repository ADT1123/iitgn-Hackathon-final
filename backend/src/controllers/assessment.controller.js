const Assessment = require('../models/Assessment');
const Job = require('../models/Job');
const Application = require('../models/Application');
const sarvamService = require('../services/sarvam.service');
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Get all assessments
exports.getAssessments = async (req, res) => {
  try {
    // Show all assessments globally for recruiters
    const assessments = await Assessment.find()
      .populate('job', 'title department location')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: assessments.length,
      data: assessments
    });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get assessment by ID with applications
exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('job')
      .populate('recruiter', 'firstName lastName email');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Get all applications for this assessment
    const applications = await Application.find({ assessment: req.params.id })
      .sort('-totalScore');

    // Calculate statistics
    const stats = {
      totalApplications: applications.length,
      completed: applications.filter(a => a.status === 'completed' || a.status === 'shortlisted' || a.status === 'rejected').length,
      shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
      averageScore: applications.length > 0
        ? Math.round(applications.reduce((sum, a) => sum + (a.totalScore || 0), 0) / applications.length)
        : 0,
      highestScore: applications.length > 0
        ? Math.max(...applications.map(a => a.totalScore || 0))
        : 0
    };

    res.status(200).json({
      success: true,
      data: {
        assessment,
        applications,
        stats
      }
    });
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const geminiService = require('../services/gemini.service');

// Generate questions with Recruiter AI
exports.generateQuestions = async (req, res) => {
  try {
    const {
      jobId,
      objectiveCount = 5,
      subjectiveCount = 2,
      codingCount = 1,
      duration = 60,
      difficulty = 'medium',
      title: customTitle
    } = req.body;

    console.log('🚀 Sarvam Assessment Generation started for Job:', jobId);

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Use Sarvam to generate questions
    const counts = { objective: objectiveCount, subjective: subjectiveCount, coding: codingCount };
    const aiResponse = await sarvamService.generateQuestions(job, counts, difficulty);

    const questions = aiResponse.questions || [];

    if (questions.length === 0) {
      throw new Error('AI failed to generate any questions. Please try again.');
    }

    console.log(`✅ Generated ${questions.length} questions successfully with AI`);

    // Create assessment
    const assessment = await Assessment.create({
      job: jobId,
      recruiter: req.user.id,
      title: customTitle || `${job.title} AI Assessment`,
      duration: duration,
      totalQuestions: questions.length,
      questions,
      passingScore: 60,
      status: 'published'
    });

    // Link to job
    job.assessment = assessment._id;
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Recruiter AI Assessment generated successfully',
      data: assessment
    });

  } catch (error) {
    console.error('❌ Sarvam Assessment Generation Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate AI assessment'
    });
  }
};

// Get public assessment by link (for candidates)
exports.getPublicAssessment = async (req, res) => {
  try {
    const { link } = req.params;

    const assessment = await Assessment.findOne({ uniqueLink: link })
      .populate('job', 'title department location company');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    if (!assessment.linkActive) {
      return res.status(403).json({
        success: false,
        message: 'This assessment link is no longer active'
      });
    }

    // Remove correct answers from questions
    const publicQuestions = assessment.questions.map(q => ({
      _id: q._id,
      type: q.type,
      question: q.question,
      options: q.options,
      points: q.points,
      difficulty: q.difficulty,
      skill: q.skill
    }));

    res.status(200).json({
      success: true,
      data: {
        _id: assessment._id,
        title: assessment.title,
        duration: assessment.duration,
        totalQuestions: assessment.totalQuestions,
        passingScore: assessment.passingScore,
        job: assessment.job,
        questions: publicQuestions
      }
    });
  } catch (error) {
    console.error('Get public assessment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Submit candidate assessment
exports.submitCandidateAssessment = async (req, res) => {
  try {
    const { link } = req.params;
    const { candidateName, candidateEmail, phone, answers } = req.body;

    console.log('Candidate submission for link:', link);

    const assessment = await Assessment.findOne({ uniqueLink: link })
      .populate('job');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    const evaluationPromises = answers.map(async (answer) => {
      const question = assessment.questions.id(answer.questionId);
      if (!question) return null;

      let score = 0;
      let aiEvaluation = null;
      const isObjective = question.type === 'objective';

      if (isObjective) {
        score = answer.answer === question.correctAnswer ? question.points : 0;
      } else {
        // Use Recruiter AI for real-time evaluation of subjective/coding
        try {
          const evalResult = await sarvamService.evaluateAnswer(question.question, answer.answer, question.points);
          score = evalResult.score;
          aiEvaluation = {
            feedback: evalResult.feedback,
            strengths: evalResult.strengths,
            improvements: evalResult.weaknesses,
            confidence: 0.9
          };
        } catch (e) {
          console.warn('Real-time AI evaluation failed, using fallback:', e.message);
          score = question.points * 0.5; // Neutral fallback
        }
      }

      return {
        questionId: answer.questionId,
        questionType: question.type,
        answer: answer.answer,
        isCorrect: isObjective ? (answer.answer === question.correctAnswer) : null,
        score,
        maxScore: question.points,
        timeTaken: answer.timeTaken,
        aiEvaluation
      };
    });

    const evaluatedAnswers = (await Promise.all(evaluationPromises)).filter(Boolean);

    let totalScore = 0;
    let maxScore = 0;

    evaluatedAnswers.forEach(ans => {
      totalScore += ans.score;
      maxScore += ans.maxScore;
    });

    const totalPercentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Determine status
    let status = 'completed';
    if (totalPercentage >= (assessment.job.qualificationCriteria?.minimumScore || 60)) {
      status = 'shortlisted';
    } else if (totalPercentage < (assessment.job.qualificationCriteria?.autoRejectBelow || 40)) {
      status = 'rejected';
    }

    // Create application
    let application;
    try {
      application = await Application.create({
        job: assessment.job._id,
        assessment: assessment._id,
        candidateName,
        candidateEmail,
        phone,
        answers: evaluatedAnswers,
        totalScore: totalPercentage,
        status,
        autoEvaluated: true,
        completedAt: new Date()
      });
    } catch (createErr) {
      if (createErr.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'You have already submitted an application for this position.'
        });
      }
      throw createErr;
    }

    // Update assessment stats
    assessment.totalAttempts += 1;
    assessment.completedAttempts += 1;
    await assessment.save();

    console.log(`Application created: ${application._id}, Score: ${totalPercentage}%`);

    res.status(200).json({
      success: true,
      message: 'Assessment submitted successfully',
      data: {
        applicationId: application._id,
        totalScore: totalPercentage,
        status,
        feedback: totalPercentage >= 60
          ? 'Great job! Your performance meets our requirements.'
          : 'Thank you for your submission. We will review your application.'
      }
    });

  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update assessment
exports.updateAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete assessment
exports.deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Assessment deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toggle link status
exports.toggleLinkStatus = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    assessment.linkActive = !assessment.linkActive;
    await assessment.save();

    res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAssessments: exports.getAssessments,
  getAssessmentById: exports.getAssessmentById,
  generateQuestions: exports.generateQuestions,
  getPublicAssessment: exports.getPublicAssessment,
  submitCandidateAssessment: exports.submitCandidateAssessment,
  updateAssessment: exports.updateAssessment,
  deleteAssessment: exports.deleteAssessment,
  toggleLinkStatus: exports.toggleLinkStatus
};
