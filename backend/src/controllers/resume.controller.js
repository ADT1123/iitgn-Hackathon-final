
const resumeService = require('../services/resume.service');

exports.screenResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded'
      });
    }

    const { jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Job description is required'
      });
    }

    console.log('Analyzing resume...');
    const analysis = await resumeService.analyzeResume(req.file.buffer, jobDescription);

    res.status(200).json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Screening error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
