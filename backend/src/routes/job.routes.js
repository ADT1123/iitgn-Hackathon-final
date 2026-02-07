const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const jobController = require('../controllers/job.controller');

// Verify controller methods exist
console.log('Job Controller methods:', Object.keys(jobController));

// All routes require authentication
router.use(protect);

// Parse JD route - MUST BE BEFORE /:id
router.post('/parse-jd', (req, res, next) => {
  console.log('Parse JD route hit');
  if (!jobController.parseJD) {
    console.error('parseJD method not found in controller!');
    return res.status(500).json({ success: false, message: 'parseJD not implemented' });
  }
  jobController.parseJD(req, res, next);
});

// Other routes
router.post('/', jobController.createJob);
router.get('/', jobController.getJobs);
router.get('/stats', jobController.getStats);
router.get('/:id', jobController.getJobById);
router.put('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

module.exports = router;
