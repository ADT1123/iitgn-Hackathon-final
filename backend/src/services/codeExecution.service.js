// src/services/codeExecution.service.js
const axios = require('axios');

class CodeExecutionService {
  constructor() {
    this.judge0API = process.env.JUDGE0_API_URL;
    this.apiKey = process.env.RAPIDAPI_KEY;
  }

  getLanguageId(language) {
    const map = {
      'javascript': 63,
      'python': 71,
      'java': 62,
      'cpp': 54,
      'c': 50
    };
    return map[language.toLowerCase()] || 63;
  }

  async executeCode(code, language, testCases, timeLimit = 2, memoryLimit = 256000) {
    try {
      const languageId = this.getLanguageId(language);
      const results = [];

      for (const testCase of testCases) {
        try {
          const submission = {
            source_code: code,
            language_id: languageId,
            stdin: testCase.input,
            expected_output: testCase.expectedOutput,
            cpu_time_limit: timeLimit,
            memory_limit: memoryLimit
          };

          const response = await axios.post(
            `${this.judge0API}/submissions?base64_encoded=false&wait=true`,
            submission,
            {
              headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': this.apiKey,
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
              },
              timeout: 10000
            }
          );

          const result = response.data;
          
          results.push({
            testCaseId: testCase._id,
            passed: result.status?.id === 3,
            executionTime: parseFloat(result.time) || 0,
            memory: parseInt(result.memory) || 0,
            output: result.stdout || '',
            error: result.stderr || result.compile_output || '',
            status: result.status?.description || 'Unknown'
          });
        } catch (execError) {
          results.push({
            testCaseId: testCase._id,
            passed: false,
            executionTime: 0,
            memory: 0,
            output: '',
            error: execError.message,
            status: 'Error'
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Code execution error:', error);
      throw new Error('Failed to execute code');
    }
  }

  calculateScore(executionResults, totalScore) {
    const totalTests = executionResults.length;
    const passedTests = executionResults.filter(r => r.passed).length;
    
    return {
      scored: Math.round((passedTests / totalTests) * totalScore),
      total: totalScore,
      testCasesPassed: passedTests,
      totalTestCases: totalTests,
      percentage: Math.round((passedTests / totalTests) * 100)
    };
  }
}

module.exports = new CodeExecutionService();
