const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const upload = require('../config/multer');
const resumeController = require('../controllers/resume.controller');

// All routes require authentication
router.use(protect);

// Upload and screen single resume
router.post(
  '/screen',
  upload.single('resume'),
  resumeController.uploadAndScreenResume
);

// Bulk screen resumes
router.post(
  '/bulk-screen',
  upload.array('resumes', 50),
  resumeController.bulkScreenResumes
);

// Get eligibility report
router.get(
  '/:id/eligibility-report',
  resumeController.getEligibilityReport
);

// Check skill mismatch (call after assessment)
router.post(
  '/:id/check-mismatch',
  resumeController.checkSkillMismatch
);

module.exports = router;
