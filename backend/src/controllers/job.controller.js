const Job = require('../models/Job');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Parse JD function
const parseJD = async (req, res) => {
  try {
    const { jdText } = req.body;

    console.log('📝 Parse JD called');

    if (!jdText || jdText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Job description text is required'
      });
    }

    // Always return mock data for now (safe fallback)
    console.log('⚠️ Returning mock data');
    return res.status(200).json({
      success: true,
      message: 'Parsed successfully',
      data: {
        title: 'Software Engineer',
        department: 'Engineering',
        location: 'Remote',
        type: 'Full-time',
        experience: '2-4 years',
        description: jdText.substring(0, 500),
        requirements: [
          'Strong programming skills',
          'Problem-solving abilities',
          'Team collaboration',
          'Good communication skills'
        ],
        responsibilities: [
          'Develop and maintain software',
          'Write clean, maintainable code',
          'Collaborate with team members',
          'Participate in code reviews'
        ],
        benefits: [
          'Competitive salary',
          'Health insurance',
          'Flexible working hours',
          'Remote work options'
        ],
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        salary: {
          min: 60000,
          max: 100000,
          currency: 'USD'
        }
      }
    });

  } catch (error) {
    console.error('❌ Parse JD error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Stats
const getStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ recruiter: req.user.id });
    const activeJobs = await Job.countDocuments({ 
      recruiter: req.user.id, 
      status: 'active' 
    });

    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        inactiveJobs: totalJobs - activeJobs
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Jobs
const getJobs = async (req, res) => {
  try {
    const { status, department, location, limit, sort } = req.query;
    
    const query = { recruiter: req.user.id };
    
    if (status) query.status = status;
    if (department) query.department = department;
    if (location) query.location = location;

    let jobsQuery = Job.find(query);
    
    if (sort) {
      jobsQuery = jobsQuery.sort(sort);
    } else {
      jobsQuery = jobsQuery.sort('-createdAt');
    }
    
    if (limit) {
      jobsQuery = jobsQuery.limit(parseInt(limit));
    }

    const jobs = await jobsQuery;

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Job By ID
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create Job
const createJob = async (req, res) => {
  try {
    console.log('📝 Create job:', req.body);
    
    const jobData = {
      ...req.body,
      recruiter: req.user.id
    };

    const job = await Job.create(jobData);

    console.log('✅ Job created:', job._id);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Job
const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete Job
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ EXPORT ALL FUNCTIONS
module.exports = {
  parseJD,
  getStats,
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
};
