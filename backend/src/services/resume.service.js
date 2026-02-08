
const axios = require('axios');
const FormData = require('form-data');
const pdfParse = require('pdf-parse');

// Sarvam API Client Configuration
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

console.log('🚀 Initializing All-Sarvam Resume Service...');

/**
 * Smart Fallback for Analysis (Last resort if Sarvam Chat fails)
 */
function generateFallback(resumeText, jobDescription, reason) {
  console.log(`⚠️ Sarvam Analysis Fallback (${reason})`);
  return {
    score: 60,
    summary: `[SARVAM FALLBACK: ${reason}] Manual review required. The system was unable to complete the AI analysis at this moment.`,
    candidatePersona: "Candidate",
    marketSalaryRange: "Consult Recruiter",
    matchingSkills: ["To be reviewed"],
    missingSkills: ["To be reviewed"],
    strengths: ["Manual check pending"],
    weaknesses: ["AI analysis unavailable"],
    recommendation: "Review Needed"
  };
}

/**
 * Extracts text from PDF using Sarvam AI parsepdf
 */
async function extractTextFromPDF(fileBuffer, originalname) {
  if (SARVAM_API_KEY) {
    try {
      console.log('Attempting PDF extraction with Sarvam AI...');
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: originalname || 'resume.pdf',
        contentType: 'application/pdf'
      });

      // Endpoint: https://api.sarvam.ai/parse/parsepdf (as per latest docs)
      const response = await axios.post('https://api.sarvam.ai/parse/parsepdf', formData, {
        headers: {
          ...formData.getHeaders(),
          'api-subscription-key': SARVAM_API_KEY
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 30000 // Higher timeout for large PDFs
      });

      if (response.data && response.data.text) {
        console.log('✅ Sarvam Extraction Success');
        return response.data.text;
      }
    } catch (error) {
      console.warn('⚠️ Sarvam Extraction failed:', error.message);
      // If it's a 502, we log it and move to local backup
      if (error.response) console.error('Status:', error.response.status);
    }
  }

  // Fallback to local pdf-parse
  console.log('Using local parser (Sarvam endpoint unavailable)...');
  try {
    const data = await pdfParse(fileBuffer);
    return data.text;
  } catch (error) {
    console.error('❌ Local parsing also failed:', error.message);
    return "";
  }
}

/**
 * Main Analysis function using Sarvam AI exclusively
 */
exports.analyzeResume = async (fileBuffer, jobDescription, originalname) => {
  let resumeText = '';

  try {
    // 1. Text Extraction
    resumeText = await extractTextFromPDF(fileBuffer, originalname);
    resumeText = resumeText.replace(/\n\s*\n/g, '\n').trim();

    if (!resumeText || resumeText.length < 20) {
      console.warn('No text extracted from PDF.');
    } else {
      console.log(`Text extracted (${resumeText.length} chars). Analyzing with Sarvam-M...`);
    }

    // 2. Analysis with Sarvam AI Chat Completion (sarvam-m)
    if (!SARVAM_API_KEY) {
      console.error('SARVAM_API_KEY is missing.');
      return generateFallback(resumeText, jobDescription, "API Key Missing");
    }

    const prompt = `
      Act as a Senior Recruiter. Analyze this Resume Text against this Job Description.
      
      Job Description:
      ${jobDescription}

      Resume Text:
      ${resumeText.substring(0, 10000)}

      Return a JSON object with exactly these fields:
      - score: integer (0-100)
      - summary: 3-4 sentence professional summary
      - candidatePersona: 2-4 word role title
      - marketSalaryRange: estimated salary string
      - matchingSkills: array of strings
      - missingSkills: array of strings
      - strengths: array of strings
      - weaknesses: array of strings
      - recommendation: "Selected", "Maybe", or "Not Selected"
      
      Output valid JSON only.
    `;

    try {
      const response = await axios.post('https://api.sarvam.ai/v1/chat/completions', {
        model: "sarvam-m",
        messages: [
          { role: "system", content: "You are a professional AI recruiter. Output valid JSON only." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      }, {
        headers: {
          'api-subscription-key': SARVAM_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // Generative AI can be slow
      });

      const content = response.data.choices[0].message.content;
      console.log('✅ Sarvam Analysis Success');

      // Clean and Parse JSON
      const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanedContent);

    } catch (apiError) {
      console.error('❌ Sarvam Chat API Error:', apiError.message);
      if (apiError.response) console.error('Status:', apiError.response.status);
      return generateFallback(resumeText, jobDescription, "API Service Unavailable");
    }

  } catch (error) {
    console.error("Critical Resume Service Error:", error.message);
    return generateFallback(resumeText, jobDescription, "Unexpected System Error");
  }
};
