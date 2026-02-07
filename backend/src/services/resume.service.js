const fs = require('fs').promises;
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Extract text from PDF
exports.extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

// Parse resume using AI
exports.parseResume = async (resumeText) => {
  if (!genAI) {
    return {
      name: 'Unknown',
      email: 'not-extracted@example.com',
      phone: '',
      skills: ['General Skills'],
      experience: 'Not specified',
      education: [],
      totalExperience: 0
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Extract information from this resume and return ONLY a JSON object:

RESUME TEXT:
${resumeText}

Return this exact structure (no markdown, no explanations):
{
  "name": "candidate name",
  "email": "email@example.com",
  "phone": "phone number",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": "2 years",
      "responsibilities": ["resp1", "resp2"]
    }
  ],
  "education": [
    {
      "degree": "Bachelor's in Computer Science",
      "institution": "University Name",
      "year": "2020"
    }
  ],
  "totalExperience": 3.5,
  "summary": "Brief professional summary"
}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsed = JSON.parse(text);
    return parsed;

  } catch (error) {
    console.error('Resume parsing error:', error);
    throw new Error('Failed to parse resume');
  }
};

// Check eligibility against job requirements
exports.checkEligibility = async (resumeData, job) => {
  const requiredSkills = job.skills || [];
  const candidateSkills = resumeData.skills || [];
  
  // Calculate skill match percentage
  const matchedSkills = candidateSkills.filter(skill => 
    requiredSkills.some(req => 
      req.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(req.toLowerCase())
    )
  );

  const skillMatchPercentage = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;

  // Experience check
  const requiredExp = parseExperience(job.experience);
  const candidateExp = resumeData.totalExperience || 0;
  const experienceMatch = candidateExp >= requiredExp;

  // Overall eligibility
  const isEligible = skillMatchPercentage >= 50 && experienceMatch;

  return {
    isEligible,
    skillMatchPercentage,
    matchedSkills,
    missingSkills: requiredSkills.filter(skill => 
      !matchedSkills.some(matched => 
        matched.toLowerCase().includes(skill.toLowerCase())
      )
    ),
    experienceMatch,
    requiredExperience: requiredExp,
    candidateExperience: candidateExp,
    overallScore: Math.round((skillMatchPercentage + (experienceMatch ? 100 : 0)) / 2)
  };
};

// Generate detailed eligibility report
exports.generateEligibilityReport = async (resumeData, job, eligibility) => {
  if (!genAI) {
    return {
      summary: `Skill Match: ${eligibility.skillMatchPercentage}%. Experience: ${eligibility.candidateExperience} years.`,
      strengths: eligibility.matchedSkills,
      gaps: eligibility.missingSkills,
      recommendation: eligibility.isEligible ? 'Proceed with interview' : 'Does not meet requirements'
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Generate a detailed eligibility report for this candidate:

JOB TITLE: ${job.title}
REQUIRED SKILLS: ${job.skills?.join(', ') || 'Not specified'}
REQUIRED EXPERIENCE: ${job.experience || 'Not specified'}

CANDIDATE NAME: ${resumeData.name}
CANDIDATE SKILLS: ${resumeData.skills?.join(', ')}
CANDIDATE EXPERIENCE: ${resumeData.totalExperience} years

ELIGIBILITY ANALYSIS:
- Skill Match: ${eligibility.skillMatchPercentage}%
- Matched Skills: ${eligibility.matchedSkills.join(', ')}
- Missing Skills: ${eligibility.missingSkills.join(', ')}
- Experience Match: ${eligibility.experienceMatch ? 'Yes' : 'No'}
- Overall Eligibility: ${eligibility.isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}

Generate a professional report in JSON format:
{
  "summary": "<3-4 sentence executive summary>",
  "strengths": ["strength1", "strength2", "strength3"],
  "gaps": ["gap1", "gap2"],
  "recommendation": "hire | interview | reject",
  "detailedAnalysis": "<2-3 paragraph detailed analysis>",
  "nextSteps": ["step1", "step2"]
}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(text);

  } catch (error) {
    console.error('Report generation error:', error);
    return {
      summary: `Skill match: ${eligibility.skillMatchPercentage}%`,
      strengths: eligibility.matchedSkills,
      gaps: eligibility.missingSkills,
      recommendation: eligibility.isEligible ? 'interview' : 'reject'
    };
  }
};

// Detect resume-skill mismatch
exports.detectSkillMismatch = (resumeData, assessmentResults) => {
  const claimedSkills = resumeData.skills || [];
  const performedSkills = assessmentResults.skillBreakdown || [];

  const mismatches = [];

  for (const skill of claimedSkills) {
    const performance = performedSkills.find(p => 
      p.skill.toLowerCase().includes(skill.toLowerCase())
    );

    if (performance && performance.score < 50) {
      mismatches.push({
        skill,
        claimed: true,
        actualScore: performance.score,
        severity: performance.score < 30 ? 'high' : 'medium',
        flag: `Claimed "${skill}" but scored only ${performance.score}%`
      });
    }
  }

  return {
    hasMismatch: mismatches.length > 0,
    mismatches,
    credibilityScore: Math.max(0, 100 - (mismatches.length * 20))
  };
};

// Helper: Parse experience string
function parseExperience(expString) {
  if (!expString) return 0;
  
  const match = expString.match(/(\d+)/);
  return match ? parseInt(match[0]) : 0;
}

module.exports = exports;
