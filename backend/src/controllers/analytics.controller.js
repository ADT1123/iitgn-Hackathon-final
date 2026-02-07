// src/controllers/analytics.controller.js
// Controller for Analytics, Leaderboard, and Export APIs

const AnalyticsService = require('../services/analytics.service');
const ReportGeneratorService = require('../services/reportGenerator.service');
const Application = require('../models/Application');
const Assessment = require('../models/Assessment');
const Job = require('../models/Job');

// FEATURE 13: Comprehensive Analytics Dashboard
exports.getJobAnalytics = async (req, res) => {
    try {
        const { jobId } = req.params;

        const analytics = await AnalyticsService.getJobAnalytics(jobId);

        res.status(200).json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const stats = await AnalyticsService.getDashboardStats(req.user.id);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// FEATURE 14: Candidate Ranking & Leaderboards
exports.getLeaderboard = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { limit = 100, includeDetails = true, minScore = 0 } = req.query;

        const leaderboard = await AnalyticsService.getLeaderboard(jobId, {
            limit: parseInt(limit),
            includeDetails: includeDetails === 'true',
            minScore: parseInt(minScore)
        });

        res.status(200).json({
            success: true,
            count: leaderboard.length,
            data: leaderboard
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateRankings = async (req, res) => {
    try {
        const { jobId } = req.params;

        const result = await AnalyticsService.updateRankings(jobId);

        res.status(200).json({
            success: true,
            message: `Updated rankings for ${result.updated} candidates`
        });
    } catch (error) {
        console.error('Update rankings error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// FEATURE 15: Skill Gap Analysis
exports.getSkillGapAnalysis = async (req, res) => {
    try {
        const { jobId } = req.params;

        const applications = await Application.find({
            job: jobId,
            status: { $in: ['completed', 'shortlisted', 'rejected'] }
        });

        const skillGap = await AnalyticsService.calculateSkillGapForJob(jobId, applications);

        res.status(200).json({
            success: true,
            data: {
                jobId,
                candidatesAnalyzed: applications.length,
                skillGap
            }
        });
    } catch (error) {
        console.error('Skill gap error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getCandidateSkillGap = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const analysis = await AnalyticsService.getCandidateSkillGap(applicationId);

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.status(200).json({
            success: true,
            data: analysis
        });
    } catch (error) {
        console.error('Candidate skill gap error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// FEATURE 11 & 12: Report Generation & Export
exports.generateCandidateReport = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { format = 'json' } = req.query;

        const application = await Application.findById(applicationId)
            .populate('job')
            .populate('assessment');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const reportData = await ReportGeneratorService.generateCandidateReport(
            application,
            application.assessment,
            application.job,
            application.aiInsights
        );

        if (format === 'pdf') {
            const pdfBuffer = await ReportGeneratorService.generatePDFReport(reportData);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=candidate_report_${applicationId}.pdf`);
            return res.send(pdfBuffer);
        }

        res.status(200).json({
            success: true,
            data: reportData
        });
    } catch (error) {
        console.error('Report generation error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.exportJobData = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { format = 'csv', includeAnswers = false, includeProctoring = false } = req.query;

        const applications = await Application.find({ job: jobId })
            .populate('job')
            .populate('assessment')
            .sort({ totalScore: -1 });

        let exportData;
        let contentType;
        let filename;

        switch (format) {
            case 'csv':
                exportData = ReportGeneratorService.exportToCSV(applications);
                contentType = 'text/csv';
                filename = `applications_${jobId}.csv`;
                break;

            case 'json':
                exportData = ReportGeneratorService.exportToJSON(applications, {
                    includeAnswers: includeAnswers === 'true',
                    includeProctoring: includeProctoring === 'true'
                });
                contentType = 'application/json';
                filename = `applications_${jobId}.json`;
                break;

            case 'excel':
                const excelData = ReportGeneratorService.exportToExcel(applications);
                exportData = JSON.stringify(excelData);
                contentType = 'application/json';
                filename = `applications_${jobId}_excel.json`;
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid format. Use csv, json, or excel'
                });
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(exportData);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.generateBulkReport = async (req, res) => {
    try {
        const { jobId } = req.params;

        const [applications, job] = await Promise.all([
            Application.find({ job: jobId }).sort({ totalScore: -1 }),
            Job.findById(jobId)
        ]);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        const report = ReportGeneratorService.generateBulkReport(applications, job);

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Bulk report error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ATS Integration Export
exports.exportForATS = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { atsFormat = 'generic' } = req.query;

        const applications = await Application.find({
            job: jobId,
            status: { $in: ['completed', 'shortlisted'] }
        });

        const exportData = ReportGeneratorService.formatForATS(applications, atsFormat);

        res.status(200).json({
            success: true,
            format: atsFormat,
            count: applications.length,
            data: exportData
        });
    } catch (error) {
        console.error('ATS export error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// FEATURE 18: Section-wise Performance
exports.getSectionBreakdown = async (req, res) => {
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

        const breakdown = AnalyticsService.getSectionBreakdown(
            application.answers,
            application.assessment?.questions || []
        );

        res.status(200).json({
            success: true,
            data: breakdown
        });
    } catch (error) {
        console.error('Section breakdown error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
