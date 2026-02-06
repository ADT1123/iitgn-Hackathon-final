// src/controllers/candidate.controller.js
const Candidate = require('../models/Candidate');
const ResumeService = require('../services/resume.service');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
}).single('resume');

exports.uploadResume = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload a resume file'
        });
      }

      console.log('📄 Parsing resume...');
      const parsedData = await ResumeService.parseResume(req.file.buffer);

      const candidate = await Candidate.findOneAndUpdate(
        { userId: req.user._id },
        {
          resume: {
            fileName: req.file.originalname,
            fileUrl: `data:application/pdf;base64,${req.file.buffer.toString('base64')}`,
            parsedData,
            uploadedAt: new Date()
          }
        },
        { new: true, upsert: true }
      );

      res.status(200).json({
        success: true,
        message: 'Resume uploaded and parsed successfully',
        data: {
          parsedData: candidate.resume.parsedData
        }
      });
    } catch (error) {
      console.error('Resume upload error:', error);
      next(error);
    }
  });
};

exports.getProfile = async (req, res, next) => {
  try {
    const candidate = await Candidate.findOne({ userId: req.user._id })
      .populate('userId', 'email profile');

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const candidate = await Candidate.findOneAndUpdate(
      { userId: req.user._id },
      { $set: req.body },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    next(error);
  }
};
