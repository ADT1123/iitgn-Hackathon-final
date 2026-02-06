// src/services/plagiarism.service.js
const stringSimilarity = require('string-similarity');

class PlagiarismService {
  // Simple FREE plagiarism detection using string similarity
  async checkCodePlagiarism(code, language) {
    try {
      // Common AI-generated code patterns
      const aiPatterns = [
        'Here is the solution',
        'Here\'s how',
        'This code will',
        '# Solution',
        '// Solution',
        'Step 1:',
        'import everything'
      ];

      // Check for AI patterns
      const aiDetected = aiPatterns.some(pattern => 
        code.toLowerCase().includes(pattern.toLowerCase())
      );

      // Basic similarity check (you can store previous submissions in DB)
      const suspiciousPatterns = [];
      if (code.length < 50) suspiciousPatterns.push('Code too short');
      if (code.split('\n').length < 5) suspiciousPatterns.push('Minimal implementation');
      
      return {
        similarity: 0, // In real app, compare with DB submissions
        sources: [],
        aiGenerated: {
          detected: aiDetected,
          confidence: aiDetected ? 70 : 10
        },
        suspiciousPatterns
      };
    } catch (error) {
      console.error('Plagiarism check error:', error);
      return {
        similarity: 0,
        sources: [],
        aiGenerated: { detected: false, confidence: 0 },
        suspiciousPatterns: []
      };
    }
  }

  async batchCheckPlagiarism(submissions) {
    const results = [];
    for (const submission of submissions) {
      const result = await this.checkCodePlagiarism(
        submission.code,
        submission.language
      );
      results.push({
        questionId: submission.questionId,
        ...result
      });
    }
    return results;
  }
}

module.exports = new PlagiarismService();
