// src/services/resume.service.js
const pdfParse = require('pdf-parse');
const natural = require('natural');

class ResumeService {
  async parseResume(fileBuffer) {
    try {
      const data = await pdfParse(fileBuffer);
      const text = data.text;

      // Extract skills using keywords
      const skills = this.extractSkills(text);
      const experience = this.extractExperience(text);
      const education = this.extractEducation(text);

      return {
        skills,
        experience,
        education,
        certifications: []
      };
    } catch (error) {
      console.error('Resume parsing error:', error);
      return {
        skills: [],
        experience: [],
        education: [],
        certifications: []
      };
    }
  }

  extractSkills(text) {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 
      'MongoDB', 'SQL', 'AWS', 'Docker', 'Git', 'TypeScript',
      'Express', 'Django', 'Flask', 'Angular', 'Vue', 'HTML', 'CSS'
    ];

    const foundSkills = [];
    const lowerText = text.toLowerCase();

    commonSkills.forEach(skill => {
      if (lowerText.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    });

    return foundSkills;
  }

  extractExperience(text) {
    // Simple pattern matching for experience
    const lines = text.split('\n');
    const experience = [];
    
    lines.forEach(line => {
      if (line.match(/\d{4}\s*-\s*\d{4}|\d{4}\s*-\s*present/i)) {
        experience.push({
          company: 'Extracted Company',
          role: 'Role',
          duration: line.trim(),
          technologies: []
        });
      }
    });

    return experience;
  }

  extractEducation(text) {
    const educationKeywords = ['B.Tech', 'B.E', 'M.Tech', 'MBA', 'BCA', 'MCA', 'Bachelor', 'Master'];
    const education = [];
    
    educationKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        education.push({
          degree: keyword,
          institution: 'University',
          year: new Date().getFullYear()
        });
      }
    });

    return education;
  }
}

module.exports = new ResumeService();
