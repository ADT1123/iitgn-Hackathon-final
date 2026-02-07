const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const assessmentController = require('../controllers/assessment.controller');

// Public routes (no auth required)
router.get('/public/:link', assessmentController.getPublicAssessment);
router.post('/public/:link/submit', assessmentController.submitCandidateAssessment);

// Protected routes (require authentication)
router.use(protect);

router.get('/', assessmentController.getAssessments);
router.get('/:id', assessmentController.getAssessmentById);
router.post('/generate', assessmentController.generateQuestions);
router.put('/:id', assessmentController.updateAssessment);
router.delete('/:id', assessmentController.deleteAssessment);
router.patch('/:id/toggle-link', assessmentController.toggleLinkStatus);

module.exports = router;
