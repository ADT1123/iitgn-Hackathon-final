const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    default: 'Full-time'
  },
  experience: {
    type: String,
    default: 'Not specified'
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  requirements: [{
    type: String
  }],
  responsibilities: [{
    type: String
  }],
  benefits: [{
    type: String
  }],
  skills: [{
    type: String
  }],
  salary: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'on-hold'],
    default: 'active'
  },
  totalApplications: {
    type: Number,
    default: 0
  },
  shortlistedCount: {
    type: Number,
    default: 0
  },
  assessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment'
  },
  qualificationCriteria: {
    minimumScore: {
      type: Number,
      default: 60
    },
    autoShortlist: {
      type: Boolean,
      default: true
    },
    autoRejectBelow: {
      type: Number,
      default: 40
    },
    skillWeights: {
      technical: { type: Number, default: 50 },
      problemSolving: { type: Number, default: 30 },
      communication: { type: Number, default: 20 }
    }
  }
}, {
  timestamps: true
});

jobSchema.index({ recruiter: 1, status: 1 });
jobSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Job', jobSchema);
