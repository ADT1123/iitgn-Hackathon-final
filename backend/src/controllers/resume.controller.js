const Application = require('../models/Application');
const Job = require('../models/Job');
const path = require('path');
const fs = require('fs').promises;

// Upload and screen resume (SIMPLIFIED)
exports.uploadAndScreenResume = async (req, res) => {
  try {
    console.log('📄 Resume screening started');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    const { jobId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF resume'
      });
    }

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    console.log('🔍 Getting job details...');
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    console.log('✅ Job found:', job.title);

    // Mock resume data (skip AI parsing for now)
    const resumeData = {
      name: file.originalname.replace('.pdf', '').replace(/-|_/g, ' '),
      email: `candidate-${Date.now()}@temp.com`,
      phone: '1234567890',
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: [],
      education: [],
      totalExperience: 3,
      summary: 'Experienced developer'
    };

    console.log('📊 Checking eligibility...');

    // Simple eligibility check
    const requiredSkills = job.skills || [];
    const candidateSkills = resumeData.skills || [];
    
    const matchedSkills = candidateSkills.filter(skill => 
      requiredSkills.some(req => 
        req.toLowerCase().includes(skill.toLowerCase())
      )
    );

    const skillMatchPercentage = requiredSkills.length > 0
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
      : 70;

    const isEligible = skillMatchPercentage >= 50;

    const eligibility = {
      isEligible,
      skillMatchPercentage,
      matchedSkills,
      missingSkills: requiredSkills.filter(skill => 
        !matchedSkills.some(matched => matched.toLowerCase().includes(skill.toLowerCase()))
      ),
      experienceMatch: true,
      requiredExperience: 2,
      candidateExperience: resumeData.totalExperience,
      overallScore: skillMatchPercentage
    };

    const report = {
      summary: `Candidate has ${skillMatchPercentage}% skill match with job requirements.`,
      strengths: matchedSkills,
      gaps: eligibility.missingSkills,
      recommendation: isEligible ? 'Proceed with interview' : 'Does not meet requirements',
      detailedAnalysis: `The candidate shows proficiency in ${matchedSkills.length} out of ${requiredSkills.length} required skills.`,
      nextSteps: isEligible ? ['Schedule interview', 'Send assessment'] : ['Reject application']
    };

    console.log('💾 Creating application...');

    // Create application
    const application = await Application.create({
      job: jobId,
      assessment: job.assessment,
      candidateName: resumeData.name,
      candidateEmail: resumeData.email,
      phone: resumeData.phone,
      resume: file.path,
      resumeData,
      eligibilityCheck: {
        ...eligibility,
        report
      },
      status: isEligible ? 'pending' : 'rejected',
      autoEvaluated: true
    });

    console.log(`✅ Application created: ${application._id}`);

    res.status(200).json({
      success: true,
      message: isEligible 
        ? '✅ Candidate is eligible! Application created.'
        : '❌ Candidate does not meet minimum requirements.',
      data: {
        application: application._id,
        candidateName: resumeData.name,
        eligibility,
        report,
        resumeData
      }
    });

  } catch (error) {
    console.error('❌ Resume screening error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to screen resume',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get eligibility report
exports.getEligibilityReport = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        candidateName: application.candidateName,
        jobTitle: application.job.title,
        eligibility: application.eligibilityCheck,
        resumeData: application.resumeData
      }
    });

  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Bulk resume screening
exports.bulkScreenResumes = async (req, res) => {
  try {
    const { jobId } = req.body;
    const files = req.files;

    console.log(`📦 Bulk screening ${files?.length || 0} resumes...`);

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one resume'
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const results = [];
    const requiredSkills = job.skills || [];

    for (const file of files) {
      try {
        // Mock data for each resume
        const resumeData = {
          name: file.originalname.replace('.pdf', '').replace(/-|_/g, ' '),
          email: `${file.originalname.split('.')[0]}@temp.com`,
          phone: '1234567890',
          skills: ['JavaScript', 'React', 'Node.js'],
          totalExperience: Math.floor(Math.random() * 5) + 1
        };

        const matchedSkills = resumeData.skills.filter(skill => 
          requiredSkills.some(req => req.toLowerCase().includes(skill.toLowerCase()))
        );

        const skillMatchPercentage = requiredSkills.length > 0
          ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
          : 60;

        const isEligible = skillMatchPercentage >= 50;

        const eligibility = {
          isEligible,
          skillMatchPercentage,
          matchedSkills,
          missingSkills: requiredSkills.filter(skill => 
            !matchedSkills.some(m => m.toLowerCase().includes(skill.toLowerCase()))
          ),
          overallScore: skillMatchPercentage
        };

        const application = await Application.create({
          job: jobId,
          assessment: job.assessment,
          candidateName: resumeData.name,
          candidateEmail: resumeData.email,
          phone: resumeData.phone,
          resume: file.path,
          resumeData,
          eligibilityCheck: eligibility,
          status: isEligible ? 'pending' : 'rejected',
          autoEvaluated: true
        });

        results.push({
          fileName: file.originalname,
          candidateName: resumeData.name,
          isEligible,
          skillMatch: skillMatchPercentage,
          applicationId: application._id
        });

      } catch (error) {
        console.error(`Error processing ${file.originalname}:`, error);
        results.push({
          fileName: file.originalname,
          error: error.message
        });
      }
    }

    const eligibleCount = results.filter(r => r.isEligible).length;

    console.log(`✅ Screened ${files.length} resumes: ${eligibleCount} eligible`);

    res.status(200).json({
      success: true,
      message: `Screened ${files.length} resumes. ${eligibleCount} eligible.`,
      data: {
        total: files.length,
        eligible: eligibleCount,
        rejected: files.length - eligibleCount,
        results
      }
    });

  } catch (error) {
    console.error('Bulk screening error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Check skill mismatch
exports.checkSkillMismatch = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('assessment');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const mismatchAnalysis = {
      hasMismatch: false,
      mismatches: [],
      credibilityScore: 100
    };

    res.status(200).json({
      success: true,
      data: mismatchAnalysis
    });

  } catch (error) {
    console.error('Skill mismatch check error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  uploadAndScreenResume: exports.uploadAndScreenResume,
  getEligibilityReport: exports.getEligibilityReport,
  bulkScreenResumes: exports.bulkScreenResumes,
  checkSkillMismatch: exports.checkSkillMismatch
};
