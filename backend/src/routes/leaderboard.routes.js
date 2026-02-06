// src/routes/leaderboard.routes.js
const express = require('express');
const router = express.Router();
const {
  getLeaderboard,
  getCandidateRank
} = require('../controllers/leaderboard.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/:jobId', protect, getLeaderboard);
router.get('/:jobId/candidate/:candidateId', protect, getCandidateRank);

module.exports = router;
