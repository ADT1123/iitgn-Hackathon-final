// src/routes/job.routes.js
const express = require('express');
const router = express.Router();
const {
  createJob,
  generateAssessment,
  getJobs,
  getJobById,
  updateJob,
  deleteJob
} = require('../controllers/job.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.route('/')
  .get(protect, getJobs)
  .post(protect, authorize('recruiter', 'admin'), createJob);

router.route('/:id')
  .get(protect, getJobById)
  .put(protect, authorize('recruiter', 'admin'), updateJob)
  .delete(protect, authorize('recruiter', 'admin'), deleteJob);

router.post('/:jobId/generate-assessment', protect, authorize('recruiter', 'admin'), generateAssessment);

module.exports = router;
