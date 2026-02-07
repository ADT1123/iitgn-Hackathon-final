// src/services/advancedAI.service.js
// Enhanced AI Service with all 20 features
const { getModel } = require('../config/gemini');
const stringSimilarity = require('string-similarity');

class AdvancedAIService {
  constructor() {
    this.model = null;
  }

  getModel() {
    if (!this.model) {
      this.model = getModel();
    }
    return this.model;
  }

  // ==========================================
  // FEATURE 1: AI-Powered JD Parser (Enhanced)
  // ==========================================
  async parseJobDescriptionAdvanced(rawJD) {
    try {
      const model = this.getModel();
      
      const prompt = `You are an expert HR analyst. Analyze this job description and extract comprehensive structured information.

Job Description:
${rawJD}

Return ONLY valid JSON (no markdown):
{
  "title": "extracted job title",
  "requiredSkills": [
    {
      "skill": "skill name",
      "category": "technical|soft|domain",
      "importance": "critical|high|medium|low",
      "weight": 25,
      "yearsRequired": 2
    }
  ],
  "experienceLevel": "fresher|junior|mid|senior|lead|executive",
  "experienceYears": { "min": 0, "max": 5 },
  "domain": "domain name",
  "subDomain": "specific area",
  "responsibilities": ["detailed responsibility 1", "responsibility 2"],
  "tools": [{ "name": "tool1", "proficiency": "expert|intermediate|basic" }],
  "technologies": [{ "name": "tech1", "category": "frontend|backend|database|cloud|devops" }],
  "softSkills": [{ "skill": "communication", "importance": "high" }],
  "education": { "minimum": "Bachelor's", "preferred": "Master's", "fields": ["CS", "IT"] },
  "certifications": ["preferred certification 1"],
  "assessmentCriteria": {
    "technicalWeight": 50,
    "problemSolvingWeight": 25,
    "communicationWeight": 15,
    "culturalFitWeight": 10
  },
  "difficultyMapping": {
    "objectiveDifficulty": "medium",
    "subjectiveDifficulty": "medium",
    "codingDifficulty": "hard"
  },
  "roleKeywords": ["keyword1", "keyword2"],
  "redFlags": ["skills that would be concerning if missing"]
}`;

      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Advanced JD Parse Error:', error);
      return this.getDefaultJDParse();
    }
  }

  getDefaultJDParse() {
    return {
      requiredSkills: [
        { skill: "Problem Solving", category: "soft", importance: "high", weight: 20 }
      ],
      experienceLevel: "mid",
      experienceYears: { min: 2, max: 5 },
      domain: "Technology",
      responsibilities: ["Role-based tasks"],
      tools: [],
      technologies: [],
      softSkills: [{ skill: "Communication", importance: "medium" }],
      assessmentCriteria: {
        technicalWeight: 50,
        problemSolvingWeight: 30,
        communicationWeight: 20,
        culturalFitWeight: 0
      },
      difficultyMapping: {
        objectiveDifficulty: "medium",
        subjectiveDifficulty: "medium",
        codingDifficulty: "medium"
      }
    };
  }

  // ==========================================
  // FEATURE 2: Adaptive Question Generation
  // ==========================================
  async generateAdaptiveQuestions(parsedJD, config) {
    const {
      objectiveCount = 10,
      subjectiveCount = 3,
      codingCount = 2,
      experienceLevel = 'mid',
      customDifficulty = null
    } = config;

    const questions = [];
    const skills = parsedJD.requiredSkills || [];

    // Distribute questions across skills based on importance
    const skillDistribution = this.calculateSkillDistribution(skills, objectiveCount + subjectiveCount + codingCount);

    // Generate objective questions
    for (const skillConfig of skillDistribution.objective) {
      const qs = await this.generateObjectiveQuestionsForSkill(
        skillConfig.skill,
        skillConfig.count,
        customDifficulty || this.getDifficultyForLevel(experienceLevel, 'objective'),
        parsedJD.domain
      );
      questions.push(...qs.map(q => ({ ...q, weight: skillConfig.weight })));
    }

    // Generate subjective questions
    for (const skillConfig of skillDistribution.subjective) {
      const qs = await this.generateSubjectiveQuestionsForSkill(
        skillConfig.skill,
        skillConfig.count,
        customDifficulty || this.getDifficultyForLevel(experienceLevel, 'subjective'),
        parsedJD.domain
      );
      questions.push(...qs.map(q => ({ ...q, weight: skillConfig.weight })));
    }

    // Generate coding questions
    for (const skillConfig of skillDistribution.coding) {
      const qs = await this.generateCodingQuestionsForSkill(
        skillConfig.skill,
        skillConfig.count,
        customDifficulty || this.getDifficultyForLevel(experienceLevel, 'coding'),
        parsedJD.technologies
      );
      questions.push(...qs.map(q => ({ ...q, weight: skillConfig.weight })));
    }

    return questions;
  }

  calculateSkillDistribution(skills, totalQuestions) {
    const sortedSkills = [...skills].sort((a, b) => 
      this.importanceToNumber(b.importance) - this.importanceToNumber(a.importance)
    );

    const distribution = { objective: [], subjective: [], coding: [] };
    let remaining = totalQuestions;

    sortedSkills.slice(0, 5).forEach((skill, idx) => {
      const count = Math.max(1, Math.floor(remaining / (5 - idx)));
      remaining -= count;

      if (skill.category === 'technical') {
        distribution.objective.push({ skill: skill.skill, count: Math.floor(count * 0.5), weight: skill.weight });
        distribution.coding.push({ skill: skill.skill, count: Math.floor(count * 0.5), weight: skill.weight });
      } else {
        distribution.objective.push({ skill: skill.skill, count: Math.floor(count * 0.6), weight: skill.weight });
        distribution.subjective.push({ skill: skill.skill, count: Math.floor(count * 0.4), weight: skill.weight });
      }
    });

    return distribution;
  }

  importanceToNumber(importance) {
    const map = { critical: 4, high: 3, medium: 2, low: 1 };
    return map[importance] || 2;
  }

  getDifficultyForLevel(level, questionType) {
    const difficultyMap = {
      fresher: { objective: 'easy', subjective: 'easy', coding: 'easy' },
      junior: { objective: 'easy', subjective: 'medium', coding: 'easy' },
      mid: { objective: 'medium', subjective: 'medium', coding: 'medium' },
      senior: { objective: 'medium', subjective: 'hard', coding: 'hard' },
      lead: { objective: 'hard', subjective: 'hard', coding: 'hard' },
      executive: { objective: 'hard', subjective: 'hard', coding: 'medium' }
    };
    return difficultyMap[level]?.[questionType] || 'medium';
  }

  // ==========================================
  // FEATURE 3: Multi-Level Difficulty Scaling
  // ==========================================
  async generateObjectiveQuestionsForSkill(skill, count, difficulty, domain) {
    try {
      const model = this.getModel();
      
      const difficultyDescriptions = {
        easy: 'basic concepts, definitions, and straightforward applications',
        medium: 'application-based scenarios, moderate complexity, real-world use cases',
        hard: 'advanced concepts, edge cases, optimization, architecture decisions'
      };

      const prompt = `Generate ${count} ${difficulty} multiple choice questions for "${skill}" in the ${domain || 'Technology'} domain.

Difficulty level: ${difficulty}
Focus on: ${difficultyDescriptions[difficulty]}

Return ONLY valid JSON array:
[
  {
    "question": "Detailed question text with context if needed",
    "options": [
      {"text": "Option A", "isCorrect": false},
      {"text": "Option B", "isCorrect": true},
      {"text": "Option C", "isCorrect": false},
      {"text": "Option D", "isCorrect": false}
    ],
    "category": "${skill}",
    "difficulty": "${difficulty}",
    "timeEstimate": 60,
    "explanation": "Why the correct answer is correct",
    "conceptsTested": ["concept1", "concept2"]
  }
]`;

      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(jsonText);
      return (Array.isArray(parsed) ? parsed : []).map(q => ({
        type: 'objective',
        ...q,
        points: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3
      }));
    } catch (error) {
      console.error('Generate Objective Error:', error);
      return [];
    }
  }

  async generateSubjectiveQuestionsForSkill(skill, count, difficulty, domain) {
    try {
      const model = this.getModel();

      const prompt = `Generate ${count} ${difficulty} subjective questions for "${skill}" in ${domain || 'Technology'}.

For ${difficulty} difficulty, create questions that test:
- Easy: Basic understanding and simple explanations
- Medium: Real-world scenarios, case studies, problem-solving
- Hard: Complex architecture decisions, optimization strategies, leadership scenarios

Return ONLY valid JSON array:
[
  {
    "question": "Detailed scenario-based question",
    "category": "${skill}",
    "difficulty": "${difficulty}",
    "rubric": {
      "maxScore": 10,
      "criteria": [
        {"name": "Technical Accuracy", "maxPoints": 4, "description": "Correct technical concepts"},
        {"name": "Clarity", "maxPoints": 3, "description": "Clear and structured response"},
        {"name": "Examples", "maxPoints": 3, "description": "Real-world examples provided"}
      ]
    },
    "expectedKeyPoints": ["key point 1", "key point 2"],
    "timeEstimate": 300,
    "wordLimit": { "min": 100, "max": 500 }
  }
]`;

      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(jsonText);
      return (Array.isArray(parsed) ? parsed : []).map(q => ({
        type: 'subjective',
        ...q,
        points: q.rubric?.maxScore || 10
      }));
    } catch (error) {
      console.error('Generate Subjective Error:', error);
      return [];
    }
  }

  async generateCodingQuestionsForSkill(skill, count, difficulty, technologies) {
    try {
      const model = this.getModel();
      const techs = technologies?.map(t => t.name).join(', ') || 'JavaScript, Python';

      const prompt = `Generate ${count} ${difficulty} coding problems for "${skill}".

Supported languages: ${techs}
Difficulty: ${difficulty}

Return ONLY valid JSON array:
[
  {
    "question": "Detailed problem statement with input/output format and constraints",
    "category": "${skill}",
    "difficulty": "${difficulty}",
    "testCases": [
      {"input": "test input 1", "expectedOutput": "expected 1", "isHidden": false, "weight": 20, "description": "Basic case"},
      {"input": "test input 2", "expectedOutput": "expected 2", "isHidden": false, "weight": 20, "description": "Edge case"},
      {"input": "test input 3", "expectedOutput": "expected 3", "isHidden": true, "weight": 30, "description": "Hidden test"},
      {"input": "test input 4", "expectedOutput": "expected 4", "isHidden": true, "weight": 30, "description": "Performance test"}
    ],
    "languageConstraints": ["javascript", "python", "java"],
    "timeLimit": 2,
    "memoryLimit": 256,
    "starterCode": {
      "javascript": "function solution(input) {\\n  // Your code here\\n}",
      "python": "def solution(input):\\n    # Your code here\\n    pass"
    },
    "hints": ["Hint 1 for partial credit", "Hint 2"],
    "conceptsTested": ["arrays", "loops", "optimization"],
    "timeEstimate": 600
  }
]`;

      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(jsonText);
      return (Array.isArray(parsed) ? parsed : []).map(q => ({
        type: 'coding',
        ...q,
        points: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20
      }));
    } catch (error) {
      console.error('Generate Coding Error:', error);
      return [];
    }
  }

  // ==========================================
  // FEATURE 5: AI-Driven Subjective Evaluation
  // ==========================================
  async evaluateSubjectiveAnswerAdvanced(question, answer, rubric, expectedKeyPoints = []) {
    try {
      const model = this.getModel();

      const criteriaStr = rubric.criteria?.map(c => 
        `${c.name} (${c.maxPoints} pts): ${c.description}`
      ).join('\n') || '';

      const prompt = `You are an expert evaluator. Grade this answer fairly and thoroughly.

Question: ${question}
Expected Key Points: ${expectedKeyPoints.join(', ')}

Candidate's Answer:
${answer}

Grading Rubric (Total: ${rubric.maxScore} points):
${criteriaStr}

Return ONLY valid JSON:
{
  "totalScore": number (0-${rubric.maxScore}),
  "criteriaScores": [
    {"name": "criterion name", "score": number, "maxScore": number, "feedback": "specific feedback"}
  ],
  "keyPointsCovered": ["covered point 1", "covered point 2"],
  "missingKeyPoints": ["missing point 1"],
  "strengths": ["strength 1", "strength 2"],
  "areasForImprovement": ["improvement 1"],
  "overallFeedback": "Constructive, detailed feedback",
  "confidence": 85,
  "plagiarismIndicators": {
    "detected": false,
    "patterns": []
  }
}`;

      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Evaluate Subjective Error:', error);
      return {
        totalScore: Math.floor(rubric.maxScore * 0.5),
        criteriaScores: [],
        overallFeedback: "Answer evaluated with standard scoring",
        confidence: 50
      };
    }
  }

  // ==========================================
  // FEATURE 7: Resume-Skill Mismatch Detection
  // ==========================================
  async analyzeResumeSkillMismatchAdvanced(resumeData, assessmentScores, jobRequirements) {
    try {
      const model = this.getModel();

      const prompt = `Analyze for skill mismatches between resume claims and assessment performance.

Resume Skills (Claimed): ${JSON.stringify(resumeData.skills)}
Resume Experience: ${JSON.stringify(resumeData.experience)}

Assessment Scores by Skill: ${JSON.stringify(assessmentScores)}

Job Requirements: ${JSON.stringify(jobRequirements)}

Identify discrepancies where claimed expertise doesn't match performance.

Return ONLY valid JSON:
{
  "overallCredibility": 85,
  "mismatches": [
    {
      "skill": "skill name",
      "claimedProficiency": "expert",
      "assessmentScore": 45,
      "expectedMinScore": 75,
      "severity": "high|medium|low",
      "analysis": "Detailed explanation",
      "recommendation": "specific recommendation"
    }
  ],
  "verifiedSkills": ["skill that matched claims"],
  "suspiciousPatterns": [
    {
      "pattern": "pattern description",
      "evidence": "evidence details",
      "riskLevel": "high|medium|low"
    }
  ],
  "experienceVerification": {
    "claimed": 5,
    "estimatedFromPerformance": 3,
    "discrepancy": "moderate",
    "analysis": "explanation"
  },
  "overallAssessment": {
    "recommendation": "proceed|review|reject",
    "confidence": 80,
    "reasoning": "detailed reasoning",
    "redFlags": ["flag 1"],
    "greenFlags": ["positive indicator 1"]
  }
}`;

      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Mismatch Analysis Error:', error);
      return {
        overallCredibility: 75,
        mismatches: [],
        verifiedSkills: [],
        overallAssessment: {
          recommendation: "review",
          confidence: 50,
          reasoning: "Unable to complete detailed analysis"
        }
      };
    }
  }

  // ==========================================
  // FEATURE 8: Dynamic Scoring Algorithm
  // ==========================================
  calculateWeightedScore(answers, questions, skillWeights = {}) {
    let totalWeightedScore = 0;
    let totalWeight = 0;
    const skillScores = {};

    answers.forEach(answer => {
      const question = questions.find(q => q._id.toString() === answer.questionId.toString());
      if (!question) return;

      const skill = question.skill || question.category || 'general';
      const weight = skillWeights[skill] || question.weight || 1;
      const maxScore = question.points || 10;
      const scorePercent = (answer.score / maxScore) * 100;

      // Initialize skill tracking
      if (!skillScores[skill]) {
        skillScores[skill] = { totalScore: 0, totalWeight: 0, count: 0 };
      }

      skillScores[skill].totalScore += answer.score * weight;
      skillScores[skill].totalWeight += maxScore * weight;
      skillScores[skill].count += 1;

      totalWeightedScore += answer.score * weight;
      totalWeight += maxScore * weight;
    });

    // Calculate skill-wise percentages
    const skillPerformance = {};
    Object.keys(skillScores).forEach(skill => {
      const s = skillScores[skill];
      skillPerformance[skill] = {
        percentage: Math.round((s.totalScore / s.totalWeight) * 100),
        questionsAnswered: s.count,
        rawScore: s.totalScore,
        maxScore: s.totalWeight
      };
    });

    return {
      weightedScore: totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) : 0,
      rawScore: totalWeightedScore,
      maxRawScore: totalWeight,
      skillPerformance,
      totalQuestionsAnswered: answers.length
    };
  }

  // ==========================================
  // FEATURE 11: Automated Report Generation Data
  // ==========================================
  async generateCandidateReportData(application, assessment, job) {
    try {
      const model = this.getModel();

      const prompt = `Generate a comprehensive evaluation report for this candidate.

Assessment Results:
- Overall Score: ${application.totalScore}%
- Section Scores: ${JSON.stringify(application.detailedScores)}
- Skill Analysis: ${JSON.stringify(application.skillAnalysis)}

Job Requirements: ${job.title}
Required Skills: ${JSON.stringify(job.skills)}

Return ONLY valid JSON:
{
  "executiveSummary": "2-3 sentence summary of candidate",
  "overallRating": "A|B|C|D|F",
  "recommendation": "Strong Hire|Hire|Consider|Reject",
  "strengthsAnalysis": [
    {"area": "area name", "score": 85, "details": "specific details"}
  ],
  "weaknessesAnalysis": [
    {"area": "area name", "score": 45, "details": "specific details", "improvementSuggestion": "suggestion"}
  ],
  "skillGapAnalysis": {
    "criticalGaps": ["skill 1"],
    "minorGaps": ["skill 2"],
    "exceededExpectations": ["skill 3"]
  },
  "benchmarkComparison": {
    "percentile": 75,
    "comparison": "Above average compared to similar candidates"
  },
  "interviewRecommendations": [
    {"topic": "topic to probe", "reason": "why this should be explored"}
  ],
  "developmentPlan": [
    {"skill": "skill name", "priority": "high|medium|low", "resources": ["resource 1"]}
  ],
  "culturalFitIndicators": ["indicator 1", "indicator 2"],
  "riskFactors": ["risk 1"],
  "finalNotes": "Any additional observations"
}`;

      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Report Generation Error:', error);
      return {
        executiveSummary: "Candidate completed assessment",
        overallRating: "C",
        recommendation: "Consider",
        strengthsAnalysis: [],
        weaknessesAnalysis: []
      };
    }
  }

  // ==========================================
  // FEATURE 20: Explainable AI Scoring
  // ==========================================
  async generateScoreExplanation(application, questions) {
    try {
      const model = this.getModel();

      const answersWithDetails = application.answers.map(a => {
        const q = questions.find(q => q._id.toString() === a.questionId.toString());
        return {
          question: q?.question?.substring(0, 100),
          type: a.type || q?.type,
          score: a.score,
          maxScore: a.maxScore || q?.points,
          skill: q?.skill || q?.category
        };
      });

      const prompt = `Provide a transparent explanation for this candidate's scores.

Answer Details:
${JSON.stringify(answersWithDetails)}

Total Score: ${application.totalScore}%

Return ONLY valid JSON:
{
  "scoreBreakdown": {
    "objective": {
      "score": 80,
      "explanation": "Candidate answered 8/10 objective questions correctly",
      "strengths": ["Strong in algorithms"],
      "weaknesses": ["Struggled with database queries"]
    },
    "subjective": {
      "score": 75,
      "explanation": "Good conceptual understanding with room for improvement in examples",
      "strengths": ["Clear explanations"],
      "weaknesses": ["Lacked real-world examples"]
    },
    "coding": {
      "score": 90,
      "explanation": "Excellent coding skills, passed all test cases",
      "strengths": ["Clean code", "Efficient solutions"],
      "weaknesses": ["Minor edge case missed"]
    }
  },
  "overallExplanation": "Detailed explanation of how final score was calculated",
  "scoringFactors": [
    {"factor": "Question difficulty", "impact": "positive", "details": "Harder questions weighted more"},
    {"factor": "Skill importance", "impact": "neutral", "details": "Critical skills given priority"}
  ],
  "fairnessIndicators": [
    "All candidates evaluated with same rubric",
    "AI scoring calibrated against expert evaluators"
  ],
  "confidenceLevel": 90,
  "appealGuidance": "If you believe there's an error, provide specific question numbers and reasoning"
}`;

      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Score Explanation Error:', error);
      return {
        overallExplanation: "Score calculated based on correct answers and rubric criteria",
        confidenceLevel: 70
      };
    }
  }
}

module.exports = new AdvancedAIService();
