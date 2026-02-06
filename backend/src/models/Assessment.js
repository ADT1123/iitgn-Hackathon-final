// src/models/Assessment.js
const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobDescription',
    required: true
  },
  questions: [{
    type: {
      type: String,
      enum: ['objective', 'subjective', 'programming'],
      required: true
    },
    category: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard']
    },
    question: String,
    
    // For objective questions
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    
    // For subjective questions
    rubric: {
      maxScore: Number,
      criteria: [String]
    },
    
    // For programming questions
    testCases: [{
      input: String,
      expectedOutput: String,
      isHidden: Boolean,
      weight: Number
    }],
    languageConstraints: [String],
    timeLimit: Number,
    memoryLimit: Number,
    
    skillMapping: String,
    weight: Number,
    aiGenerated: {
      type: Boolean,
      default: true
    }
  }],
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assessment', assessmentSchema);
