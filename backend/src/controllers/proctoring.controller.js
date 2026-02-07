// src/controllers/proctoring.controller.js
// Controller for Anti-Bot Detection, Proctoring, and Plagiarism APIs

const AntiBotService = require('../services/antiBot.service');
const EnhancedPlagiarismService = require('../services/enhancedPlagiarism.service');
const Application = require('../models/Application');
const Assessment = require('../models/Assessment');

// FEATURE 9: Anti-Bot Detection System
exports.analyzeSubmission = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const analysis = AntiBotService.analyzeSubmissionPatterns(application);

        // Update application with bot analysis results
        await Application.findByIdAndUpdate(applicationId, {
            'proctoring.botAnalysis': analysis,
            'proctoring.integrityScore': analysis.integrityScore
        });

        res.status(200).json({
            success: true,
            data: analysis
        });
    } catch (error) {
        console.error('Bot analysis error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// FEATURE 10: Time-based Proctoring
exports.trackActivity = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { activityType, questionId, details, severity } = req.body;

        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Track different activity types
        const updateData = {};

        switch (activityType) {
            case 'tab-switch':
                updateData['proctoring.tabSwitches'] = (application.proctoring?.tabSwitches || 0) + 1;
                break;
            case 'copy-paste':
                updateData['proctoring.copyPasteEvents'] = (application.proctoring?.copyPasteEvents || 0) + 1;
                break;
            case 'focus-lost':
            case 'right-click':
            case 'keyboard-shortcut':
                // These are just logged as suspicious activities
                break;
        }

        await Application.findByIdAndUpdate(applicationId, {
            ...updateData,
            $push: {
                'proctoring.suspiciousActivities': {
                    type: activityType,
                    questionId,
                    details,
                    severity: severity || 'low',
                    timestamp: new Date()
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Activity tracked'
        });
    } catch (error) {
        console.error('Activity tracking error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getTimeAnalysis = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await Application.findById(applicationId)
            .populate('assessment');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const timeAnalysis = AntiBotService.analyzeTimeDistribution(
            application.answers,
            application.assessment?.duration || 60
        );

        res.status(200).json({
            success: true,
            data: timeAnalysis
        });
    } catch (error) {
        console.error('Time analysis error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getProctoringReport = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await Application.findById(applicationId)
            .populate('assessment');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const report = AntiBotService.generateProctoringReport(
            application,
            application.assessment
        );

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Proctoring report error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// FEATURE 6: Plagiarism & Code Similarity Detection
exports.checkCodePlagiarism = async (req, res) => {
    try {
        const { code, language, questionId, applicationId } = req.body;

        if (!code || !language) {
            return res.status(400).json({
                success: false,
                message: 'Code and language are required'
            });
        }

        const analysis = await EnhancedPlagiarismService.analyzeSubmission(
            code,
            language,
            questionId,
            applicationId
        );

        // Update application with plagiarism results
        if (applicationId) {
            await Application.findByIdAndUpdate(applicationId, {
                $push: {
                    'plagiarismCheck.results': {
                        questionId,
                        ...analysis
                    }
                },
                'plagiarismCheck.checked': true,
                'plagiarismCheck.lastCheckedAt': new Date()
            });
        }

        res.status(200).json({
            success: true,
            data: analysis
        });
    } catch (error) {
        console.error('Plagiarism check error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.batchCheckPlagiarism = async (req, res) => {
    try {
        const { submissions } = req.body;

        if (!submissions || !Array.isArray(submissions)) {
            return res.status(400).json({
                success: false,
                message: 'Submissions array is required'
            });
        }

        const results = await EnhancedPlagiarismService.batchAnalyze(submissions);

        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Batch plagiarism check error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getCandidateIntegrity = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await Application.findById(applicationId)
            .populate('assessment');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Generate comprehensive integrity report
        const botAnalysis = AntiBotService.analyzeSubmissionPatterns(application);
        const proctoringReport = AntiBotService.generateProctoringReport(
            application,
            application.assessment
        );

        // Get code plagiarism results if any coding answers
        const codingAnswers = application.answers?.filter(a =>
            a.type === 'coding' || a.questionType === 'coding'
        ) || [];

        let plagiarismSummary = { checked: false };
        if (application.plagiarismCheck?.results?.length > 0) {
            const results = application.plagiarismCheck.results;
            plagiarismSummary = {
                checked: true,
                totalChecked: results.length,
                flagged: results.filter(r => r.plagiarismScore > 40).length,
                avgPlagiarismScore: Math.round(
                    results.reduce((sum, r) => sum + (r.plagiarismScore || 0), 0) / results.length
                )
            };
        }

        const overallIntegrity = {
            score: Math.round((100 - botAnalysis.riskScore +
                (100 - (plagiarismSummary.avgPlagiarismScore || 0))) / 2),
            level: 'high',
            flags: [...botAnalysis.flags]
        };

        if (overallIntegrity.score < 50) overallIntegrity.level = 'low';
        else if (overallIntegrity.score < 75) overallIntegrity.level = 'medium';

        res.status(200).json({
            success: true,
            data: {
                applicationId,
                candidateName: application.candidateName,
                overallIntegrity,
                botAnalysis: {
                    riskScore: botAnalysis.riskScore,
                    riskLevel: botAnalysis.riskLevel,
                    flags: botAnalysis.flags,
                    recommendation: botAnalysis.recommendation
                },
                proctoring: proctoringReport.summary,
                plagiarism: plagiarismSummary,
                credibilityScore: application.credibilityScore || 100,
                generatedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Integrity check error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Bulk integrity analysis for a job
exports.getBulkIntegrityAnalysis = async (req, res) => {
    try {
        const { jobId } = req.params;

        const applications = await Application.find({
            job: jobId,
            status: { $in: ['completed', 'shortlisted', 'rejected', 'flagged'] }
        });

        const analysisResults = applications.map(app => {
            const botAnalysis = AntiBotService.analyzeSubmissionPatterns(app);
            return {
                applicationId: app._id,
                candidateName: app.candidateName,
                totalScore: app.totalScore,
                status: app.status,
                integrityScore: Math.max(0, 100 - botAnalysis.riskScore),
                riskLevel: botAnalysis.riskLevel,
                flagsCount: botAnalysis.flags.length,
                tabSwitches: app.proctoring?.tabSwitches || 0,
                copyPasteEvents: app.proctoring?.copyPasteEvents || 0
            };
        });

        // Summary statistics
        const summary = {
            totalAnalyzed: analysisResults.length,
            highRisk: analysisResults.filter(r => r.riskLevel === 'high').length,
            mediumRisk: analysisResults.filter(r => r.riskLevel === 'medium').length,
            lowRisk: analysisResults.filter(r => r.riskLevel === 'low').length,
            avgIntegrityScore: Math.round(
                analysisResults.reduce((sum, r) => sum + r.integrityScore, 0) / analysisResults.length
            ) || 0
        };

        res.status(200).json({
            success: true,
            data: {
                summary,
                candidates: analysisResults.sort((a, b) => a.integrityScore - b.integrityScore)
            }
        });
    } catch (error) {
        console.error('Bulk integrity analysis error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
