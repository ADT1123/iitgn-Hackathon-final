const Job = require('../models/Job');
const sarvamService = require('../services/sarvam.service');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Parse JD function - Uses Gemini AI to parse job descriptions dynamically
const parseJD = async (req, res) => {
  try {
    const { jdText } = req.body;

    console.log('📝 Parse/Generate JD called with Sarvam');

    if (!jdText || jdText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Job description text or prompt is required'
      });
    }

    let parsedData;

    // If text is short, assume it's a prompt for generation
    if (jdText.trim().length < 50) {
      console.log('🤖 Generating full JD from prompt using Sarvam...');
      parsedData = await sarvamService.generateJD(jdText);
    } else {
      console.log('🤖 Parsing JD text using Sarvam...');
      const prompt = `Analyze this job description and extract structured information. Return ONLY valid JSON.
      
      Job Description:
      ${jdText}
      
      Return this exact JSON structure:
      {
        "title": "extracted job title",
        "department": "Engineering, Marketing, HR, Sales, etc.",
        "location": "location or Remote",
        "type": "Full-time, Part-time, Contract, or Internship",
        "experience": "e.g. 0-2 years, 2+ years",
        "description": "brief summary",
        "requirements": ["req1", "req2"],
        "responsibilities": ["resp1", "resp2"],
        "benefits": ["ben1", "ben2"],
        "skills": ["skill1", "skill2"],
        "salary": { "min": 0, "max": 0, "currency": "USD" }
      }`;
      parsedData = await sarvamService.getChatCompletion(prompt);
    }

    console.log('✅ JD processed successfully with Sarvam:', parsedData.title);

    return res.status(200).json({
      success: true,
      message: 'Processed successfully with Recruiter AI',
      data: parsedData
    });

  } catch (error) {
    console.error('❌ Parse JD error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process JD with AI'
    });
  }
};

// Helper function for basic text extraction without AI
function extractBasicInfo(jdText) {
  const text = jdText.toLowerCase();

  // Try to detect job type from text
  let type = 'Full-time';
  if (text.includes('part-time') || text.includes('part time')) type = 'Part-time';
  else if (text.includes('contract')) type = 'Contract';
  else if (text.includes('intern')) type = 'Internship';

  // Try to detect location
  let location = 'Not Specified';
  if (text.includes('remote')) location = 'Remote';
  else if (text.includes('hybrid')) location = 'Hybrid';
  else if (text.includes('on-site') || text.includes('onsite')) location = 'On-site';

  // Extract potential skills (common tech terms)
  const skillPatterns = [
    'javascript', 'python', 'java', 'react', 'node', 'angular', 'vue',
    'sql', 'mongodb', 'aws', 'docker', 'kubernetes', 'git', 'html', 'css',
    'typescript', 'golang', 'rust', 'c++', 'c#', '.net', 'php', 'ruby',
    'machine learning', 'ai', 'data science', 'excel', 'salesforce', 'sap',
    'marketing', 'sales', 'customer service', 'communication', 'leadership',
    'project management', 'agile', 'scrum', 'accounting', 'finance',
    'plumbing', 'electrical', 'carpentry', 'welding', 'hvac', 'construction',
    'driving', 'cdl', 'forklift', 'warehouse', 'logistics', 'supply chain'
  ];

  const foundSkills = skillPatterns.filter(skill => text.includes(skill));
  const skills = foundSkills.length > 0 ? foundSkills.slice(0, 6) : ['General Skills'];

  // Try to extract title (first line often is title)
  const lines = jdText.split('\n').filter(l => l.trim());
  let title = lines[0]?.substring(0, 100) || 'Position';
  // Clean up title
  title = title.replace(/^(job title|position|role|opening|hiring)[:.]?\s*/i, '').trim();
  if (title.length < 3) title = 'Position';

  return {
    title: title,
    department: 'General',
    location: location,
    type: type,
    experience: 'As per requirements',
    description: jdText.substring(0, 500),
    requirements: [
      'Relevant experience in the field',
      'Good communication skills',
      'Team player'
    ],
    responsibilities: [
      'Perform duties as per job requirements',
      'Collaborate with team members',
      'Meet performance targets'
    ],
    benefits: [
      'Competitive compensation',
      'Growth opportunities'
    ],
    skills: skills,
    salary: {
      min: 0,
      max: 0,
      currency: 'USD'
    }
  };
}

// Get Stats
const getStats = async (req, res) => {
  try {
    // Show global stats for all recruiters
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });

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

    const query = {};

    // By default, show all jobs globally.
    // Allow filtering by recruiter specifically if requested.
    if (req.query.recruiterId) {
      query.recruiter = req.query.recruiterId;
    }

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

    const jobs = await jobsQuery.populate('assessment', 'title duration');

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
