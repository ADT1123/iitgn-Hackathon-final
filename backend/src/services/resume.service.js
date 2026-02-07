
const { GoogleGenerativeAI } = require('@google/generative-ai');


let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

exports.analyzeResume = async (fileBuffer, jobDescription) => {
  try {
    // 1. Check API Key
    if (!genAI) {
      console.warn('Gemini API Key missing or invalid');
      return {
        score: 75,
        summary: "This is a mock analysis. Configure GEMINI_API_KEY for real results.",
        matchingSkills: ["JavaScript", "React", "Node.js"],
        missingSkills: ["Python", "AWS"]
      };
    }

    // 2. AI Analysis directly with PDF Buffer
    console.log('Sending PDF to Gemini (Size: ' + fileBuffer.length + ' bytes)...');

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const parts = [
      {
        inlineData: {
          mimeType: "application/pdf",
          data: fileBuffer.toString("base64")
        }
      },
      {
        text: `
          Act as an expert Technical Recruiter. Analyze the attached resume against the job description.
          
          Job Description:
          ${jobDescription.substring(0, 1000)}
          
          Return a JSON object with:
          - score (0-100 integer)
          - summary (2-3 sentences max)
          - matchingSkills (array of strings)
          - missingSkills (array of strings)
          
          JSON ONLY. No markdown.
        `
      }
    ];

    const result = await model.generateContent(parts);
    const responseText = result.response.text();
    console.log('Gemini Response received');

    const jsonStr = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Resume analysis error:", error);
    // Improve error message
    if (error.message.includes('API key')) throw new Error('Invalid Gemini API Key');
    if (error.message.includes('unsupported')) throw new Error('Unsupported file format or corrupt PDF');
    throw new Error("Failed to analyze resume with AI");
  }
};
