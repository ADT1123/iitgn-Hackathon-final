// backend/controllers/resume.controller.js
const resumeService = require('../services/resume.service');
const Job = require('../models/Job');

// ✅ Single resume screening
exports.screenResume = async (req, res) => {
  try {
    console.log('=== RESUME SCREENING REQUEST ===');
    console.log('File received:', req.file ? 'YES' : 'NO');
    if (req.file) {
      console.log('File details:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    }
    console.log('Request body:', req.body);
    console.log('================================');

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded'
      });
    }

    // Get jobId or jobDescription from request body
    const { jobId, jobDescription: rawJobDescription } = req.body;

    let finalJobDescription = '';
    let jobTitle = 'Custom Analysis';
    let mongoJobId = null;

    if (jobId) {
      // Fetch job from database if jobId is provided
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }
      mongoJobId = job._id;
      jobTitle = job.title;
      finalJobDescription = `
Job Title: ${job.title}
Department: ${job.department || 'N/A'}
Experience Level: ${job.experienceLevel || 'N/A'}
Description: ${job.description || 'N/A'}
Required Skills: ${job.requiredSkills?.join(', ') || 'N/A'}
      `.trim();
    } else if (rawJobDescription) {
      finalJobDescription = rawJobDescription;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Job ID or Job Description is required'
      });
    }

    console.log('Analyzing resume:', req.file.originalname);

    // Call resume service
    const analysis = await resumeService.analyzeResume(
      req.file.buffer,
      finalJobDescription,
      req.file.originalname
    );

    // Return response
    res.status(200).json({
      success: true,
      data: {
        filename: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        jobTitle: jobTitle,
        jobId: mongoJobId,
        analysis: analysis
      }
    });

  } catch (error) {
    console.error('=== RESUME SCREENING ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', error);
    console.error('==============================');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to screen resume'
    });
  }
};

// ✅ Bulk screening
exports.bulkScreenResumes = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No resume files uploaded'
      });
    }

    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    console.log(`Bulk screening ${req.files.length} resumes...`);

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const jobDescription = `
Job Title: ${job.title}
Department: ${job.department || 'N/A'}
Description: ${job.description || 'N/A'}
Required Skills: ${job.requiredSkills?.join(', ') || 'N/A'}
    `.trim();

    // Process all resumes
    const results = await Promise.all(
      req.files.map(async (file) => {
        try {
          const analysis = await resumeService.analyzeResume(
            file.buffer,
            jobDescription
          );
          return {
            filename: file.originalname,
            fileSize: file.size,
            success: true,
            analysis: analysis
          };
        } catch (error) {
          console.error(`Failed to analyze ${file.originalname}:`, error);
          return {
            filename: file.originalname,
            success: false,
            error: error.message
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      data: {
        jobTitle: job.title,
        jobId: job._id,
        totalFiles: req.files.length,
        results: results
      }
    });

  } catch (error) {
    console.error('Bulk screening error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to screen resumes'
    });
  }
};

// ✅ Get eligibility report (optional - if needed)
exports.getEligibilityReport = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Fetch application with resume analysis
    const Application = require('../models/Application');
    const application = await Application.findById(applicationId)
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
        jobTitle: application.job?.title,
        resumeAnalysis: application.resumeAnalysis,
        eligibilityScore: application.eligibilityScore || 0
      }
    });

  } catch (error) {
    console.error('Get eligibility report error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ Check skill mismatch (optional - if needed)
exports.checkSkillMismatch = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const Application = require('../models/Application');
    const application = await Application.findById(applicationId)
      .populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const mismatches = application.resumeAnalysis?.missingSkills || [];

    res.status(200).json({
      success: true,
      data: {
        hasMismatch: mismatches.length > 0,
        missingSkills: mismatches,
        matchedSkills: application.resumeAnalysis?.matchedSkills || []
      }
    });

  } catch (error) {
    console.error('Check skill mismatch error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
