// src/routes/assessment.routes.js
const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const { protect } = require('../middleware/auth.middleware');

router.get('/:jobId', protect, async (req, res, next) => {
  try {
    const assessment = await Assessment.findOne({ jobId: req.params.jobId });
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
