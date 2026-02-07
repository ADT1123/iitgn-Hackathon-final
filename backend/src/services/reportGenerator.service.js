// src/services/reportGenerator.service.js
// FEATURE 11: Automated Report Generation
// FEATURE 12: Export & Integration APIs

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ReportGeneratorService {
    constructor() {
        this.reportsDir = path.join(__dirname, '../../reports');
        // Create reports directory if it doesn't exist
        if (!fs.existsSync(this.reportsDir)) {
            fs.mkdirSync(this.reportsDir, { recursive: true });
        }
    }

    // ==========================================
    // FEATURE 11: Automated Report Generation
    // ==========================================

    async generateCandidateReport(application, assessment, job, aiInsights = {}) {
        const reportData = {
            candidateInfo: {
                name: application.candidateName,
                email: application.candidateEmail,
                phone: application.phone || 'N/A',
                appliedFor: job.title,
                department: job.department,
                applicationDate: application.createdAt,
                completionDate: application.completedAt
            },
            assessmentInfo: {
                title: assessment.title,
                duration: assessment.duration,
                totalQuestions: assessment.totalQuestions,
                questionsAttempted: application.answers?.length || 0,
                timeTaken: application.timeTaken || 0
            },
            scores: {
                overall: application.totalScore,
                weighted: application.weightedScore,
                percentile: application.percentile,
                rank: application.rank,
                detailed: application.detailedScores || {},
                bySection: this.calculateSectionScores(application.answers)
            },
            skillAnalysis: this.formatSkillAnalysis(application.skillAnalysis || []),
            performance: {
                status: application.status,
                recommendation: application.aiRecommendation,
                reasoning: application.aiReasoning
            },
            aiInsights: {
                strengths: aiInsights.strengths || [],
                weaknesses: aiInsights.weaknesses || [],
                recommendation: aiInsights.recommendation || 'Review pending',
                confidenceScore: aiInsights.confidenceScore || 0
            },
            integrityCheck: {
                credibilityScore: application.credibilityScore || 100,
                proctoring: this.formatProctoringData(application.proctoring),
                skillGaps: application.skillGaps || []
            },
            generatedAt: new Date()
        };

        return reportData;
    }

    calculateSectionScores(answers) {
        if (!answers || answers.length === 0) return {};

        const sections = { objective: { scored: 0, total: 0 }, subjective: { scored: 0, total: 0 }, coding: { scored: 0, total: 0 } };

        answers.forEach(a => {
            const type = a.questionType || a.type || 'objective';
            if (sections[type]) {
                sections[type].scored += a.score || 0;
                sections[type].total += a.maxScore || 10;
            }
        });

        Object.keys(sections).forEach(key => {
            sections[key].percentage = sections[key].total > 0
                ? Math.round((sections[key].scored / sections[key].total) * 100)
                : 0;
        });

        return sections;
    }

    formatSkillAnalysis(skillAnalysis) {
        return skillAnalysis.map(s => ({
            skill: s.skill,
            score: s.score,
            maxScore: s.maxScore,
            percentage: s.maxScore > 0 ? Math.round((s.score / s.maxScore) * 100) : 0,
            performance: s.performance,
            level: this.getSkillLevel(s.score, s.maxScore)
        }));
    }

    getSkillLevel(score, maxScore) {
        const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
        if (percentage >= 90) return 'Expert';
        if (percentage >= 75) return 'Advanced';
        if (percentage >= 60) return 'Intermediate';
        if (percentage >= 40) return 'Basic';
        return 'Beginner';
    }

    formatProctoringData(proctoring) {
        if (!proctoring) return { clean: true };

        return {
            tabSwitches: proctoring.tabSwitches || 0,
            copyPasteEvents: proctoring.copyPasteEvents || 0,
            suspiciousActivities: (proctoring.suspiciousActivities || []).length,
            flaggedForReview: proctoring.tabSwitches > 5 || proctoring.copyPasteEvents > 3,
            totalTimeSpent: proctoring.totalTimeSpent || 0
        };
    }

    // Generate PDF Report
    async generatePDFReport(reportData) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50 });
                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Header
                doc.fontSize(24).fillColor('#1e40af').text('Candidate Assessment Report', { align: 'center' });
                doc.moveDown();

                // Candidate Info
                doc.fontSize(16).fillColor('#334155').text('Candidate Information');
                doc.fontSize(11).fillColor('#475569');
                doc.text(`Name: ${reportData.candidateInfo.name}`);
                doc.text(`Email: ${reportData.candidateInfo.email}`);
                doc.text(`Applied For: ${reportData.candidateInfo.appliedFor}`);
                doc.text(`Application Date: ${new Date(reportData.candidateInfo.applicationDate).toLocaleDateString()}`);
                doc.moveDown();

                // Overall Score Box
                doc.fontSize(16).fillColor('#334155').text('Overall Performance');
                doc.rect(50, doc.y, 200, 60).fill('#f1f5f9');
                doc.fontSize(36).fillColor('#1e40af').text(`${reportData.scores.overall}%`, 80, doc.y - 50);
                doc.fontSize(10).fillColor('#64748b').text('OVERALL SCORE', 80, doc.y + 5);
                doc.moveDown(3);

                // Section Scores
                doc.fontSize(14).fillColor('#334155').text('Section Breakdown');
                const sections = reportData.scores.bySection;
                Object.keys(sections).forEach(section => {
                    const s = sections[section];
                    doc.fontSize(11).fillColor('#475569')
                        .text(`${section.charAt(0).toUpperCase() + section.slice(1)}: ${s.percentage}% (${s.scored}/${s.total})`);
                });
                doc.moveDown();

                // Skill Analysis
                if (reportData.skillAnalysis.length > 0) {
                    doc.fontSize(14).fillColor('#334155').text('Skill Analysis');
                    reportData.skillAnalysis.forEach(skill => {
                        doc.fontSize(11).fillColor('#475569')
                            .text(`${skill.skill}: ${skill.percentage}% - ${skill.level}`);
                    });
                    doc.moveDown();
                }

                // AI Insights
                doc.fontSize(14).fillColor('#334155').text('AI-Powered Insights');
                doc.fontSize(11).fillColor('#475569');

                if (reportData.aiInsights.strengths.length > 0) {
                    doc.text('Strengths:');
                    reportData.aiInsights.strengths.forEach(s => doc.text(`  • ${s}`));
                }

                if (reportData.aiInsights.weaknesses.length > 0) {
                    doc.text('Areas for Improvement:');
                    reportData.aiInsights.weaknesses.forEach(w => doc.text(`  • ${w}`));
                }

                doc.text(`Recommendation: ${reportData.aiInsights.recommendation}`);
                doc.text(`AI Confidence: ${reportData.aiInsights.confidenceScore}%`);
                doc.moveDown();

                // Integrity Check
                doc.fontSize(14).fillColor('#334155').text('Integrity Check');
                doc.fontSize(11).fillColor('#475569');
                doc.text(`Credibility Score: ${reportData.integrityCheck.credibilityScore}%`);
                doc.text(`Tab Switches: ${reportData.integrityCheck.proctoring.tabSwitches}`);
                doc.text(`Copy-Paste Events: ${reportData.integrityCheck.proctoring.copyPasteEvents}`);
                if (reportData.integrityCheck.proctoring.flaggedForReview) {
                    doc.fillColor('#dc2626').text('⚠ Flagged for Manual Review');
                }
                doc.moveDown();

                // Final Status
                doc.fontSize(14).fillColor('#334155').text('Final Status');
                const statusColor = reportData.performance.status === 'shortlisted' ? '#16a34a' :
                    reportData.performance.status === 'rejected' ? '#dc2626' : '#ca8a04';
                doc.fontSize(12).fillColor(statusColor)
                    .text(reportData.performance.status.toUpperCase());
                doc.moveDown();

                // Footer
                doc.fontSize(9).fillColor('#94a3b8')
                    .text(`Report generated on ${new Date().toLocaleString()}`, { align: 'center' });
                doc.text('AI Hiring Platform - Confidential', { align: 'center' });

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    // ==========================================
    // FEATURE 12: Export & Integration APIs
    // ==========================================

    exportToCSV(applications, includeFields = []) {
        const defaultFields = [
            'candidateName', 'candidateEmail', 'totalScore', 'weightedScore',
            'status', 'rank', 'percentile', 'createdAt', 'completedAt'
        ];

        const fields = includeFields.length > 0 ? includeFields : defaultFields;

        // CSV Header
        let csv = fields.join(',') + '\n';

        // CSV Rows
        applications.forEach(app => {
            const row = fields.map(field => {
                let value = this.getNestedValue(app, field);
                if (value === undefined || value === null) value = '';
                if (typeof value === 'object') value = JSON.stringify(value);
                // Escape commas and quotes
                value = String(value).replace(/"/g, '""');
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    value = `"${value}"`;
                }
                return value;
            });
            csv += row.join(',') + '\n';
        });

        return csv;
    }

    exportToJSON(applications, options = {}) {
        const { includeAnswers = false, includeProctoring = false, pretty = true } = options;

        const exportData = applications.map(app => {
            const data = {
                id: app._id,
                candidateName: app.candidateName,
                candidateEmail: app.candidateEmail,
                phone: app.phone,
                jobId: app.job?._id || app.job,
                assessmentId: app.assessment?._id || app.assessment,
                scores: {
                    overall: app.totalScore,
                    weighted: app.weightedScore,
                    detailed: app.detailedScores
                },
                ranking: {
                    rank: app.rank,
                    percentile: app.percentile
                },
                status: app.status,
                aiRecommendation: app.aiRecommendation,
                aiReasoning: app.aiReasoning,
                credibilityScore: app.credibilityScore,
                skillGaps: app.skillGaps,
                timestamps: {
                    applied: app.createdAt,
                    started: app.startedAt,
                    completed: app.completedAt
                }
            };

            if (includeAnswers) {
                data.answers = app.answers;
            }

            if (includeProctoring) {
                data.proctoring = app.proctoring;
            }

            return data;
        });

        return pretty ? JSON.stringify(exportData, null, 2) : JSON.stringify(exportData);
    }

    exportToExcel(applications) {
        // Return data formatted for Excel export (to be used with xlsx library)
        const headers = [
            'Rank', 'Name', 'Email', 'Phone', 'Overall Score', 'Weighted Score',
            'Technical Score', 'Problem Solving', 'Communication', 'Coding Score',
            'Percentile', 'Status', 'AI Recommendation', 'Credibility Score',
            'Completed At'
        ];

        const rows = applications.map(app => [
            app.rank || '-',
            app.candidateName,
            app.candidateEmail,
            app.phone || '-',
            app.totalScore || 0,
            app.weightedScore || 0,
            app.detailedScores?.technical || 0,
            app.detailedScores?.problemSolving || 0,
            app.detailedScores?.communication || 0,
            app.detailedScores?.coding || 0,
            app.percentile || 0,
            app.status,
            app.aiRecommendation || '-',
            app.credibilityScore || 100,
            app.completedAt ? new Date(app.completedAt).toLocaleString() : '-'
        ]);

        return { headers, rows };
    }

    generateBulkReport(applications, job) {
        const totalApplications = applications.length;
        const completed = applications.filter(a => a.status !== 'pending' && a.status !== 'in-progress').length;
        const shortlisted = applications.filter(a => a.status === 'shortlisted').length;
        const rejected = applications.filter(a => a.status === 'rejected').length;

        const scores = applications.map(a => a.totalScore || 0).filter(s => s > 0);
        const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
        const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

        // Score distribution
        const distribution = {
            '90-100': 0, '80-89': 0, '70-79': 0, '60-69': 0,
            '50-59': 0, '40-49': 0, '0-39': 0
        };

        scores.forEach(score => {
            if (score >= 90) distribution['90-100']++;
            else if (score >= 80) distribution['80-89']++;
            else if (score >= 70) distribution['70-79']++;
            else if (score >= 60) distribution['60-69']++;
            else if (score >= 50) distribution['50-59']++;
            else if (score >= 40) distribution['40-49']++;
            else distribution['0-39']++;
        });

        // Top performers
        const topPerformers = [...applications]
            .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
            .slice(0, 10)
            .map((a, idx) => ({
                rank: idx + 1,
                name: a.candidateName,
                email: a.candidateEmail,
                score: a.totalScore,
                status: a.status
            }));

        return {
            jobInfo: {
                title: job.title,
                department: job.department,
                location: job.location
            },
            summary: {
                totalApplications,
                completed,
                pending: totalApplications - completed,
                shortlisted,
                rejected,
                passRate: completed > 0 ? Math.round((shortlisted / completed) * 100) : 0
            },
            scoreStatistics: {
                average: Math.round(avgScore),
                highest: highestScore,
                lowest: lowestScore,
                median: this.calculateMedian(scores)
            },
            scoreDistribution: distribution,
            topPerformers,
            generatedAt: new Date()
        };
    }

    // ATS/HRMS Integration Format
    formatForATS(applications, format = 'generic') {
        const formatters = {
            generic: this.formatGenericATS,
            greenhouse: this.formatGreenhouse,
            lever: this.formatLever,
            workday: this.formatWorkday
        };

        const formatter = formatters[format] || formatters.generic;
        return formatter.call(this, applications);
    }

    formatGenericATS(applications) {
        return applications.map(app => ({
            external_id: app._id.toString(),
            first_name: app.candidateName.split(' ')[0],
            last_name: app.candidateName.split(' ').slice(1).join(' ') || '',
            email: app.candidateEmail,
            phone: app.phone,
            status: this.mapStatusToATS(app.status),
            score: app.totalScore,
            percentile: app.percentile,
            assessment_date: app.completedAt,
            notes: `AI Recommendation: ${app.aiRecommendation || 'N/A'}. ${app.aiReasoning || ''}`
        }));
    }

    formatGreenhouse(applications) {
        return applications.map(app => ({
            candidate: {
                first_name: app.candidateName.split(' ')[0],
                last_name: app.candidateName.split(' ').slice(1).join(' ') || '',
                email_addresses: [{ value: app.candidateEmail, type: 'personal' }],
                phone_numbers: app.phone ? [{ value: app.phone, type: 'mobile' }] : []
            },
            application: {
                source: 'AI Hiring Platform',
                referrer: null
            },
            scorecard: {
                overall_recommendation: this.mapRecommendation(app.aiRecommendation),
                attributes: [
                    { name: 'Assessment Score', rating: this.mapScoreToRating(app.totalScore) }
                ]
            }
        }));
    }

    formatLever(applications) {
        return applications.map(app => ({
            performAs: null,
            parse: false,
            emails: [app.candidateEmail],
            name: app.candidateName,
            phones: app.phone ? [{ value: app.phone }] : [],
            tags: [app.status, `Score: ${app.totalScore}`],
            sources: ['AI Hiring Platform']
        }));
    }

    formatWorkday(applications) {
        return applications.map(app => ({
            Candidate_ID: app._id.toString(),
            Legal_Name: app.candidateName,
            Email_Address: app.candidateEmail,
            Phone_Number: app.phone || '',
            Application_Status: this.mapStatusToWorkday(app.status),
            Assessment_Score: app.totalScore,
            Assessment_Percentile: app.percentile,
            Assessment_Date: app.completedAt
        }));
    }

    // Utility methods
    getNestedValue(obj, path) {
        return path.split('.').reduce((o, p) => o && o[p], obj);
    }

    calculateMedian(arr) {
        if (arr.length === 0) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    mapStatusToATS(status) {
        const mapping = {
            'shortlisted': 'advanced',
            'rejected': 'rejected',
            'completed': 'in_review',
            'pending': 'applied',
            'in-progress': 'assessment'
        };
        return mapping[status] || status;
    }

    mapRecommendation(rec) {
        const mapping = {
            'strong-hire': 'strong_yes',
            'hire': 'yes',
            'maybe': 'no_decision',
            'no-hire': 'no'
        };
        return mapping[rec] || 'no_decision';
    }

    mapScoreToRating(score) {
        if (score >= 90) return 5;
        if (score >= 75) return 4;
        if (score >= 60) return 3;
        if (score >= 40) return 2;
        return 1;
    }

    mapStatusToWorkday(status) {
        const mapping = {
            'shortlisted': 'Shortlisted',
            'rejected': 'Disqualified',
            'completed': 'Assessment Complete',
            'pending': 'Applied',
            'in-progress': 'In Assessment'
        };
        return mapping[status] || status;
    }
}

module.exports = new ReportGeneratorService();
