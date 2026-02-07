// src/services/enhancedPlagiarism.service.js
// FEATURE 6: Enhanced Plagiarism & Code Similarity Detection

const stringSimilarity = require('string-similarity');
const crypto = require('crypto');

class EnhancedPlagiarismService {
    constructor() {
        // Store submission hashes for cross-checking
        this.submissionHashes = new Map();

        // Common code patterns and templates
        this.commonPatterns = {
            javascript: [
                'function solution',
                'const result =',
                'return result',
                'for (let i = 0',
                'if (condition)'
            ],
            python: [
                'def solution',
                'return result',
                'for i in range',
                'if condition:',
                '__name__ == "__main__"'
            ]
        };

        // AI-generated code signatures
        this.aiSignatures = [
            'Here is the solution',
            'Here\'s how',
            'Here is a',
            'Let me',
            'I\'ll write',
            '# Solution',
            '// Solution',
            '# Step 1',
            '// Step 1',
            'First, we need to',
            'The approach is',
            '"""',
            'Example usage:',
            '# Example:',
            '// Example:'
        ];
    }

    // ==========================================
    // FEATURE 6: Plagiarism & Code Similarity
    // ==========================================

    async analyzeSubmission(code, language, questionId, applicationId) {
        const analysis = {
            applicationId,
            questionId,
            language,
            timestamp: new Date(),
            plagiarismScore: 0,
            flags: [],
            details: {}
        };

        // 1. AI-Generated Code Detection
        const aiDetection = this.detectAIGenerated(code);
        analysis.details.aiGenerated = aiDetection;
        if (aiDetection.detected) {
            analysis.flags.push({
                type: 'ai_generated',
                severity: aiDetection.confidence > 70 ? 'high' : 'medium',
                confidence: aiDetection.confidence,
                indicators: aiDetection.indicators
            });
            analysis.plagiarismScore += aiDetection.confidence * 0.4;
        }

        // 2. Cross-submission similarity
        const crossSimilarity = await this.checkCrossSubmissionSimilarity(code, questionId, applicationId);
        analysis.details.crossSubmission = crossSimilarity;
        if (crossSimilarity.similarSubmissions.length > 0) {
            analysis.flags.push({
                type: 'cross_submission_match',
                severity: crossSimilarity.maxSimilarity > 0.9 ? 'high' : 'medium',
                similarity: crossSimilarity.maxSimilarity,
                matchCount: crossSimilarity.similarSubmissions.length
            });
            analysis.plagiarismScore += crossSimilarity.maxSimilarity * 40;
        }

        // 3. Known template detection
        const templateMatch = this.detectKnownTemplates(code, language);
        analysis.details.templateMatch = templateMatch;
        if (templateMatch.isTemplate) {
            analysis.flags.push({
                type: 'template_code',
                severity: 'low',
                patterns: templateMatch.matchedPatterns
            });
            analysis.plagiarismScore += 10;
        }

        // 4. Code structure analysis
        const structureAnalysis = this.analyzeCodeStructure(code, language);
        analysis.details.structure = structureAnalysis;
        if (structureAnalysis.suspicious) {
            analysis.flags.push({
                type: 'suspicious_structure',
                severity: 'medium',
                details: structureAnalysis.issues
            });
            analysis.plagiarismScore += 15;
        }

        // 5. Typing pattern analysis (if available)
        const complexityAnalysis = this.analyzeCodeComplexity(code, language);
        analysis.details.complexity = complexityAnalysis;

        // Calculate final score
        analysis.plagiarismScore = Math.min(100, Math.round(analysis.plagiarismScore));
        analysis.riskLevel = this.getRiskLevel(analysis.plagiarismScore);
        analysis.recommendation = this.getRecommendation(analysis);

        // Store hash for future comparisons
        await this.storeSubmissionHash(code, questionId, applicationId);

        return analysis;
    }

    detectAIGenerated(code) {
        const indicators = [];
        let confidence = 0;

        // Check for AI signature patterns
        this.aiSignatures.forEach(signature => {
            if (code.toLowerCase().includes(signature.toLowerCase())) {
                indicators.push(`Contains AI pattern: "${signature}"`);
                confidence += 15;
            }
        });

        // Check for overly detailed comments
        const commentRatio = this.calculateCommentRatio(code);
        if (commentRatio > 0.4) {
            indicators.push('Unusually high comment ratio');
            confidence += 10;
        }

        // Check for perfect formatting
        if (this.hasConsistentIndentation(code)) {
            indicators.push('Perfectly consistent formatting');
            confidence += 5;
        }

        // Check for example usage patterns
        if (code.includes('Example') || code.includes('Usage:')) {
            indicators.push('Contains example section');
            confidence += 10;
        }

        // Check for explanatory docstrings
        const docstringPattern = /"""[\s\S]*?"""|'''[\s\S]*?'''/g;
        const docstrings = code.match(docstringPattern);
        if (docstrings && docstrings.length > 2) {
            indicators.push('Multiple explanatory docstrings');
            confidence += 15;
        }

        return {
            detected: confidence >= 30,
            confidence: Math.min(100, confidence),
            indicators
        };
    }

    async checkCrossSubmissionSimilarity(code, questionId, applicationId) {
        const similarSubmissions = [];
        const codeHash = this.hashCode(code);
        const normalizedCode = this.normalizeCode(code);

        // Check against stored submissions for the same question
        const existingSubmissions = this.submissionHashes.get(questionId) || [];

        for (const submission of existingSubmissions) {
            if (submission.applicationId === applicationId) continue;

            // Check hash match (exact copy)
            if (submission.hash === codeHash) {
                similarSubmissions.push({
                    applicationId: submission.applicationId,
                    similarity: 1.0,
                    type: 'exact_match'
                });
                continue;
            }

            // Check similarity
            const similarity = stringSimilarity.compareTwoStrings(
                normalizedCode,
                submission.normalizedCode
            );

            if (similarity > 0.7) {
                similarSubmissions.push({
                    applicationId: submission.applicationId,
                    similarity,
                    type: 'similar'
                });
            }
        }

        return {
            similarSubmissions,
            maxSimilarity: similarSubmissions.length > 0
                ? Math.max(...similarSubmissions.map(s => s.similarity))
                : 0
        };
    }

    detectKnownTemplates(code, language) {
        const patterns = this.commonPatterns[language] || [];
        const matchedPatterns = [];

        patterns.forEach(pattern => {
            if (code.includes(pattern)) {
                matchedPatterns.push(pattern);
            }
        });

        // Check for boilerplate code percentage
        const boilerplateRatio = matchedPatterns.length / (patterns.length || 1);

        return {
            isTemplate: boilerplateRatio > 0.7,
            matchedPatterns,
            boilerplateRatio
        };
    }

    analyzeCodeStructure(code, language) {
        const issues = [];
        let suspicious = false;

        // Check for minimum complexity
        const lines = code.split('\n').length;
        const nonEmptyLines = code.split('\n').filter(l => l.trim()).length;

        if (nonEmptyLines < 5) {
            issues.push('Code too short for meaningful solution');
        }

        // Check for function definitions
        const funcPattern = language === 'python'
            ? /def\s+\w+\s*\(/g
            : /function\s+\w+\s*\(|const\s+\w+\s*=\s*\(|=>\s*{/g;

        const functions = code.match(funcPattern) || [];
        if (functions.length === 0 && lines > 10) {
            issues.push('No function definitions in substantial code');
            suspicious = true;
        }

        // Check for error handling
        const hasErrorHandling = code.includes('try') ||
            code.includes('catch') ||
            code.includes('except') ||
            code.includes('throw');

        // Check for input validation
        const hasValidation = code.includes('if') &&
            (code.includes('null') ||
                code.includes('undefined') ||
                code.includes('None'));

        return {
            suspicious,
            issues,
            metrics: {
                totalLines: lines,
                nonEmptyLines,
                functionCount: functions.length,
                hasErrorHandling,
                hasValidation
            }
        };
    }

    analyzeCodeComplexity(code, language) {
        // McCabe cyclomatic complexity approximation
        const conditionals = (code.match(/if|else|elif|switch|case|while|for|\?:/g) || []).length;
        const loops = (code.match(/for|while|do\s*{/g) || []).length;
        const functions = (code.match(/function|def |=>/g) || []).length;

        const complexity = 1 + conditionals + loops;

        // Lines of code
        const loc = code.split('\n').filter(l => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('#')).length;

        return {
            cyclomaticComplexity: complexity,
            linesOfCode: loc,
            functionCount: functions,
            loopCount: loops,
            conditionalCount: conditionals,
            complexityRating: complexity < 5 ? 'low' : complexity < 10 ? 'medium' : 'high'
        };
    }

    // Batch check for multiple code submissions
    async batchAnalyze(submissions) {
        const results = [];

        for (const submission of submissions) {
            const result = await this.analyzeSubmission(
                submission.code,
                submission.language,
                submission.questionId,
                submission.applicationId
            );
            results.push(result);
        }

        // Cross-check all submissions against each other
        const crossCheckResults = this.crossCheckBatch(submissions);

        return {
            individual: results,
            crossCheck: crossCheckResults,
            summary: {
                totalChecked: submissions.length,
                flagged: results.filter(r => r.flags.length > 0).length,
                highRisk: results.filter(r => r.riskLevel === 'high').length,
                averagePlagiarismScore: results.reduce((sum, r) => sum + r.plagiarismScore, 0) / results.length
            }
        };
    }

    crossCheckBatch(submissions) {
        const matches = [];

        for (let i = 0; i < submissions.length; i++) {
            for (let j = i + 1; j < submissions.length; j++) {
                const normalizedI = this.normalizeCode(submissions[i].code);
                const normalizedJ = this.normalizeCode(submissions[j].code);

                const similarity = stringSimilarity.compareTwoStrings(normalizedI, normalizedJ);

                if (similarity > 0.7) {
                    matches.push({
                        submission1: submissions[i].applicationId,
                        submission2: submissions[j].applicationId,
                        questionId: submissions[i].questionId,
                        similarity: Math.round(similarity * 100),
                        riskLevel: similarity > 0.9 ? 'critical' : similarity > 0.8 ? 'high' : 'medium'
                    });
                }
            }
        }

        return matches;
    }

    // Utility methods
    hashCode(code) {
        return crypto.createHash('md5').update(this.normalizeCode(code)).digest('hex');
    }

    normalizeCode(code) {
        // Remove comments
        let normalized = code.replace(/\/\/.*$/gm, '');
        normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, '');
        normalized = normalized.replace(/#.*$/gm, '');
        normalized = normalized.replace(/"""[\s\S]*?"""/g, '');
        normalized = normalized.replace(/'''[\s\S]*?'''/g, '');

        // Remove whitespace variations
        normalized = normalized.replace(/\s+/g, ' ').trim();

        // Normalize variable names (simple approach)
        normalized = normalized.toLowerCase();

        return normalized;
    }

    calculateCommentRatio(code) {
        const lines = code.split('\n');
        const commentLines = lines.filter(l =>
            l.trim().startsWith('//') ||
            l.trim().startsWith('#') ||
            l.trim().startsWith('/*') ||
            l.trim().startsWith('*')
        ).length;

        return commentLines / lines.length;
    }

    hasConsistentIndentation(code) {
        const lines = code.split('\n').filter(l => l.length > 0);
        const indentations = lines.map(l => l.match(/^(\s*)/)?.[1]?.length || 0);

        // Check if all indentations are multiples of a consistent base
        const baseIndent = indentations.find(i => i > 0) || 2;
        return indentations.every(i => i % (baseIndent || 2) === 0);
    }

    async storeSubmissionHash(code, questionId, applicationId) {
        const hash = this.hashCode(code);
        const normalizedCode = this.normalizeCode(code);

        if (!this.submissionHashes.has(questionId)) {
            this.submissionHashes.set(questionId, []);
        }

        this.submissionHashes.get(questionId).push({
            applicationId,
            hash,
            normalizedCode,
            timestamp: new Date()
        });
    }

    getRiskLevel(score) {
        if (score >= 70) return 'high';
        if (score >= 40) return 'medium';
        return 'low';
    }

    getRecommendation(analysis) {
        if (analysis.plagiarismScore >= 70) {
            return {
                action: 'reject',
                message: 'High plagiarism risk detected. Manual review required before proceeding.',
                details: analysis.flags.map(f => f.type).join(', ')
            };
        }
        if (analysis.plagiarismScore >= 40) {
            return {
                action: 'review',
                message: 'Moderate plagiarism indicators found. Consider additional verification.',
                details: analysis.flags.map(f => f.type).join(', ')
            };
        }
        return {
            action: 'proceed',
            message: 'No significant plagiarism concerns detected.',
            details: null
        };
    }
}

module.exports = new EnhancedPlagiarismService();
