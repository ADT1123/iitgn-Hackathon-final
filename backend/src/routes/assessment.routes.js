const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const assessmentController = require('../controllers/assessment.controller');

// All routes require authentication
router.use(protect);

router.get('/', assessmentController.getAssessments);
router.get('/:id', assessmentController.getAssessmentById);
router.post('/generate', assessmentController.generateQuestions);
router.put('/:id', assessmentController.updateAssessment);
router.delete('/:id', assessmentController.deleteAssessment);

module.exports = router;
