// src/routes/proctoring.routes.js
// Routes for Anti-Bot, Proctoring, and Plagiarism APIs

const express = require('express');
const router = express.Router();
const proctoringController = require('../controllers/proctoring.controller');
const { protect, optionalAuth } = require('../middleware/auth');

// Bot Analysis (FEATURE 9)
router.get('/analysis/:applicationId', protect, proctoringController.analyzeSubmission);
router.get('/bulk-analysis/:jobId', protect, proctoringController.getBulkIntegrityAnalysis);

// Activity Tracking (FEATURE 10)
router.post('/activity/:applicationId', optionalAuth, proctoringController.trackActivity);
router.get('/time-analysis/:applicationId', protect, proctoringController.getTimeAnalysis);
router.get('/report/:applicationId', protect, proctoringController.getProctoringReport);

// Plagiarism Detection (FEATURE 6)
router.post('/plagiarism/check', protect, proctoringController.checkCodePlagiarism);
router.post('/plagiarism/batch', protect, proctoringController.batchCheckPlagiarism);

// Integrity Summary
router.get('/integrity/:applicationId', protect, proctoringController.getCandidateIntegrity);

module.exports = router;
