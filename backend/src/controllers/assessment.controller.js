const Assessment = require('../models/Assessment');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Get all assessments
exports.getAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({ recruiter: req.user.id })
      .populate('job', 'title department location')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: assessments.length,
      data: assessments
    });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get assessment by ID with applications
exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('job')
      .populate('recruiter', 'firstName lastName email');
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Get all applications for this assessment
    const applications = await Application.find({ assessment: req.params.id })
      .sort('-totalScore');

    // Calculate statistics
    const stats = {
      totalApplications: applications.length,
      completed: applications.filter(a => a.status === 'completed' || a.status === 'shortlisted' || a.status === 'rejected').length,
      shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
      averageScore: applications.length > 0 
        ? Math.round(applications.reduce((sum, a) => sum + (a.totalScore || 0), 0) / applications.length)
        : 0,
      highestScore: applications.length > 0 
        ? Math.max(...applications.map(a => a.totalScore || 0))
        : 0
    };
    
    res.status(200).json({
      success: true,
      data: {
        assessment,
        applications,
        stats
      }
    });
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Generate questions with AI
exports.generateQuestions = async (req, res) => {
  try {
    const { jobId, objectiveCount, subjectiveCount, codingCount, duration, difficulty } = req.body;

    console.log('Generating assessment for job:', jobId);
    console.log('Config:', { objectiveCount, subjectiveCount, codingCount, duration, difficulty });

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const questions = [];
    const skills = job.skills || ['General'];
    const totalQuestions = (objectiveCount || 0) + (subjectiveCount || 0) + (codingCount || 0);

    console.log(`Creating ${totalQuestions} questions for skills:`, skills.join(', '));

    // Generate objective questions
    if (objectiveCount > 0) {
      if (genAI) {
        try {
          console.log('Using AI to generate objective questions...');
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          
          const prompt = `
Generate ${objectiveCount} multiple choice questions for a ${job.title} position.
Required skills: ${skills.join(', ')}
Difficulty: ${difficulty || 'medium'}

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "What is the primary purpose of React hooks?",
    "options": ["State management", "Routing", "Styling", "Testing"],
    "correctAnswer": "State management",
    "skill": "React",
    "difficulty": "medium"
  }
]

Do not include markdown, explanations, or any text outside the JSON array.`;

          const result = await model.generateContent(prompt);
          let text = result.response.text();
          text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          
          const aiQuestions = JSON.parse(text);
          
          aiQuestions.forEach(q => {
            questions.push({
              type: 'objective',
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              points: 1,
              difficulty: q.difficulty || difficulty || 'medium',
              skill: q.skill || skills[0]
            });
          });

          console.log(`Generated ${questions.length} AI objective questions`);
        } catch (aiError) {
          console.error('AI generation failed:', aiError.message);
          // Fallback to template
          for (let i = 0; i < objectiveCount; i++) {
            const skill = skills[i % skills.length];
            questions.push({
              type: 'objective',
              question: `Which statement best describes your proficiency in ${skill}?`,
              options: [
                `Expert level understanding of ${skill}`,
                `Intermediate working knowledge of ${skill}`,
                `Basic familiarity with ${skill}`,
                `No prior experience with ${skill}`
              ],
              correctAnswer: `Expert level understanding of ${skill}`,
              points: 1,
              difficulty: difficulty || 'medium',
              skill: skill
            });
          }
        }
      } else {
        // Template questions when no AI
        console.log('No AI available, using templates');
        for (let i = 0; i < objectiveCount; i++) {
          const skill = skills[i % skills.length];
          questions.push({
            type: 'objective',
            question: `Assess your knowledge of ${skill} in a professional context`,
            options: [
              `Advanced: Can architect and lead projects using ${skill}`,
              `Intermediate: Can independently work with ${skill}`,
              `Beginner: Have basic understanding of ${skill}`,
              `Novice: Limited exposure to ${skill}`
            ],
            correctAnswer: `Advanced: Can architect and lead projects using ${skill}`,
            points: 1,
            difficulty: difficulty || 'medium',
            skill: skill
          });
        }
      }
    }

    // Generate subjective questions
    for (let i = 0; i < (subjectiveCount || 0); i++) {
      const skill = skills[i % skills.length];
      questions.push({
        type: 'subjective',
        question: `Describe a challenging project where you used ${skill}. What was the problem, your approach, and the outcome?`,
        points: 5,
        difficulty: difficulty || 'medium',
        skill: skill
      });
    }

    // Generate coding questions
    for (let i = 0; i < (codingCount || 0); i++) {
      const skill = skills[i % skills.length];
      questions.push({
        type: 'coding',
        question: `Write a function that demonstrates your understanding of ${skill}. Include proper error handling, comments, and consider edge cases.`,
        points: 10,
        difficulty: difficulty || 'medium',
        skill: 'Coding',
        testCases: [
          { input: 'example input', expectedOutput: 'expected output' }
        ]
      });
    }

    console.log(`Total questions created: ${questions.length}`);

    // Create assessment
    const assessment = await Assessment.create({
      job: jobId,
      recruiter: req.user.id,
      title: `${job.title} Assessment`,
      duration: duration || 60,
      totalQuestions: questions.length,
      questions,
      status: 'published'
    });

    console.log(`Assessment created successfully: ${assessment._id}`);
    console.log(`Unique link: ${assessment.uniqueLink}`);

    // Link assessment to job
    job.assessment = assessment._id;
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Assessment generated successfully',
      data: assessment
    });

  } catch (error) {
    console.error('Generate questions error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get public assessment by link (for candidates)
exports.getPublicAssessment = async (req, res) => {
  try {
    const { link } = req.params;

    const assessment = await Assessment.findOne({ uniqueLink: link })
      .populate('job', 'title department location company');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    if (!assessment.linkActive) {
      return res.status(403).json({
        success: false,
        message: 'This assessment link is no longer active'
      });
    }

    // Remove correct answers from questions
    const publicQuestions = assessment.questions.map(q => ({
      _id: q._id,
      type: q.type,
      question: q.question,
      options: q.options,
      points: q.points,
      difficulty: q.difficulty,
      skill: q.skill
    }));

    res.status(200).json({
      success: true,
      data: {
        _id: assessment._id,
        title: assessment.title,
        duration: assessment.duration,
        totalQuestions: assessment.totalQuestions,
        passingScore: assessment.passingScore,
        job: assessment.job,
        questions: publicQuestions
      }
    });
  } catch (error) {
    console.error('Get public assessment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Submit candidate assessment
exports.submitCandidateAssessment = async (req, res) => {
  try {
    const { link } = req.params;
    const { candidateName, candidateEmail, phone, answers } = req.body;

    console.log('Candidate submission for link:', link);

    const assessment = await Assessment.findOne({ uniqueLink: link })
      .populate('job');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Calculate score
    let totalScore = 0;
    let maxScore = 0;

    const evaluatedAnswers = answers.map(answer => {
      const question = assessment.questions.id(answer.questionId);
      if (!question) return null;

      let score = 0;
      const isObjective = question.type === 'objective';

      if (isObjective) {
        score = answer.answer === question.correctAnswer ? question.points : 0;
      } else {
        // For subjective/coding, give partial score
        score = question.points * 0.7;
      }

      totalScore += score;
      maxScore += question.points;

      return {
        questionId: answer.questionId,
        questionType: question.type,
        answer: answer.answer,
        isCorrect: isObjective ? (answer.answer === question.correctAnswer) : null,
        score,
        maxScore: question.points,
        timeTaken: answer.timeTaken
      };
    }).filter(Boolean);

    const totalPercentage = Math.round((totalScore / maxScore) * 100);

    // Determine status
    let status = 'completed';
    if (totalPercentage >= assessment.job.qualificationCriteria?.minimumScore || 60) {
      status = 'shortlisted';
    } else if (totalPercentage < (assessment.job.qualificationCriteria?.autoRejectBelow || 40)) {
      status = 'rejected';
    }

    // Create application
    const application = await Application.create({
      job: assessment.job._id,
      assessment: assessment._id,
      candidateName,
      candidateEmail,
      phone,
      answers: evaluatedAnswers,
      totalScore: totalPercentage,
      status,
      autoEvaluated: true,
      completedAt: new Date()
    });

    // Update assessment stats
    assessment.totalAttempts += 1;
    assessment.completedAttempts += 1;
    await assessment.save();

    console.log(`Application created: ${application._id}, Score: ${totalPercentage}%`);

    res.status(200).json({
      success: true,
      message: 'Assessment submitted successfully',
      data: {
        applicationId: application._id,
        totalScore: totalPercentage,
        status,
        feedback: totalPercentage >= 60 
          ? 'Great job! Your performance meets our requirements.' 
          : 'Thank you for your submission. We will review your application.'
      }
    });

  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update assessment
exports.updateAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete assessment
exports.deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Assessment deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toggle link status
exports.toggleLinkStatus = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    assessment.linkActive = !assessment.linkActive;
    await assessment.save();

    res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAssessments: exports.getAssessments,
  getAssessmentById: exports.getAssessmentById,
  generateQuestions: exports.generateQuestions,
  getPublicAssessment: exports.getPublicAssessment,
  submitCandidateAssessment: exports.submitCandidateAssessment,
  updateAssessment: exports.updateAssessment,
  deleteAssessment: exports.deleteAssessment,
  toggleLinkStatus: exports.toggleLinkStatus
};
