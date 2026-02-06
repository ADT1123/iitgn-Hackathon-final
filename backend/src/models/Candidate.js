// src/models/Candidate.js
const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resume: {
    fileUrl: String,
    fileName: String,
    parsedData: {
      skills: [String],
      experience: [{
        company: String,
        role: String,
        duration: String,
        technologies: [String]
      }],
      education: [{
        degree: String,
        institution: String,
        year: Number
      }],
      certifications: [String]
    },
    uploadedAt: Date
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Candidate', candidateSchema);
