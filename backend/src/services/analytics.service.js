// src/services/analytics.service.js
// FEATURE 13: Comprehensive Analytics Dashboard
// FEATURE 14: Candidate Ranking & Leaderboards
// FEATURE 15: Skill Gap Analysis

const Application = require('../models/Application');
const Assessment = require('../models/Assessment');
const Job = require('../models/Job');

class AnalyticsService {
    // ==========================================
    // FEATURE 13: Comprehensive Analytics Dashboard
    // ==========================================

    async getJobAnalytics(jobId) {
        const applications = await Application.find({ job: jobId });

        if (applications.length === 0) {
            return this.getEmptyAnalytics();
        }

        const completed = applications.filter(a =>
            ['completed', 'shortlisted', 'rejected'].includes(a.status)
        );

        const scores = completed.map(a => a.totalScore || 0);

        return {
            overview: {
                totalCandidates: applications.length,
                completed: completed.length,
                pending: applications.filter(a => a.status === 'pending').length,
                inProgress: applications.filter(a => a.status === 'in-progress').length,
                shortlisted: applications.filter(a => a.status === 'shortlisted').length,
                rejected: applications.filter(a => a.status === 'rejected').length,
                flagged: applications.filter(a => a.status === 'flagged').length
            },
            scores: {
                average: this.calculateAverage(scores),
                median: this.calculateMedian(scores),
                highest: Math.max(...scores, 0),
                lowest: Math.min(...scores.filter(s => s > 0), 0),
                standardDeviation: this.calculateStdDev(scores)
            },
            passRate: completed.length > 0
                ? Math.round((applications.filter(a => a.status === 'shortlisted').length / completed.length) * 100)
                : 0,
            qualifiedCount: applications.filter(a => a.status === 'shortlisted').length,
            scoreDistribution: this.calculateScoreDistribution(scores),
            completionTrend: this.calculateCompletionTrend(applications),
            sectionPerformance: this.calculateSectionPerformance(completed),
            skillGap: await this.calculateSkillGapForJob(jobId, completed),
            topSkills: this.extractTopSkills(completed),
            timeAnalysis: this.analyzeTimeMetrics(completed),
            qualityMetrics: this.calculateQualityMetrics(completed)
        };
    }

    async getDashboardStats(recruiterId) {
        const jobs = await Job.find({ recruiter: recruiterId });
        const jobIds = jobs.map(j => j._id);
        const applications = await Application.find({ job: { $in: jobIds } });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thisWeek = new Date(today);
        thisWeek.setDate(thisWeek.getDate() - 7);
        const thisMonth = new Date(today);
        thisMonth.setMonth(thisMonth.getMonth() - 1);

        return {
            overview: {
                totalJobs: jobs.length,
                activeJobs: jobs.filter(j => j.status === 'active').length,
                totalApplications: applications.length,
                todayApplications: applications.filter(a => new Date(a.createdAt) >= today).length,
                weekApplications: applications.filter(a => new Date(a.createdAt) >= thisWeek).length,
                monthApplications: applications.filter(a => new Date(a.createdAt) >= thisMonth).length
            },
            pipeline: {
                pending: applications.filter(a => a.status === 'pending').length,
                inProgress: applications.filter(a => a.status === 'in-progress').length,
                completed: applications.filter(a => a.status === 'completed').length,
                shortlisted: applications.filter(a => a.status === 'shortlisted').length,
                rejected: applications.filter(a => a.status === 'rejected').length
            },
            avgScoreByJob: await this.calculateAvgScoreByJob(jobs, applications),
            applicationTrend: this.calculateApplicationTrend(applications),
            topPerformingJobs: this.getTopPerformingJobs(jobs, applications),
            conversionRates: this.calculateConversionRates(applications),
            recentActivity: this.getRecentActivity(applications)
        };
    }

    // ==========================================
    // FEATURE 14: Candidate Ranking & Leaderboards
    // ==========================================

    async getLeaderboard(jobId, options = {}) {
        const { limit = 100, includeDetails = true, minScore = 0 } = options;

        const applications = await Application.find({
            job: jobId,
            status: { $in: ['completed', 'shortlisted', 'rejected'] },
            totalScore: { $gte: minScore }
        })
            .sort({ totalScore: -1, completedAt: 1 })
            .limit(limit);

        const totalCompleted = await Application.countDocuments({
            job: jobId,
            status: { $in: ['completed', 'shortlisted', 'rejected'] }
        });

        return applications.map((app, index) => {
            const rank = index + 1;
            const percentile = Math.round(((totalCompleted - rank + 1) / totalCompleted) * 100);

            const entry = {
                rank,
                candidateName: app.candidateName,
                candidateEmail: app.candidateEmail,
                totalScore: app.totalScore,
                percentile,
                status: app.status,
                completedAt: app.completedAt
            };

            if (includeDetails) {
                entry.detailedScores = app.detailedScores;
                entry.aiRecommendation = app.aiRecommendation;
                entry.credibilityScore = app.credibilityScore;
                entry.timeTaken = app.timeTaken;
            }

            return entry;
        });
    }

    async updateRankings(jobId) {
        const applications = await Application.find({
            job: jobId,
            status: { $in: ['completed', 'shortlisted', 'rejected'] }
        }).sort({ totalScore: -1, completedAt: 1 });

        const totalCompleted = applications.length;

        const updatePromises = applications.map((app, index) => {
            const rank = index + 1;
            const percentile = Math.round(((totalCompleted - rank + 1) / totalCompleted) * 100);

            return Application.findByIdAndUpdate(app._id, {
                rank,
                percentile
            });
        });

        await Promise.all(updatePromises);

        return { updated: applications.length };
    }

    async getPercentileRank(applicationId) {
        const application = await Application.findById(applicationId);
        if (!application) return null;

        const allScores = await Application.find({
            job: application.job,
            status: { $in: ['completed', 'shortlisted', 'rejected'] }
        }).select('totalScore');

        const scores = allScores.map(a => a.totalScore);
        const myScore = application.totalScore;
        const below = scores.filter(s => s < myScore).length;

        return Math.round((below / scores.length) * 100);
    }

    // ==========================================
    // FEATURE 15: Skill Gap Analysis
    // ==========================================

    async calculateSkillGapForJob(jobId, applications) {
        const job = await Job.findById(jobId);
        if (!job || !applications.length) return [];

        const requiredSkills = job.skills || [];
        const skillScores = {};

        // Initialize skill scores
        requiredSkills.forEach(skill => {
            skillScores[skill] = { total: 0, count: 0, scores: [] };
        });

        // Aggregate scores by skill
        applications.forEach(app => {
            if (app.skillAnalysis) {
                app.skillAnalysis.forEach(sa => {
                    if (skillScores[sa.skill]) {
                        const percentage = sa.maxScore > 0
                            ? (sa.score / sa.maxScore) * 100
                            : 0;
                        skillScores[sa.skill].total += percentage;
                        skillScores[sa.skill].count += 1;
                        skillScores[sa.skill].scores.push(percentage);
                    }
                });
            }
        });

        // Calculate averages and identify gaps
        return requiredSkills.map(skill => {
            const data = skillScores[skill];
            const avgScore = data.count > 0 ? Math.round(data.total / data.count) : 0;
            const variance = this.calculateVariance(data.scores);

            let gapLevel = 'none';
            if (avgScore < 40) gapLevel = 'critical';
            else if (avgScore < 60) gapLevel = 'significant';
            else if (avgScore < 75) gapLevel = 'minor';

            return {
                skill,
                avgScore,
                candidatesAssessed: data.count,
                gapLevel,
                variance: Math.round(variance),
                distribution: this.getSkillDistribution(data.scores),
                recommendation: this.getSkillRecommendation(avgScore, gapLevel)
            };
        }).sort((a, b) => a.avgScore - b.avgScore);
    }

    async getCandidateSkillGap(applicationId) {
        const application = await Application.findById(applicationId)
            .populate('job');

        if (!application) return null;

        const requiredSkills = application.job?.skills || [];
        const skillAnalysis = application.skillAnalysis || [];
        const claimedSkills = application.resumeData?.skills || [];

        const gaps = [];

        requiredSkills.forEach(skill => {
            const assessment = skillAnalysis.find(s =>
                s.skill.toLowerCase() === skill.toLowerCase()
            );
            const claimed = claimedSkills.some(s =>
                s.toLowerCase().includes(skill.toLowerCase())
            );

            const score = assessment ? Math.round((assessment.score / assessment.maxScore) * 100) : 0;

            let status = 'met';
            if (score < 40) status = 'critical_gap';
            else if (score < 60) status = 'gap';
            else if (score < 75) status = 'developing';

            gaps.push({
                skill,
                required: true,
                claimed,
                assessedScore: score,
                status,
                mismatch: claimed && score < 50,
                recommendation: this.getIndividualRecommendation(skill, score, claimed)
            });
        });

        return {
            applicationId,
            candidateName: application.candidateName,
            overallScore: application.totalScore,
            criticalGaps: gaps.filter(g => g.status === 'critical_gap').length,
            totalGaps: gaps.filter(g => ['critical_gap', 'gap'].includes(g.status)).length,
            skillsAnalyzed: gaps.length,
            gaps,
            summary: this.generateGapSummary(gaps)
        };
    }

    // ==========================================
    // FEATURE 18: Section-wise Performance Breakdown
    // ==========================================

    getSectionBreakdown(answers, questions) {
        const sections = {
            objective: { total: 0, scored: 0, questions: [], avgTime: 0 },
            subjective: { total: 0, scored: 0, questions: [], avgTime: 0 },
            coding: { total: 0, scored: 0, questions: [], avgTime: 0 }
        };

        answers.forEach(answer => {
            const question = questions.find(q => q._id.toString() === answer.questionId?.toString());
            const type = answer.questionType || question?.type || 'objective';

            if (sections[type]) {
                sections[type].scored += answer.score || 0;
                sections[type].total += answer.maxScore || question?.points || 10;
                sections[type].questions.push({
                    questionId: answer.questionId,
                    score: answer.score,
                    maxScore: answer.maxScore || question?.points,
                    timeTaken: answer.timeTaken
                });
            }
        });

        Object.keys(sections).forEach(type => {
            const s = sections[type];
            s.percentage = s.total > 0 ? Math.round((s.scored / s.total) * 100) : 0;
            s.questionsAttempted = s.questions.length;
            s.avgTime = s.questions.length > 0
                ? Math.round(s.questions.reduce((sum, q) => sum + (q.timeTaken || 0), 0) / s.questions.length)
                : 0;
            s.performance = this.getPerformanceLevel(s.percentage);
        });

        return sections;
    }

    // Utility methods
    calculateAverage(arr) {
        if (arr.length === 0) return 0;
        return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    }

    calculateMedian(arr) {
        if (arr.length === 0) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
    }

    calculateStdDev(arr) {
        if (arr.length === 0) return 0;
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        const squareDiffs = arr.map(value => Math.pow(value - mean, 2));
        return Math.round(Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / arr.length));
    }

    calculateVariance(arr) {
        if (arr.length === 0) return 0;
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
    }

    calculateScoreDistribution(scores) {
        const ranges = [
            { range: '90-100', min: 90, max: 100, count: 0 },
            { range: '80-89', min: 80, max: 89, count: 0 },
            { range: '70-79', min: 70, max: 79, count: 0 },
            { range: '60-69', min: 60, max: 69, count: 0 },
            { range: '50-59', min: 50, max: 59, count: 0 },
            { range: '40-49', min: 40, max: 49, count: 0 },
            { range: '0-39', min: 0, max: 39, count: 0 }
        ];

        scores.forEach(score => {
            const range = ranges.find(r => score >= r.min && score <= r.max);
            if (range) range.count++;
        });

        return ranges;
    }

    calculateSectionPerformance(applications) {
        const sections = { objective: [], subjective: [], coding: [] };

        applications.forEach(app => {
            if (app.detailedScores) {
                if (app.detailedScores.technical !== undefined) {
                    sections.objective.push(app.detailedScores.technical);
                }
                if (app.detailedScores.communication !== undefined) {
                    sections.subjective.push(app.detailedScores.communication);
                }
                if (app.detailedScores.coding !== undefined) {
                    sections.coding.push(app.detailedScores.coding);
                }
            }
        });

        return [
            { section: 'Objective', avgScore: this.calculateAverage(sections.objective) },
            { section: 'Subjective', avgScore: this.calculateAverage(sections.subjective) },
            { section: 'Coding', avgScore: this.calculateAverage(sections.coding) }
        ];
    }

    extractTopSkills(applications) {
        const skillCounts = {};

        applications.forEach(app => {
            if (app.skillAnalysis) {
                app.skillAnalysis.forEach(sa => {
                    if (!skillCounts[sa.skill]) {
                        skillCounts[sa.skill] = { total: 0, count: 0 };
                    }
                    const percentage = sa.maxScore > 0 ? (sa.score / sa.maxScore) * 100 : 0;
                    skillCounts[sa.skill].total += percentage;
                    skillCounts[sa.skill].count += 1;
                });
            }
        });

        return Object.entries(skillCounts)
            .map(([skill, data]) => ({
                name: skill,
                demand: data.count,
                avgPerformance: Math.round(data.total / data.count)
            }))
            .sort((a, b) => b.demand - a.demand)
            .slice(0, 10);
    }

    calculateCompletionTrend(applications) {
        const last7Days = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const count = applications.filter(a => {
                const completedAt = new Date(a.completedAt);
                return completedAt >= date && completedAt < nextDate;
            }).length;

            last7Days.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                count
            });
        }

        return last7Days;
    }

    analyzeTimeMetrics(applications) {
        const times = applications
            .map(a => a.timeTaken)
            .filter(t => t && t > 0);

        if (times.length === 0) {
            return { average: 0, fastest: 0, slowest: 0 };
        }

        return {
            average: Math.round(this.calculateAverage(times) / 60), // in minutes
            fastest: Math.round(Math.min(...times) / 60),
            slowest: Math.round(Math.max(...times) / 60),
            median: Math.round(this.calculateMedian(times) / 60)
        };
    }

    calculateQualityMetrics(applications) {
        const credibilityScores = applications
            .map(a => a.credibilityScore)
            .filter(s => s !== undefined);

        const flaggedCount = applications.filter(a =>
            a.proctoring?.tabSwitches > 5 ||
            a.proctoring?.copyPasteEvents > 3 ||
            a.status === 'flagged'
        ).length;

        return {
            avgCredibility: this.calculateAverage(credibilityScores),
            flaggedSubmissions: flaggedCount,
            flaggedPercentage: applications.length > 0
                ? Math.round((flaggedCount / applications.length) * 100)
                : 0
        };
    }

    calculateConversionRates(applications) {
        const total = applications.length;
        const completed = applications.filter(a => a.status !== 'pending' && a.status !== 'in-progress').length;
        const shortlisted = applications.filter(a => a.status === 'shortlisted').length;

        return {
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            qualificationRate: completed > 0 ? Math.round((shortlisted / completed) * 100) : 0,
            overallConversion: total > 0 ? Math.round((shortlisted / total) * 100) : 0
        };
    }

    getTopPerformingJobs(jobs, applications) {
        return jobs
            .map(job => {
                const jobApps = applications.filter(a => a.job?.toString() === job._id.toString());
                const completed = jobApps.filter(a => a.status !== 'pending' && a.status !== 'in-progress');
                const avgScore = this.calculateAverage(completed.map(a => a.totalScore || 0));

                return {
                    jobId: job._id,
                    title: job.title,
                    applications: jobApps.length,
                    avgScore,
                    shortlisted: jobApps.filter(a => a.status === 'shortlisted').length
                };
            })
            .sort((a, b) => b.avgScore - a.avgScore)
            .slice(0, 5);
    }

    getRecentActivity(applications) {
        return applications
            .filter(a => a.completedAt)
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
            .slice(0, 10)
            .map(a => ({
                candidateName: a.candidateName,
                status: a.status,
                score: a.totalScore,
                completedAt: a.completedAt
            }));
    }

    async calculateAvgScoreByJob(jobs, applications) {
        return jobs.slice(0, 5).map(job => {
            const jobApps = applications.filter(a => a.job?.toString() === job._id.toString());
            const scores = jobApps.map(a => a.totalScore || 0).filter(s => s > 0);
            return {
                job: job.title,
                avgScore: this.calculateAverage(scores),
                count: jobApps.length
            };
        });
    }

    calculateApplicationTrend(applications) {
        // Last 30 days trend
        const trend = [];
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const count = applications.filter(a => {
                const createdAt = new Date(a.createdAt);
                return createdAt >= date && createdAt < nextDate;
            }).length;

            trend.push({
                date: date.toISOString().split('T')[0],
                applications: count
            });
        }

        return trend;
    }

    getSkillDistribution(scores) {
        return {
            excellent: scores.filter(s => s >= 90).length,
            good: scores.filter(s => s >= 70 && s < 90).length,
            average: scores.filter(s => s >= 50 && s < 70).length,
            poor: scores.filter(s => s < 50).length
        };
    }

    getSkillRecommendation(avgScore, gapLevel) {
        if (gapLevel === 'critical') {
            return 'Critical skill gap. Consider updating job requirements or providing training.';
        }
        if (gapLevel === 'significant') {
            return 'Significant gap. May need to broaden candidate pool or adjust expectations.';
        }
        if (gapLevel === 'minor') {
            return 'Minor gap. Most candidates meet basic requirements.';
        }
        return 'No significant gap. Candidates perform well in this area.';
    }

    getIndividualRecommendation(skill, score, claimed) {
        if (claimed && score < 50) {
            return `Resume-skill mismatch detected. Claimed ${skill} expertise not demonstrated.`;
        }
        if (score < 40) {
            return `Significant development needed in ${skill}.`;
        }
        if (score < 60) {
            return `Basic ${skill} proficiency. Consider additional training.`;
        }
        if (score < 75) {
            return `Good ${skill} foundation. Ready for growth opportunities.`;
        }
        return `Strong ${skill} skills. Exceeds requirements.`;
    }

    generateGapSummary(gaps) {
        const critical = gaps.filter(g => g.status === 'critical_gap');
        const mismatches = gaps.filter(g => g.mismatch);

        let summary = '';

        if (critical.length > 0) {
            summary += `Critical gaps in: ${critical.map(g => g.skill).join(', ')}. `;
        }

        if (mismatches.length > 0) {
            summary += `Resume-skill mismatches: ${mismatches.map(g => g.skill).join(', ')}. `;
        }

        if (critical.length === 0 && mismatches.length === 0) {
            summary = 'Candidate skills align well with requirements.';
        }

        return summary;
    }

    getPerformanceLevel(percentage) {
        if (percentage >= 90) return 'Excellent';
        if (percentage >= 75) return 'Good';
        if (percentage >= 60) return 'Satisfactory';
        if (percentage >= 40) return 'Needs Improvement';
        return 'Poor';
    }

    getEmptyAnalytics() {
        return {
            overview: {
                totalCandidates: 0, completed: 0, pending: 0, inProgress: 0,
                shortlisted: 0, rejected: 0, flagged: 0
            },
            scores: { average: 0, median: 0, highest: 0, lowest: 0, standardDeviation: 0 },
            passRate: 0,
            qualifiedCount: 0,
            scoreDistribution: [],
            completionTrend: [],
            sectionPerformance: [],
            skillGap: [],
            topSkills: []
        };
    }
}

module.exports = new AnalyticsService();
