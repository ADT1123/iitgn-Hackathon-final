
const { GoogleGenerativeAI } = require('@google/generative-ai');


let genAI = null;
console.log('Initializing Gemini AI...');
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY value:', process.env.GEMINI_API_KEY ? 'SET (length: ' + process.env.GEMINI_API_KEY.length + ')' : 'NOT SET');

if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini AI initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Gemini AI:', error.message);
  }
} else {
  console.warn('⚠️  Gemini API Key not configured - will use mock data');
}

exports.analyzeResume = async (fileBuffer, jobDescription) => {
  try {
    // 1. Check API Key
    if (!genAI) {
      console.warn('Gemini API Key missing or invalid - returning mock data');
      return {
        score: 75,
        summary: "This is a mock analysis. Configure GEMINI_API_KEY in your .env file for real AI-powered results. The candidate shows promise with relevant technical skills.",
        matchingSkills: ["JavaScript", "React", "Node.js", "Problem Solving"],
        missingSkills: ["Python", "AWS", "Docker"],
        strengths: [
          "Strong foundation in modern web development",
          "Good understanding of full-stack technologies",
          "Demonstrated problem-solving abilities"
        ],
        weaknesses: [
          "Limited cloud platform experience",
          "Could benefit from containerization knowledge"
        ],
        recommendation: "Potential Fit - Consider for interview"
      };
    }

    // 2. AI Analysis directly with PDF Buffer
    console.log('Sending PDF to Gemini (Size: ' + fileBuffer.length + ' bytes)...');

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const parts = [
      {
        inlineData: {
          mimeType: "application/pdf",
          data: fileBuffer.toString("base64")
        }
      },
      {
        text: `
          Act as a Senior Technical Recruiter at a top-tier tech company. 
          Analyze the attached resume against the provided Job Description.
          
          Job Description:
          ${jobDescription.substring(0, 2000)}
          
          Evaluate based on:
          1. Skill match (technical and soft skills)
          2. Experience relevance
          3. Educational background
          4. Potential gaps or red flags
          
          Return a JSON object with the following fields:
          - score: integer (0-100) representing overall match
          - summary: strings, a high-level professional assessment (3-4 sentences)
          - matchingSkills: array of strings containing skills found in both resume and JD
          - missingSkills: array of strings containing skills required by JD but missing in resume
          - strengths: array of 3 key professional strengths found in the resume
          - weaknesses: array of 2-3 areas for improvement or missing qualifications
          - recommendation: string, a final hiring recommendation (e.g., "Highly Recommend", "Potential Fit", "Not Recommended")
          
          CRITICAL: Output MUST be valid JSON. No conversational text, no markdown code blocks.
        `
      }
    ];

    const result = await model.generateContent(parts);
    const responseText = result.response.text();
    console.log('Gemini Analysis complete');

    // Robust JSON parsing
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON Parse Error. Raw response:', responseText);
      throw new Error('Failed to parse AI analysis results');
    }

  } catch (error) {
    console.error("Resume analysis error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Improve error message
    if (error.message && error.message.includes('API key')) {
      throw new Error('Invalid Gemini API Key');
    }
    if (error.message && error.message.includes('unsupported')) {
      throw new Error('Unsupported file format or corrupt PDF');
    }

    // Return the actual error message for debugging
    throw new Error(error.message || "Failed to analyze resume with AI");
  }
};
