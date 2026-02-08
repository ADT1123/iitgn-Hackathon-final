const Job = require('../models/Job');
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

    console.log('📝 Parse JD called');

    if (!jdText || jdText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Job description text is required'
      });
    }

    // Check if Gemini API is available
    if (!genAI) {
      console.warn('⚠️ Gemini API not configured, returning basic extraction');
      // Fallback: basic text extraction without AI
      return res.status(200).json({
        success: true,
        message: 'Parsed with basic extraction (AI not configured)',
        data: extractBasicInfo(jdText)
      });
    }

    console.log('🤖 Using Gemini AI to parse JD...');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze this job description and extract structured information. Return ONLY valid JSON, no markdown code blocks, no extra text.

Job Description:
${jdText}

Return this exact JSON structure (fill in based on the JD content, use "Not Specified" for missing fields):
{
  "title": "extracted job title",
  "department": "department name like Engineering, Marketing, HR, Sales, etc.",
  "location": "location or Remote",
  "type": "Full-time, Part-time, Contract, or Internship",
  "experience": "experience requirement like 0-2 years, 2-4 years, etc.",
  "description": "brief 2-3 sentence summary of the role",
  "requirements": ["requirement 1", "requirement 2", "requirement 3"],
  "responsibilities": ["responsibility 1", "responsibility 2", "responsibility 3"],
  "benefits": ["benefit 1", "benefit 2"],
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "salary": {
    "min": 0,
    "max": 0,
    "currency": "USD"
  }
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    console.log('📄 Gemini raw response length:', text.length);

    // Clean the response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ JSON parse error, attempting to extract:', parseError.message);
      // Try to find JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }

    console.log('✅ JD parsed successfully with AI:', parsedData.title);

    return res.status(200).json({
      success: true,
      message: 'Parsed successfully with AI',
      data: parsedData
    });

  } catch (error) {
    console.error('❌ Parse JD error:', error);

    // Fallback to basic extraction on AI error
    if (req.body.jdText) {
      console.log('⚠️ Falling back to basic extraction');
      return res.status(200).json({
        success: true,
        message: 'Parsed with basic extraction (AI error: ' + error.message + ')',
        data: extractBasicInfo(req.body.jdText)
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
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

    const query = {};

    // Only filter by recruiter if specifically requested, otherwise show all
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
