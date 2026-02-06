// src/controllers/leaderboard.controller.js
const Leaderboard = require('../models/Leaderboard');
const Application = require('../models/Application');

exports.getLeaderboard = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { limit = 100 } = req.query;

    const leaderboard = await Leaderboard.findOne({ jobId })
      .populate({
        path: 'rankings.candidateId',
        populate: { path: 'userId', select: 'profile.firstName profile.lastName' }
      });

    if (!leaderboard) {
      return res.status(404).json({
        success: false,
        message: 'Leaderboard not found'
      });
    }

    const limitedRankings = leaderboard.rankings.slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        jobId: leaderboard.jobId,
        rankings: limitedRankings,
        totalCandidates: leaderboard.rankings.length,
        lastUpdated: leaderboard.lastUpdated
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getCandidateRank = async (req, res, next) => {
  try {
    const { jobId, candidateId } = req.params;

    const leaderboard = await Leaderboard.findOne({ jobId });
    if (!leaderboard) {
      return res.status(404).json({
        success: false,
        message: 'Leaderboard not found'
      });
    }

    const candidateRanking = leaderboard.rankings.find(
      r => r.candidateId.toString() === candidateId
    );

    if (!candidateRanking) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found in leaderboard'
      });
    }

    res.status(200).json({
      success: true,
      data: candidateRanking
    });
  } catch (error) {
    next(error);
  }
};
