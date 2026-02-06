// src/routes/candidate.routes.js
const express = require('express');
const router = express.Router();
const {
  uploadResume,
  getProfile,
  updateProfile
} = require('../controllers/candidate.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.use(authorize('candidate'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/upload-resume', uploadResume);

module.exports = router;
