// src/models/JobDescription.js
const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema({
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  rawDescription: {
    type: String,
    required: true
  },
  parsedData: {
    requiredSkills: [{
      skill: String,
      importance: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low']
      },
      weight: Number
    }],
    experienceLevel: {
      type: String,
      enum: ['fresher', 'junior', 'mid', 'senior', 'lead']
    },
    domain: String,
    responsibilities: [String],
    tools: [String],
    softSkills: [String]
  },
  assessmentConfig: {
    duration: {
      type: Number,
      default: 60
    },
    questionDistribution: {
      objective: { type: Number, default: 10 },
      subjective: { type: Number, default: 5 },
      programming: { type: Number, default: 3 }
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      default: 'mixed'
    },
    cutoffScore: {
      type: Number,
      default: 60
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'closed'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);
