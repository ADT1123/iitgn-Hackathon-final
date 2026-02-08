const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  questionType: {
    type: String,
    enum: ['objective', 'subjective', 'coding']
  },
  answer: {
    type: mongoose.Schema.Types.Mixed
  },
  isCorrect: {
    type: Boolean
  },
  score: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    default: 1
  },
  timeTaken: {
    type: Number
  },
  aiEvaluation: {
    feedback: String,
    strengths: [String],
    improvements: [String],
    confidence: Number
  }
});

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  assessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment'
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  candidateName: {
    type: String,
    required: true,
    trim: true
  },
  candidateEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  resume: {
    type: String
  },
  // NEW: Resume data extracted by AI
  resumeData: {
    name: String,
    email: String,
    phone: String,
    skills: [String],
    experience: [{
      company: String,
      role: String,
      duration: String,
      responsibilities: [String]
    }],
    education: [{
      degree: String,
      institution: String,
      year: String
    }],
    totalExperience: Number,
    summary: String
  },
  // NEW: Eligibility check results
  eligibilityCheck: {
    isEligible: Boolean,
    skillMatchPercentage: Number,
    matchedSkills: [String],
    missingSkills: [String],
    experienceMatch: Boolean,
    requiredExperience: Number,
    candidateExperience: Number,
    overallScore: Number,
    report: {
      summary: String,
      strengths: [String],
      gaps: [String],
      recommendation: String,
      detailedAnalysis: String,
      nextSteps: [String]
    }
  },
  answers: [answerSchema],
  totalScore: {
    type: Number,
    default: 0
  },
  detailedScores: {
    technical: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    coding: { type: Number, default: 0 }
  },
  weightedScore: {
    type: Number,
    default: 0
  },
  percentile: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'shortlisted', 'rejected'],
    default: 'pending'
  },
  autoEvaluated: {
    type: Boolean,
    default: false
  },
  aiRecommendation: {
    type: String,
    enum: ['strong-hire', 'hire', 'maybe', 'no-hire']
  },
  aiReasoning: {
    type: String
  },
  // NEW: Skill gaps (resume vs assessment mismatch)
  skillGaps: [{
    skill: String,
    claimed: Boolean,
    actualScore: Number,
    severity: String,
    flag: String
  }],
  credibilityScore: {
    type: Number,
    default: 100
  },
  proctoring: {
    totalTimeSpent: Number,
    averageTimePerQuestion: Number,
    suspiciousActivities: [{
      type: String,
      timestamp: Date,
      description: String
    }],
    tabSwitches: { type: Number, default: 0 },
    copyPasteEvents: { type: Number, default: 0 }
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  timeTaken: {
    type: Number
  }
}, {
  timestamps: true
});

applicationSchema.index({ job: 1, candidateEmail: 1 }, { unique: true });
applicationSchema.index({ totalScore: -1 });
applicationSchema.index({ weightedScore: -1 });

module.exports = mongoose.model('Application', applicationSchema);
