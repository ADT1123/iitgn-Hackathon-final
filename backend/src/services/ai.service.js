const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Evaluate subjective answer
exports.evaluateSubjectiveAnswer = async (question, answer, maxScore) => {
  if (!genAI) {
    return {
      score: Math.round(maxScore * 0.7),
      feedback: 'Auto-evaluated (AI not configured)',
      strengths: ['Answer provided'],
      improvements: ['Could be more detailed'],
      confidence: 0.5
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert technical evaluator. Grade this answer:

QUESTION: ${question}

CANDIDATE'S ANSWER: ${answer}

MAX SCORE: ${maxScore}

Evaluate based on:
1. Correctness and accuracy
2. Depth of understanding
3. Clarity of explanation
4. Practical relevance

Return ONLY a JSON object (no markdown):
{
  "score": <number between 0 and ${maxScore}>,
  "feedback": "<constructive feedback in 2-3 sentences>",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "confidence": <0.0 to 1.0>
}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const evaluation = JSON.parse(text);
    return evaluation;

  } catch (error) {
    console.error('AI Evaluation error:', error);
    return {
      score: Math.round(maxScore * 0.6),
      feedback: 'Could not evaluate automatically',
      strengths: ['Answer submitted'],
      improvements: ['Needs review'],
      confidence: 0.3
    };
  }
};

// Calculate weighted score
exports.calculateWeightedScore = (scores, weights) => {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  
  let weightedSum = 0;
  for (const [category, score] of Object.entries(scores)) {
    const weight = weights[category] || 0;
    weightedSum += (score * weight);
  }
  
  return Math.round((weightedSum / totalWeight) * 100) / 100;
};

// AI hiring recommendation
exports.getHiringRecommendation = async (application, job) => {
  if (!genAI) {
    return {
      recommendation: application.totalScore >= 70 ? 'hire' : 'maybe',
      reasoning: 'Based on score threshold',
      confidence: 0.5
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Analyze this candidate and provide hiring recommendation:

JOB: ${job.title} - ${job.department}
REQUIRED SKILLS: ${job.skills?.join(', ') || 'Not specified'}

CANDIDATE PERFORMANCE:
- Total Score: ${application.totalScore}%
- Technical: ${application.detailedScores.technical}%
- Problem Solving: ${application.detailedScores.problemSolving}%
- Communication: ${application.detailedScores.communication}%
- Coding: ${application.detailedScores.coding}%

Return ONLY JSON:
{
  "recommendation": "strong-hire" | "hire" | "maybe" | "no-hire",
  "reasoning": "<2-3 sentence explanation>",
  "confidence": <0.0 to 1.0>,
  "keyStrengths": ["strength1", "strength2"],
  "concerns": ["concern1", "concern2"]
}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(text);

  } catch (error) {
    console.error('AI Recommendation error:', error);
    const score = application.totalScore;
    return {
      recommendation: score >= 80 ? 'hire' : score >= 60 ? 'maybe' : 'no-hire',
      reasoning: `Based on overall score of ${score}%`,
      confidence: 0.5
    };
  }
};

// Detect skill gaps
exports.detectSkillGaps = (claimedSkills, performanceBySkill) => {
  const gaps = [];
  
  for (const skill of claimedSkills) {
    const performance = performanceBySkill[skill] || 0;
    
    if (performance < 50) {
      gaps.push({
        skill,
        claimed: true,
        actualScore: performance,
        gap: 'significant'
      });
    } else if (performance < 70) {
      gaps.push({
        skill,
        claimed: true,
        actualScore: performance,
        gap: 'moderate'
      });
    }
  }
  
  return gaps;
};

// Generate detailed report insights
exports.generateReportInsights = async (application) => {
  if (!genAI) {
    return {
      summary: `Candidate scored ${application.totalScore}% overall.`,
      keyFindings: ['Performance evaluated'],
      recommendations: ['Review manually for best results']
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Generate a comprehensive assessment report summary:

CANDIDATE: ${application.candidateName}
OVERALL SCORE: ${application.totalScore}%
DETAILED SCORES: ${JSON.stringify(application.detailedScores)}
TIME TAKEN: ${Math.round(application.timeTaken / 60)} minutes

Create a professional summary with:
1. Overall performance assessment
2. Key strengths (3-4 points)
3. Areas for development (2-3 points)
4. Hiring recommendation

Return ONLY JSON:
{
  "summary": "<2-3 paragraph executive summary>",
  "keyFindings": ["finding1", "finding2", "finding3"],
  "recommendations": ["recommendation1", "recommendation2"]
}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(text);

  } catch (error) {
    console.error('Report Insights error:', error);
    return {
      summary: `${application.candidateName} completed the assessment with a score of ${application.totalScore}%.`,
      keyFindings: ['Assessment completed', 'Scores recorded'],
      recommendations: ['Proceed with interview if score meets criteria']
    };
  }
};

module.exports = exports;
