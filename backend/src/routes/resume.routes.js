// backend/routes/resumeRoutes.js - COMPLETE FIXED VERSION
const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume.controller');
const { protect } = require('../middleware/auth.middleware');

// Configure multer for file upload
const multer = require('multer');
const storage = multer.memoryStorage();

const uploadMiddleware = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF, DOC, DOCX
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
    }
  }
});

// ✅ Single resume screening (expects jobId in body)
router.post(
  '/screen', 
  protect, 
  uploadMiddleware.single('resume'), 
  resumeController.screenResume
);

// ✅ Bulk resume screening (expects jobId in body)
router.post(
  '/bulk-screen', 
  protect, 
  uploadMiddleware.array('resumes', 10), // Max 10 files
  resumeController.bulkScreenResumes
);

// ✅ Get eligibility report (if you have this endpoint)
router.get(
  '/:applicationId/eligibility-report',
  protect,
  resumeController.getEligibilityReport
);

// ✅ Check skill mismatch (if you have this endpoint)
router.post(
  '/:applicationId/check-mismatch',
  protect,
  resumeController.checkSkillMismatch
);

// ✅ Error handling middleware for multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum 10MB allowed.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed.'
      });
    }
  }
  
  if (error.message === 'Only PDF, DOC, and DOCX files are allowed') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

module.exports = router;
