// src/routes/analytics.routes.js
// Routes for Analytics, Leaderboard, Reports, and Export APIs

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth');

// Dashboard Stats (FEATURE 13)
router.get('/dashboard', protect, analyticsController.getDashboardStats);

// Job Analytics (FEATURE 13)
router.get('/jobs/:jobId', protect, analyticsController.getJobAnalytics);

// Skill Gap Analysis (FEATURE 15)
router.get('/jobs/:jobId/skill-gap', protect, analyticsController.getSkillGapAnalysis);
router.get('/candidates/:applicationId/skill-gap', protect, analyticsController.getCandidateSkillGap);

// Section Breakdown (FEATURE 18)
router.get('/candidates/:applicationId/sections', protect, analyticsController.getSectionBreakdown);

// Reports (FEATURE 11)
router.get('/candidates/:applicationId/report', protect, analyticsController.generateCandidateReport);
router.get('/jobs/:jobId/bulk-report', protect, analyticsController.generateBulkReport);

// Exports (FEATURE 12)
router.get('/export/:jobId', protect, analyticsController.exportJobData);
router.get('/export/:jobId/ats', protect, analyticsController.exportForATS);

module.exports = router;
