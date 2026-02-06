// src/controllers/job.controller.js
const JobDescription = require('../models/JobDescription');
const Assessment = require('../models/Assessment');
const GeminiService = require('../services/gemini.service');

exports.createJob = async (req, res, next) => {
  try {
    const { title, rawDescription, assessmentConfig } = req.body;

    console.log('🔍 Parsing job description with Gemini AI...');
    const parsedData = await GeminiService.parseJobDescription(rawDescription);

    const job = await JobDescription.create({
      recruiterId: req.user._id,
      title,
      rawDescription,
      parsedData,
      assessmentConfig: assessmentConfig || {
        duration: 60,
        questionDistribution: {
          objective: 10,
          subjective: 5,
          programming: 3
        },
        difficulty: 'mixed',
        cutoffScore: 60
      }
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    console.error('Create job error:', error);
    next(error);
  }
};

exports.generateAssessment = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    
    const job = await JobDescription.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    console.log('🤖 Generating AI-powered assessment...');
    const questions = [];
    const { parsedData, assessmentConfig } = job;

    // Generate objective questions
    const topSkills = parsedData.requiredSkills.slice(0, 3);
    for (const skillObj of topSkills) {
      const difficulty = skillObj.importance === 'critical' ? 'hard' : 
                        skillObj.importance === 'high' ? 'medium' : 'easy';
      
      const objQuestions = await GeminiService.generateObjectiveQuestions(
        skillObj.skill,
        difficulty,
        Math.ceil(assessmentConfig.questionDistribution.objective / topSkills.length)
      );

      questions.push(...objQuestions.map(q => ({
        ...q,
        type: 'objective',
        skillMapping: skillObj.skill,
        weight: 10
      })));
    }

    // Generate subjective questions
    const subjSkills = parsedData.requiredSkills.slice(0, 2);
    for (const skillObj of subjSkills) {
      const subjQuestions = await GeminiService.generateSubjectiveQuestions(
        skillObj.skill,
        'medium',
        Math.ceil(assessmentConfig.questionDistribution.subjective / subjSkills.length)
      );

      questions.push(...subjQuestions.map(q => ({
        ...q,
        type: 'subjective',
        skillMapping: skillObj.skill,
        weight: 10
      })));
    }

    // Generate programming questions
    if (parsedData.requiredSkills.length > 0) {
      const progQuestions = await GeminiService.generateProgrammingQuestions(
        parsedData.requiredSkills[0].skill,
        'medium',
        assessmentConfig.questionDistribution.programming
      );

      questions.push(...progQuestions.map(q => ({
        ...q,
        type: 'programming',
        skillMapping: parsedData.requiredSkills[0].skill,
        weight: 20
      })));
    }

    const assessment = await Assessment.create({
      jobId,
      questions
    });

    res.status(201).json({
      success: true,
      message: 'Assessment generated successfully',
      data: assessment
    });
  } catch (error) {
    console.error('Generate assessment error:', error);
    next(error);
  }
};

exports.getJobs = async (req, res, next) => {
  try {
    const filter = req.user.role === 'recruiter' 
      ? { recruiterId: req.user._id }
      : { status: 'active' };

    const jobs = await JobDescription.find(filter)
      .populate('recruiterId', 'profile.company profile.firstName profile.lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

exports.getJobById = async (req, res, next) => {
  try {
    const job = await JobDescription.findById(req.params.id)
      .populate('recruiterId', 'profile.company');
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    const job = await JobDescription.findOneAndUpdate(
      { _id: req.params.id, recruiterId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const job = await JobDescription.findOneAndDelete({
      _id: req.params.id,
      recruiterId: req.user._id
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }

    // Delete associated assessments
    await Assessment.deleteMany({ jobId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
