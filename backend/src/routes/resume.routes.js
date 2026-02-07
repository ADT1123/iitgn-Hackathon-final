
const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume.controller');

const { protect } = require('../middleware/auth.middleware');

// Use multer if upload middleware not standard
const multer = require('multer');
const storage = multer.memoryStorage();
const uploadMiddleware = multer({ storage: storage });

router.post('/screen', protect, uploadMiddleware.single('resume'), resumeController.screenResume);

module.exports = router;
