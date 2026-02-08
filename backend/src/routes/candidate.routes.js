// src/routes/candidate.routes.js
const express = require('express');
const router = express.Router();
const {
  uploadResume,
  getProfile,
  updateProfile,
  getCandidates,
  deleteCandidate
} = require('../controllers/candidate.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

// Recruiter specific routes
router.get('/all', authorize('recruiter'), getCandidates);
router.delete('/:id', authorize('recruiter'), deleteCandidate);
router.put('/profile/:id', authorize('recruiter'), updateProfile);
router.get('/profile/:id', authorize('recruiter'), getProfile);

// Common/Candidate routes
router.get('/profile', getProfile); // Get own profile
router.put('/profile', authorize('candidate'), updateProfile);
router.post('/upload-resume', authorize('candidate'), uploadResume);

module.exports = router;
