const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

const applicationController = require('../controllers/application.controller');

// All routes require authentication
router.use(protect);

// Routes
router.post('/start/:jobId', applicationController.startAssessment);
router.post('/:applicationId/answer', applicationController.submitAnswer);
router.post('/:applicationId/submit', applicationController.submitAssessment);
router.get('/', applicationController.getApplications);
router.get('/job/:jobId', applicationController.getJobApplications);
router.get('/:id', applicationController.getApplicationById);
router.patch('/:id/status', applicationController.updateStatus); // Ensure this exists in controller or add it
router.post('/bulk-update', applicationController.bulkUpdate); // Ensure this exists or add it
router.get('/:id/analytics', applicationController.getAnalytics); // Ensure this exists or add it
router.get('/:id/report', applicationController.downloadReport); // Ensure this exists or add it

module.exports = router;
