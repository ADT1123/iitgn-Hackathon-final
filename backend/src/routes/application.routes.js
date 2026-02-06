// src/routes/application.routes.js
const express = require('express');
const router = express.Router();
const {
  startAssessment,
  submitAnswer,
  submitAssessment,
  getApplications,
  getApplicationById,
  getJobApplications,
  trackProctoring
} = require('../controllers/application.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/start/:jobId', protect, authorize('candidate'), startAssessment);
router.post('/:applicationId/submit-answer', protect, authorize('candidate'), submitAnswer);
router.post('/:applicationId/submit', protect, authorize('candidate'), submitAssessment);
router.post('/:applicationId/proctor', protect, authorize('candidate'), trackProctoring);

router.get('/', protect, authorize('candidate'), getApplications);
router.get('/:id', protect, getApplicationById);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getJobApplications);

module.exports = router;
