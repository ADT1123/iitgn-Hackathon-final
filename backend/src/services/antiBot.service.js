// src/services/antiBot.service.js
// FEATURE 9: Anti-Bot Detection System
// FEATURE 10: Time-based Proctoring

class AntiBotService {
    constructor() {
        // Behavioral thresholds
        this.thresholds = {
            minTimePerQuestion: 5, // seconds - too fast is suspicious
            maxIdleTime: 300, // 5 minutes without activity
            suspiciousTabSwitches: 5,
            suspiciousCopyPaste: 3,
            minAnswerLength: 10, // characters for subjective
            maxTypingSpeed: 800, // characters per minute (superhuman)
            randomGuessPattern: 0.25, // expected random guess success rate
        };
    }

    // ==========================================
    // FEATURE 9: Anti-Bot Detection System
    // ==========================================

    analyzeSubmissionPatterns(application) {
        const flags = [];
        const riskScore = { total: 0, factors: [] };

        // Check for bot-like timing patterns
        const timingAnalysis = this.analyzeTimingPatterns(application.answers);
        if (timingAnalysis.suspicious) {
            flags.push({
                type: 'timing_anomaly',
                severity: timingAnalysis.severity,
                details: timingAnalysis.details,
                evidence: timingAnalysis.evidence
            });
            riskScore.total += timingAnalysis.severity === 'high' ? 30 : 15;
            riskScore.factors.push('Unusual timing patterns');
        }

        // Check for random guessing patterns
        const guessingAnalysis = this.detectRandomGuessing(application.answers);
        if (guessingAnalysis.detected) {
            flags.push({
                type: 'random_guessing',
                severity: guessingAnalysis.severity,
                details: guessingAnalysis.details,
                evidence: guessingAnalysis.evidence
            });
            riskScore.total += guessingAnalysis.severity === 'high' ? 25 : 10;
            riskScore.factors.push('Possible random guessing detected');
        }

        // Check for copy-paste behavior
        const copyPasteAnalysis = this.analyzeCopyPasteBehavior(application.proctoring);
        if (copyPasteAnalysis.suspicious) {
            flags.push({
                type: 'copy_paste_abuse',
                severity: copyPasteAnalysis.severity,
                details: copyPasteAnalysis.details
            });
            riskScore.total += copyPasteAnalysis.severity === 'high' ? 20 : 10;
            riskScore.factors.push('Excessive copy-paste activity');
        }

        // Check for identical answer patterns
        const identicalAnalysis = this.detectIdenticalPatterns(application.answers);
        if (identicalAnalysis.detected) {
            flags.push({
                type: 'identical_patterns',
                severity: 'medium',
                details: identicalAnalysis.details
            });
            riskScore.total += 15;
            riskScore.factors.push('Identical answer patterns');
        }

        // Check for impossible typing speeds
        const typingAnalysis = this.analyzeTypingSpeed(application.answers);
        if (typingAnalysis.suspicious) {
            flags.push({
                type: 'impossible_typing_speed',
                severity: 'high',
                details: typingAnalysis.details
            });
            riskScore.total += 25;
            riskScore.factors.push('Humanly impossible typing speed');
        }

        return {
            isBot: riskScore.total >= 50,
            riskScore: Math.min(riskScore.total, 100),
            riskLevel: riskScore.total >= 50 ? 'high' : riskScore.total >= 25 ? 'medium' : 'low',
            flags,
            riskFactors: riskScore.factors,
            recommendation: this.getRecommendation(riskScore.total),
            timestamp: new Date()
        };
    }

    analyzeTimingPatterns(answers) {
        if (!answers || answers.length === 0) {
            return { suspicious: false };
        }

        const times = answers.map(a => a.timeTaken || a.timeSpent || 0).filter(t => t > 0);
        if (times.length === 0) return { suspicious: false };

        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        const evidence = [];
        let suspicious = false;
        let severity = 'low';

        // Check for unnaturally fast answers
        const tooFastCount = times.filter(t => t < this.thresholds.minTimePerQuestion).length;
        if (tooFastCount > times.length * 0.5) {
            suspicious = true;
            severity = 'high';
            evidence.push(`${tooFastCount} answers completed in under ${this.thresholds.minTimePerQuestion} seconds`);
        }

        // Check for uniform timing (bot-like)
        const variance = this.calculateVariance(times);
        if (variance < 2 && times.length > 5) {
            suspicious = true;
            severity = severity === 'high' ? 'high' : 'medium';
            evidence.push('Suspiciously uniform answer timing');
        }

        // Check for very consistent time per question (automation signature)
        const coefficientOfVariation = Math.sqrt(variance) / avgTime;
        if (coefficientOfVariation < 0.1 && times.length > 3) {
            suspicious = true;
            severity = 'high';
            evidence.push('Machine-like consistency in timing');
        }

        return {
            suspicious,
            severity,
            details: `Average: ${avgTime.toFixed(1)}s, Min: ${minTime}s, Max: ${maxTime}s`,
            evidence,
            stats: { avgTime, minTime, maxTime, variance }
        };
    }

    detectRandomGuessing(answers) {
        const objectiveAnswers = answers.filter(a => a.type === 'objective' || a.questionType === 'objective');
        if (objectiveAnswers.length < 5) return { detected: false };

        const correctCount = objectiveAnswers.filter(a => a.isCorrect).length;
        const successRate = correctCount / objectiveAnswers.length;

        // Expected random guess rate for 4-option MCQ is 25%
        const isNearRandom = Math.abs(successRate - 0.25) < 0.1;

        // Check for patterns typical of random clicking
        const selectedOptions = objectiveAnswers.map(a => a.selectedOption || a.answer);
        const optionDistribution = this.calculateDistribution(selectedOptions);
        const isUniformDistribution = this.isUniform(optionDistribution, 4);

        const detected = isNearRandom && isUniformDistribution;

        return {
            detected,
            severity: detected ? 'medium' : 'low',
            details: `Success rate: ${(successRate * 100).toFixed(1)}%, Distribution: ${JSON.stringify(optionDistribution)}`,
            evidence: detected ? ['Answer pattern matches random selection'] : [],
            successRate,
            optionDistribution
        };
    }

    analyzeCopyPasteBehavior(proctoring) {
        if (!proctoring) return { suspicious: false };

        const copyPasteCount = proctoring.copyPasteEvents || 0;
        const tabSwitches = proctoring.tabSwitches || 0;

        const suspicious = copyPasteCount >= this.thresholds.suspiciousCopyPaste ||
            tabSwitches >= this.thresholds.suspiciousTabSwitches;

        return {
            suspicious,
            severity: copyPasteCount > 10 || tabSwitches > 10 ? 'high' : 'medium',
            details: `Copy-paste: ${copyPasteCount}, Tab switches: ${tabSwitches}`,
            copyPasteCount,
            tabSwitches
        };
    }

    detectIdenticalPatterns(answers) {
        const textAnswers = answers
            .filter(a => a.type === 'subjective' || a.answer?.length > 50)
            .map(a => a.textAnswer || a.answer || '');

        if (textAnswers.length < 2) return { detected: false };

        // Check for suspiciously similar answers
        const similarities = [];
        for (let i = 0; i < textAnswers.length; i++) {
            for (let j = i + 1; j < textAnswers.length; j++) {
                const similarity = this.calculateSimilarity(textAnswers[i], textAnswers[j]);
                if (similarity > 0.8) {
                    similarities.push({ i, j, similarity });
                }
            }
        }

        return {
            detected: similarities.length > 0,
            details: similarities.length > 0 ? `${similarities.length} pairs of nearly identical answers` : null,
            similarities
        };
    }

    analyzeTypingSpeed(answers) {
        const textAnswers = answers.filter(a =>
            (a.type === 'subjective' || a.type === 'coding') &&
            (a.textAnswer || a.code || a.answer)
        );

        if (textAnswers.length === 0) return { suspicious: false };

        const suspiciousAnswers = [];

        textAnswers.forEach(a => {
            const text = a.textAnswer || a.code || a.answer || '';
            const timeSeconds = a.timeTaken || a.timeSpent || 60;
            const charsPerMinute = (text.length / timeSeconds) * 60;

            if (charsPerMinute > this.thresholds.maxTypingSpeed) {
                suspiciousAnswers.push({
                    length: text.length,
                    time: timeSeconds,
                    speed: Math.round(charsPerMinute)
                });
            }
        });

        return {
            suspicious: suspiciousAnswers.length > 0,
            details: suspiciousAnswers.length > 0 ?
                `${suspiciousAnswers.length} answers with typing speed over ${this.thresholds.maxTypingSpeed} CPM` : null,
            suspiciousAnswers
        };
    }

    // ==========================================
    // FEATURE 10: Time-based Proctoring
    // ==========================================

    trackTimePerQuestion(applicationId, questionId, event) {
        // This would typically update the database
        // Returns tracking data for the proctoring system
        return {
            applicationId,
            questionId,
            event,
            timestamp: new Date(),
            tracked: true
        };
    }

    analyzeTimeDistribution(answers, assessmentDuration) {
        const totalTimeSpent = answers.reduce((sum, a) => sum + (a.timeTaken || a.timeSpent || 0), 0);
        const questionTimes = answers.map(a => ({
            questionId: a.questionId,
            type: a.type,
            timeSpent: a.timeTaken || a.timeSpent || 0,
            percentOfTotal: ((a.timeTaken || a.timeSpent || 0) / totalTimeSpent * 100).toFixed(1)
        }));

        const timeByType = {
            objective: 0,
            subjective: 0,
            coding: 0
        };

        answers.forEach(a => {
            const type = a.type || 'objective';
            timeByType[type] = (timeByType[type] || 0) + (a.timeTaken || a.timeSpent || 0);
        });

        const flags = [];

        // Flag questions answered too quickly
        const quickAnswers = questionTimes.filter(q => q.timeSpent < 5);
        if (quickAnswers.length > 3) {
            flags.push({
                type: 'rapid_answers',
                count: quickAnswers.length,
                severity: 'medium'
            });
        }

        // Flag if assessment completed much faster than expected
        const completionRate = totalTimeSpent / (assessmentDuration * 60);
        if (completionRate < 0.3) {
            flags.push({
                type: 'early_completion',
                details: `Completed in ${(completionRate * 100).toFixed(0)}% of allocated time`,
                severity: 'low'
            });
        }

        return {
            totalTimeSpent,
            assessmentDuration,
            completionPercentage: (completionRate * 100).toFixed(1),
            questionTimes,
            timeByType,
            flags,
            averageTimePerQuestion: (totalTimeSpent / answers.length).toFixed(1)
        };
    }

    generateProctoringReport(application, assessment) {
        const timingAnalysis = this.analyzeTimeDistribution(
            application.answers,
            assessment.duration
        );

        const botAnalysis = this.analyzeSubmissionPatterns(application);

        const suspiciousActivities = application.proctoring?.suspiciousActivities || [];

        return {
            summary: {
                totalTimeSpent: timingAnalysis.totalTimeSpent,
                completionRate: timingAnalysis.completionPercentage,
                tabSwitches: application.proctoring?.tabSwitches || 0,
                copyPasteEvents: application.proctoring?.copyPasteEvents || 0,
                botRiskScore: botAnalysis.riskScore,
                botRiskLevel: botAnalysis.riskLevel
            },
            timingAnalysis,
            botAnalysis,
            suspiciousActivities,
            flags: [...timingAnalysis.flags, ...botAnalysis.flags],
            recommendation: this.getRecommendation(botAnalysis.riskScore),
            integrityScore: Math.max(0, 100 - botAnalysis.riskScore),
            generatedAt: new Date()
        };
    }

    // Utility methods
    calculateVariance(numbers) {
        if (numbers.length === 0) return 0;
        const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        return numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
    }

    calculateDistribution(values) {
        const dist = {};
        values.forEach(v => {
            dist[v] = (dist[v] || 0) + 1;
        });
        return dist;
    }

    isUniform(distribution, expectedCategories) {
        const values = Object.values(distribution);
        if (values.length < expectedCategories) return false;
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = this.calculateVariance(values);
        return variance / mean < 0.5; // Low variance relative to mean
    }

    calculateSimilarity(str1, str2) {
        if (!str1 || !str2) return 0;
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return 1.0;

        const costs = [];
        for (let i = 0; i <= shorter.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= longer.length; j++) {
                if (i === 0) {
                    costs[j] = j;
                } else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (shorter.charAt(i - 1) !== longer.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0) costs[longer.length] = lastValue;
        }

        return (longer.length - costs[longer.length]) / longer.length;
    }

    getRecommendation(riskScore) {
        if (riskScore >= 70) {
            return {
                action: 'reject',
                message: 'High risk of fraudulent submission. Manual review strongly recommended.',
                confidence: 'high'
            };
        } else if (riskScore >= 50) {
            return {
                action: 'review',
                message: 'Moderate risk indicators detected. Manual review recommended.',
                confidence: 'medium'
            };
        } else if (riskScore >= 25) {
            return {
                action: 'flag',
                message: 'Minor anomalies detected. Consider for review if other flags exist.',
                confidence: 'low'
            };
        }
        return {
            action: 'proceed',
            message: 'No significant integrity concerns detected.',
            confidence: 'high'
        };
    }
}

module.exports = new AntiBotService();
