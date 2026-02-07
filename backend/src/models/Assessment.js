const mongoose = require('mongoose');
const crypto = require('crypto');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['objective', 'subjective', 'coding'],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String
  }],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed
  },
  points: {
    type: Number,
    default: 1
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  skill: {
    type: String
  },
  testCases: [{
    input: String,
    expectedOutput: String
  }]
});

const assessmentSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 60
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  questions: [questionSchema],
  passingScore: {
    type: Number,
    default: 60
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  uniqueLink: {
    type: String,
    unique: true
  },
  linkActive: {
    type: Boolean,
    default: true
  },
  totalAttempts: {
    type: Number,
    default: 0
  },
  completedAttempts: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate unique link before validation
assessmentSchema.pre('validate', function(next) {
  if (!this.uniqueLink) {
    this.uniqueLink = generateUniqueCode();
  }
  next();
});

// Generate unique code
function generateUniqueCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Indexes
assessmentSchema.index({ uniqueLink: 1 });
assessmentSchema.index({ job: 1 });
assessmentSchema.index({ recruiter: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
