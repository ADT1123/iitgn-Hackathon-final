// src/models/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobDescription',
    required: true
  },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'qualified', 'rejected', 'flagged'],
    default: 'pending'
  },
  startedAt: Date,
  submittedAt: Date,
  
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    type: String,
    
    // For objective
    selectedOption: Number,
    
    // For subjective
    textAnswer: String,
    
    // For programming
    code: String,
    language: String,
    executionResults: [{
      testCaseId: mongoose.Schema.Types.ObjectId,
      passed: Boolean,
      executionTime: Number,
      memory: Number,
      output: String,
      error: String
    }],
    
    score: Number,
    maxScore: Number,
    aiEvaluation: {
      feedback: String,
      rubricScores: mongoose.Schema.Types.Mixed
    },
    timeSpent: Number
  }],
  
  proctoring: {
    tabSwitches: {
      type: Number,
      default: 0
    },
    suspiciousActivity: [{
      type: String,
      timestamp: Date,
      severity: String
    }],
    flaggedForReview: {
      type: Boolean,
      default: false
    }
  },
  
  plagiarismCheck: {
    codeChecked: Boolean,
    results: [{
      questionId: mongoose.Schema.Types.ObjectId,
      similarity: Number,
      suspiciousPatterns: [String]
    }]
  },
  
  scores: {
    objective: {
      scored: Number,
      total: Number,
      percentage: Number
    },
    subjective: {
      scored: Number,
      total: Number,
      percentage: Number
    },
    programming: {
      scored: Number,
      total: Number,
      percentage: Number,
      testCasesPassed: Number,
      totalTestCases: Number
    },
    overall: {
      scored: Number,
      total: Number,
      percentage: Number,
      weightedScore: Number
    }
  },
  
  skillAnalysis: [{
    skill: String,
    score: Number,
    maxScore: Number,
    performance: String
  }],
  
  resumeSkillMismatch: {
    detected: Boolean,
    mismatches: [{
      claimedSkill: String,
      assessmentPerformance: Number,
      analysis: String,
      severity: String
    }]
  },
  
  rank: Number,
  percentile: Number,
  
  aiInsights: {
    strengths: [String],
    weaknesses: [String],
    recommendation: String,
    confidenceScore: Number
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

applicationSchema.index({ jobId: 1, 'scores.overall.weightedScore': -1 });
applicationSchema.index({ candidateId: 1, createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
