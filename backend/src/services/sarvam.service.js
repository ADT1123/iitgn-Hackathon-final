const axios = require('axios');
const fs = require('fs');
const path = require('path');

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

/**
 * Unified AI Service for centralized tasks
 */
class SarvamService {
  constructor() {
    this.baseUrl = 'https://api.sarvam.ai/v1';
    this.model = 'sarvam-m';
  }

  /**
   * General purpose chat completion with JSON enforcement
   */
  async getChatCompletion(prompt, systemMessage = "You are a professional AI recruiter. Output valid JSON only.") {
    if (!SARVAM_API_KEY) {
      throw new Error('SARVAM_API_KEY is missing');
    }

    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: this.model,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      }, {
        headers: {
          'api-subscription-key': SARVAM_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });

      const content = response.data.choices[0].message.content;

      // Robust JSON Extraction
      let cleanedContent = content;

      // 1. Remove markdown code blocks if present
      if (cleanedContent.includes('```')) {
        const match = cleanedContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match) cleanedContent = match[1];
      }

      // 2. Extract JSON part
      const firstBrace = cleanedContent.indexOf('{');
      if (firstBrace !== -1) {
        cleanedContent = cleanedContent.substring(firstBrace);
      }

      // Try parsing first - if it works, we're golden
      try {
        return JSON.parse(cleanedContent.trim());
      } catch (parseError) {
        console.error('❌ JSON Parse Failed. attempting advanced repair.');

        let repaired = cleanedContent.trim();

        // 3. Remove trailing non-JSON text (thoughts/explanations) if no truncation suspected
        // But if it's truncated, we want to keep as much as possible.
        // If the last character is not } or ], it's likely truncated.

        // Advanced Repair Logic

        // A. Fix missing commas between objects/arrays
        repaired = repaired.replace(/\}\s*\{/g, '}, {');
        repaired = repaired.replace(/\]\s*\[/g, '], [');
        repaired = repaired.replace(/("[^"]*"\s*:\s*(?:"[^"]*"|[\d\.]+|true|false|null))\s*"/g, '$1, "');
        repaired = repaired.replace(/\]\s*"/g, '], "');
        repaired = repaired.replace(/\}\s*"/g, '}, "');

        // B. Stack-based Balancing (Correct Nesting)
        const stack = [];
        let inString = false;
        let finalRepaired = "";

        for (let i = 0; i < repaired.length; i++) {
          const char = repaired[i];
          if (char === '"' && (i === 0 || repaired[i - 1] !== '\\')) {
            inString = !inString;
          }

          if (!inString) {
            if (char === '{' || char === '[') {
              stack.push(char === '{' ? '}' : ']');
            } else if (char === '}' || char === ']') {
              if (stack.length > 0 && stack[stack.length - 1] === char) {
                stack.pop();
              } else {
                // Mismatched or extra closing - skip this char to try and stay balanced
                continue;
              }
            }
          }
          finalRepaired += char;
        }

        // Close unterminated string
        if (inString) finalRepaired += '"';

        // Close all remaining brackets in correct order
        while (stack.length > 0) {
          finalRepaired += stack.pop();
        }

        try {
          return JSON.parse(finalRepaired);
        } catch (secondError) {
          console.error('❌ Advanced Repair Failed:', secondError.message);
          // Save for debug
          try {
            fs.writeFileSync(path.join(process.cwd(), 'malformed_ai_response.json'), finalRepaired);
          } catch (e) { }
          throw parseError;
        }
      }
    } catch (error) {
      console.error('❌ Sarvam Service Error:', error.message);
      if (error.response) console.error('Status:', error.response.status, 'Data:', error.response.data);
      throw error;
    }
  }

  /**
   * Generate a full Job Description from a short string
   */
  async generateJD(promptText) {
    const prompt = `
      Act as an expert technical recruiter. Based on the following short description, generate a complete, professional, and detailed job description.
      
      Input: ${promptText}

      Return a JSON object with exactly these fields:
      {
        "title": "Professional Job Title",
        "description": "2-3 high-level summary paragraphs",
        "department": "e.g. Engineering, Sales",
        "requirements": ["requirement 1", "requirement 2", ...],
        "responsibilities": ["responsibility 1", "responsibility 2", ...],
        "benefits": ["benefit 1", "benefit 2", ...],
        "skills": ["skill 1", "skill 2", ...],
        "experience": "e.g. 2-5 years",
        "location": "e.g. Remote, City",
        "type": "e.g. Full-time, Contract"
      }
    `;

    return await this.getChatCompletion(prompt);
  }

  /**
   * Generate assessment questions for a job
   */
  async generateQuestions(job, counts = { objective: 5, subjective: 2, coding: 1 }, difficulty = 'medium') {
    const skills = job.skills && job.skills.length > 0 ? job.skills.join(', ') : 'General Programming';

    const prompt = `
      Create an assessment for the role: ${job.title}
      Target Skills: ${skills}
      Difficulty: ${difficulty}

      Requirement:
      - ${counts.objective} Multiple Choice Questions (MCQs)
      - ${counts.subjective} Subjective Questions (requiring paragraph answers)
      - ${counts.coding} Programming Questions (coding problems)

      For MCQs, provide: question, 4 options, and the index of the correct answer (0-3).
      For Subjective, provide: question, points, and a brief rubric/key concepts.
      For Coding, provide: question, points, and 2-3 basic test cases (input/output).

      ### OUTPUT RULES:
      - Return ONLY a single MINIFIED JSON object.
      - NO markdown blocks, NO preamble, NO trailer.
      - Ensure EVERY question object has all fields.
      - Ensure commas after every array element and object field EXCEPT the last one.
      - If the response is long, DO NOT TRUNCATE; finish the JSON structure.

      ### JSON STRUCTURE:
      {
        "questions": [
          {
            "type": "objective",
            "question": "text",
            "options": ["a", "b", "c", "d"],
            "correctAnswer": 0,
            "points": 2,
            "skill": "skill"
          },
          ...
        ]
      }
    `;

    return await this.getChatCompletion(prompt);
  }

  /**
   * Evaluate a subjective answer
   */
  async evaluateAnswer(question, answer, points = 10) {
    const prompt = `
      Evaluate this candidate's answer for a recruitment assessment.
      
      Question: ${question}
      Candidate's Answer: ${answer}
      Max Points: ${points}

      Return a JSON object:
      {
        "score": integer (0-${points}),
        "feedback": "constructive feedback",
        "strengths": ["...", "..."],
        "weaknesses": ["...", "..."]
      }
    `;

    return await this.getChatCompletion(prompt);
  }

  /**
   * Generate candidate insights for profile
   */
  async generateCandidateInsights(application) {
    const prompt = `
      Analyze this candidate's performance across an assessment.
      
      Candidate: ${application.candidateName}
      Total Score: ${application.totalScore}%
      Detailed Scores: ${JSON.stringify(application.detailedScores)}
      
      Provide a professional evaluation.

      Return a JSON object:
      {
        "summary": "2-3 sentence executive summary",
        "strengths": ["strength 1", "strength 2"],
        "weaknesses": ["area 1", "area 2"],
        "recommendation": "Strong Hire / Hire / Maybe / Reject"
      }
    `;

    return await this.getChatCompletion(prompt);
  }
}

module.exports = new SarvamService();
