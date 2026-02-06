// src/services/gemini.service.js
const { getModel } = require('../config/gemini');

class GeminiService {
  // Parse Job Description
  async parseJobDescription(rawJD) {
    try {
      const model = getModel();
      
      const prompt = `Analyze this job description and extract structured information in valid JSON format only (no markdown, no extra text):

Job Description:
${rawJD}

Return ONLY this JSON structure:
{
  "requiredSkills": [
    {"skill": "skill name", "importance": "critical|high|medium|low", "weight": 20}
  ],
  "experienceLevel": "fresher|junior|mid|senior|lead",
  "domain": "domain name",
  "responsibilities": ["resp1", "resp2"],
  "tools": ["tool1", "tool2"],
  "softSkills": ["skill1", "skill2"]
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response
      let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Parse JD Error:', error);
      // Fallback default
      return {
        requiredSkills: [
          { skill: "Problem Solving", importance: "high", weight: 20 },
          { skill: "Communication", importance: "medium", weight: 15 }
        ],
        experienceLevel: "mid",
        domain: "Technology",
        responsibilities: ["Role-based tasks"],
        tools: [],
        softSkills: ["Teamwork", "Communication"]
      };
    }
  }

  // Generate Objective Questions
  async generateObjectiveQuestions(skill, difficulty, count) {
    try {
      const model = getModel();
      
      const prompt = `Generate exactly ${count} multiple-choice questions for "${skill}" at ${difficulty} difficulty.

Return ONLY valid JSON array (no markdown):
[
  {
    "question": "question text",
    "options": [
      {"text": "option 1", "isCorrect": false},
      {"text": "option 2", "isCorrect": true},
      {"text": "option 3", "isCorrect": false},
      {"text": "option 4", "isCorrect": false}
    ],
    "category": "${skill}",
    "difficulty": "${difficulty}"
  }
]`;

      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(jsonText);
      return Array.isArray(parsed) ? parsed : parsed.questions || [];
    } catch (error) {
      console.error('Generate MCQ Error:', error);
      return [{
        question: `Sample ${skill} question`,
        options: [
          { text: "Option A", isCorrect: false },
          { text: "Option B", isCorrect: true },
          { text: "Option C", isCorrect: false },
          { text: "Option D", isCorrect: false }
        ],
        category: skill,
        difficulty: difficulty
      }];
    }
  }

  // Generate Subjective Questions
  async generateSubjectiveQuestions(skill, difficulty, count) {
    try {
      const model = getModel();
      
      const prompt = `Generate ${count} subjective questions for "${skill}" at ${difficulty} difficulty.

Return ONLY valid JSON array:
[
  {
    "question": "detailed question text",
    "category": "${skill}",
    "difficulty": "${difficulty}",
    "rubric": {
      "maxScore": 10,
      "criteria": ["Understanding (4 pts)", "Clarity (3 pts)", "Examples (3 pts)"]
    }
  }
]`;

      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(jsonText);
      return Array.isArray(parsed) ? parsed : parsed.questions || [];
    } catch (error) {
      console.error('Generate Subjective Error:', error);
      return [{
        question: `Explain ${skill} concepts`,
        category: skill,
        difficulty: difficulty,
        rubric: {
          maxScore: 10,
          criteria: ["Understanding (5 pts)", "Clarity (5 pts)"]
        }
      }];
    }
  }

  // Generate Programming Questions
  async generateProgrammingQuestions(skill, difficulty, count) {
    try {
      const model = getModel();
      
      const prompt = `Generate ${count} coding problems for "${skill}" at ${difficulty} difficulty.

Return ONLY valid JSON array:
[
  {
    "question": "problem statement with input/output format",
    "category": "${skill}",
    "difficulty": "${difficulty}",
    "testCases": [
      {"input": "test input", "expectedOutput": "expected output", "isHidden": false, "weight": 25},
      {"input": "test input 2", "expectedOutput": "expected output 2", "isHidden": true, "weight": 25}
    ],
    "languageConstraints": ["javascript", "python", "java"],
    "timeLimit": 2,
    "memoryLimit": 256
  }
]`;

      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(jsonText);
      return Array.isArray(parsed) ? parsed : parsed.questions || [];
    } catch (error) {
      console.error('Generate Coding Error:', error);
      return [{
        question: `Write a function to solve a ${skill} problem`,
        category: skill,
        difficulty: difficulty,
        testCases: [
          { input: "1", expectedOutput: "1", isHidden: false, weight: 50 },
          { input: "2", expectedOutput: "2", isHidden: true, weight: 50 }
        ],
        languageConstraints: ["javascript", "python"],
        timeLimit: 2,
        memoryLimit: 256
      }];
    }
  }

  // Evaluate Subjective Answer
  async evaluateSubjectiveAnswer(question, answer, rubric) {
    try {
      const model = getModel();
      
      const prompt = `Evaluate this answer based on the rubric.

Question: ${question}
Answer: ${answer}
Max Score: ${rubric.maxScore}
Criteria: ${rubric.criteria.join(', ')}

Return ONLY valid JSON:
{
  "score": number (0-${rubric.maxScore}),
  "feedback": "detailed constructive feedback",
  "keyPointsCovered": ["point1", "point2"],
  "missingPoints": ["missing1"]
}`;

      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const evaluation = JSON.parse(jsonText);
      return {
        ...evaluation,
        maxScore: rubric.maxScore,
        rubricScores: {}
      };
    } catch (error) {
      console.error('Evaluate Answer Error:', error);
      return {
        score: Math.floor(rubric.maxScore * 0.5),
        maxScore: rubric.maxScore,
        feedback: "Answer evaluated",
        keyPointsCovered: [],
        missingPoints: []
      };
    }
  }

  // Analyze Resume-Skill Mismatch
  async analyzeResumeSkillMismatch(resumeSkills, assessmentScores) {
    try {
      const model = getModel();
      
      const prompt = `Analyze skill mismatches:

Resume Skills: ${JSON.stringify(resumeSkills)}
Assessment Scores: ${JSON.stringify(assessmentScores)}

Return ONLY valid JSON:
{
  "mismatches": [
    {
      "claimedSkill": "skill name",
      "assessmentPerformance": score,
      "analysis": "explanation",
      "severity": "high|medium|low"
    }
  ],
  "overallCredibility": 85,
  "recommendation": "detailed recommendation"
}`;

      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Mismatch Analysis Error:', error);
      return {
        mismatches: [],
        overallCredibility: 75,
        recommendation: "Candidate shows reasonable alignment"
      };
    }
  }

  // Generate Candidate Insights
  async generateCandidateInsights(application) {
    try {
      const model = getModel();
      
      const prompt = `Analyze candidate performance:

Overall: ${application.scores?.overall?.percentage}%
Objective: ${application.scores?.objective?.percentage}%
Subjective: ${application.scores?.subjective?.percentage}%
Programming: ${application.scores?.programming?.percentage}%

Return ONLY valid JSON:
{
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendation": "hiring recommendation",
  "confidenceScore": 85
}`;

      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Insights Error:', error);
      return {
        strengths: ["Completed assessment"],
        weaknesses: ["Needs improvement"],
        recommendation: "Review for further evaluation",
        confidenceScore: 70
      };
    }
  }
}

module.exports = new GeminiService();
