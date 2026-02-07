// src/pages/analytics/EnhancedAnalyticsPage.tsx
// FEATURE 13: Comprehensive Analytics Dashboard
// FEATURE 14: Candidate Ranking & Leaderboards
// FEATURE 15: Skill Gap Analysis
// FEATURE 18: Section-wise Performance Breakdown

import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
    Trophy, Users, Target, TrendingUp, Download, RefreshCw,
    AlertTriangle, CheckCircle, XCircle, Clock, Brain, Shield,
    FileText, BarChart2, Activity, Award, Zap
} from 'lucide-react';
import { analyticsAPI, proctoringAPI, jobsAPI } from '../../services/api';
import './AnalyticsPage.css';

interface Job {
    _id: string;
    title: string;
    department: string;
}

interface Analytics {
    overview: {
        totalCandidates: number;
        completed: number;
        pending: number;
        inProgress: number;
        shortlisted: number;
        rejected: number;
        flagged: number;
    };
    scores: {
        average: number;
        median: number;
        highest: number;
        lowest: number;
        standardDeviation: number;
    };
    passRate: number;
    qualifiedCount: number;
    scoreDistribution: Array<{ range: string; count: number }>;
    sectionPerformance: Array<{ section: string; avgScore: number }>;
    skillGap: Array<{
        skill: string;
        avgScore: number;
        gapLevel: string;
        candidatesAssessed: number;
    }>;
    topSkills: Array<{ name: string; demand: number; avgPerformance: number }>;
    completionTrend: Array<{ date: string; count: number }>;
    timeAnalysis: { average: number; fastest: number; slowest: number };
    qualityMetrics: { avgCredibility: number; flaggedSubmissions: number; flaggedPercentage: number };
}

interface LeaderboardEntry {
    rank: number;
    candidateName: string;
    candidateEmail: string;
    totalScore: number;
    percentile: number;
    status: string;
    completedAt: string;
    detailedScores?: any;
    aiRecommendation?: string;
    credibilityScore?: number;
}

interface IntegrityData {
    summary: {
        totalAnalyzed: number;
        highRisk: number;
        mediumRisk: number;
        lowRisk: number;
        avgIntegrityScore: number;
    };
    candidates: Array<{
        applicationId: string;
        candidateName: string;
        integrityScore: number;
        riskLevel: string;
    }>;
}

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const EnhancedAnalyticsPage: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>('');
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [integrityData, setIntegrityData] = useState<IntegrityData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard' | 'skills' | 'integrity'>('overview');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    useEffect(() => {
        if (selectedJobId) {
            fetchAllData();
        }
    }, [selectedJobId]);

    const fetchJobs = async () => {
        try {
            const res = await jobsAPI.getJobs();
            setJobs(res.data.data || res.data);
            if (res.data.data?.[0]?._id || res.data[0]?._id) {
                setSelectedJobId(res.data.data?.[0]?._id || res.data[0]?._id);
            }
        } catch (err) {
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllData = async () => {
        setRefreshing(true);
        try {
            const [analyticsRes, leaderboardRes, integrityRes] = await Promise.all([
                analyticsAPI.getJobAnalytics(selectedJobId),
                analyticsAPI.getLeaderboard(selectedJobId, { limit: 50, includeDetails: true }),
                proctoringAPI.getBulkIntegrityAnalysis(selectedJobId)
            ]);

            setAnalytics(analyticsRes.data.data);
            setLeaderboard(leaderboardRes.data.data || []);
            setIntegrityData(integrityRes.data.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setRefreshing(false);
        }
    };

    const handleExport = async (format: string) => {
        try {
            const res = await analyticsAPI.exportData(selectedJobId, format);
            const blob = new Blob([res.data], {
                type: format === 'csv' ? 'text/csv' : 'application/json'
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics_${selectedJobId}.${format}`;
            a.click();
        } catch (err) {
            console.error('Export error:', err);
        }
    };

    if (loading) {
        return (
            <div className="analytics-loading">
                <div className="spinner"></div>
                <p>Loading analytics dashboard...</p>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'shortlisted': return '#10b981';
            case 'rejected': return '#ef4444';
            case 'completed': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    const getGapColor = (level: string) => {
        switch (level) {
            case 'critical': return '#ef4444';
            case 'significant': return '#f59e0b';
            case 'minor': return '#eab308';
            default: return '#10b981';
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            default: return '#10b981';
        }
    };

    return (
        <div className="enhanced-analytics">
            {/* Header */}
            <div className="analytics-header">
                <div className="header-left">
                    <h1><BarChart2 className="icon" /> Analytics Dashboard</h1>
                    <p>Comprehensive insights powered by AI</p>
                </div>
                <div className="header-right">
                    <select
                        value={selectedJobId}
                        onChange={(e) => setSelectedJobId(e.target.value)}
                        className="job-select"
                    >
                        {jobs.map(job => (
                            <option key={job._id} value={job._id}>
                                {job.title} - {job.department}
                            </option>
                        ))}
                    </select>
                    <button className="btn-refresh" onClick={fetchAllData} disabled={refreshing}>
                        <RefreshCw className={`icon ${refreshing ? 'spinning' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <div className="export-dropdown">
                        <button className="btn-export">
                            <Download className="icon" /> Export
                        </button>
                        <div className="dropdown-content">
                            <button onClick={() => handleExport('csv')}>Export CSV</button>
                            <button onClick={() => handleExport('json')}>Export JSON</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="analytics-tabs">
                <button
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <Activity className="icon" /> Overview
                </button>
                <button
                    className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('leaderboard')}
                >
                    <Trophy className="icon" /> Leaderboard
                </button>
                <button
                    className={`tab ${activeTab === 'skills' ? 'active' : ''}`}
                    onClick={() => setActiveTab('skills')}
                >
                    <Target className="icon" /> Skill Analysis
                </button>
                <button
                    className={`tab ${activeTab === 'integrity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('integrity')}
                >
                    <Shield className="icon" /> Integrity
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && analytics && (
                <div className="tab-content overview-tab">
                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card primary">
                            <div className="stat-icon"><Users /></div>
                            <div className="stat-content">
                                <span className="stat-value">{analytics.overview.totalCandidates}</span>
                                <span className="stat-label">Total Candidates</span>
                            </div>
                        </div>
                        <div className="stat-card success">
                            <div className="stat-icon"><CheckCircle /></div>
                            <div className="stat-content">
                                <span className="stat-value">{analytics.overview.shortlisted}</span>
                                <span className="stat-label">Shortlisted</span>
                            </div>
                        </div>
                        <div className="stat-card warning">
                            <div className="stat-icon"><Clock /></div>
                            <div className="stat-content">
                                <span className="stat-value">{analytics.overview.pending + analytics.overview.inProgress}</span>
                                <span className="stat-label">In Progress</span>
                            </div>
                        </div>
                        <div className="stat-card info">
                            <div className="stat-icon"><TrendingUp /></div>
                            <div className="stat-content">
                                <span className="stat-value">{analytics.passRate}%</span>
                                <span className="stat-label">Pass Rate</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon"><Award /></div>
                            <div className="stat-content">
                                <span className="stat-value">{analytics.scores.average}</span>
                                <span className="stat-label">Avg Score</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon"><Zap /></div>
                            <div className="stat-content">
                                <span className="stat-value">{analytics.scores.highest}</span>
                                <span className="stat-label">Highest Score</span>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row 1 */}
                    <div className="charts-row">
                        <div className="chart-card">
                            <h3>Score Distribution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={analytics.scoreDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="range" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                                    />
                                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-card">
                            <h3>Pipeline Status</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Shortlisted', value: analytics.overview.shortlisted },
                                            { name: 'Completed', value: analytics.overview.completed - analytics.overview.shortlisted - analytics.overview.rejected },
                                            { name: 'Rejected', value: analytics.overview.rejected },
                                            { name: 'Pending', value: analytics.overview.pending },
                                            { name: 'In Progress', value: analytics.overview.inProgress }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {COLORS.map((color, index) => (
                                            <Cell key={`cell-${index}`} fill={color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Charts Row 2 */}
                    <div className="charts-row">
                        <div className="chart-card">
                            <h3>Completion Trend (Last 7 Days)</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={analytics.completionTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="date" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#06b6d4"
                                        fill="url(#colorGradient)"
                                    />
                                    <defs>
                                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-card">
                            <h3>Section Performance</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <RadarChart data={analytics.sectionPerformance}>
                                    <PolarGrid stroke="#374151" />
                                    <PolarAngleAxis dataKey="section" stroke="#9ca3af" />
                                    <PolarRadiusAxis stroke="#9ca3af" />
                                    <Radar
                                        name="Avg Score"
                                        dataKey="avgScore"
                                        stroke="#8b5cf6"
                                        fill="#8b5cf6"
                                        fillOpacity={0.3}
                                    />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quality Metrics */}
                    <div className="quality-metrics">
                        <h3><Shield className="icon" /> Quality Metrics</h3>
                        <div className="metrics-row">
                            <div className="metric">
                                <span className="metric-label">Avg Credibility</span>
                                <span className="metric-value">{analytics.qualityMetrics.avgCredibility}%</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">Flagged Submissions</span>
                                <span className="metric-value warning">{analytics.qualityMetrics.flaggedSubmissions}</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">Flagged %</span>
                                <span className="metric-value">{analytics.qualityMetrics.flaggedPercentage}%</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">Avg Time (min)</span>
                                <span className="metric-value">{analytics.timeAnalysis.average}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
                <div className="tab-content leaderboard-tab">
                    <div className="leaderboard-header">
                        <h2><Trophy className="icon gold" /> Top Performers</h2>
                        <span className="total-count">{leaderboard.length} candidates ranked</span>
                    </div>

                    {/* Podium for top 3 */}
                    <div className="podium">
                        {leaderboard.slice(0, 3).map((entry, index) => (
                            <div
                                key={entry.candidateEmail}
                                className={`podium-place place-${index + 1}`}
                            >
                                <div className="rank-badge">
                                    {index === 0 && '🥇'}
                                    {index === 1 && '🥈'}
                                    {index === 2 && '🥉'}
                                </div>
                                <div className="candidate-name">{entry.candidateName}</div>
                                <div className="score">{entry.totalScore}%</div>
                                <div className="percentile">Top {100 - entry.percentile}%</div>
                            </div>
                        ))}
                    </div>

                    {/* Full leaderboard table */}
                    <div className="leaderboard-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Candidate</th>
                                    <th>Score</th>
                                    <th>Percentile</th>
                                    <th>Status</th>
                                    <th>AI Recommendation</th>
                                    <th>Credibility</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map(entry => (
                                    <tr key={entry.candidateEmail}>
                                        <td className="rank">#{entry.rank}</td>
                                        <td>
                                            <div className="candidate-info">
                                                <span className="name">{entry.candidateName}</span>
                                                <span className="email">{entry.candidateEmail}</span>
                                            </div>
                                        </td>
                                        <td className="score">
                                            <span className="score-value">{entry.totalScore}%</span>
                                        </td>
                                        <td>
                                            <span className="percentile-badge">Top {100 - entry.percentile}%</span>
                                        </td>
                                        <td>
                                            <span
                                                className="status-badge"
                                                style={{ backgroundColor: getStatusColor(entry.status) }}
                                            >
                                                {entry.status}
                                            </span>
                                        </td>
                                        <td>{entry.aiRecommendation || '-'}</td>
                                        <td>
                                            <span className={`credibility ${(entry.credibilityScore || 100) < 70 ? 'low' : ''}`}>
                                                {entry.credibilityScore || 100}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Skill Analysis Tab */}
            {activeTab === 'skills' && analytics && (
                <div className="tab-content skills-tab">
                    <h2><Target className="icon" /> Skill Gap Analysis</h2>

                    <div className="skill-gap-grid">
                        {analytics.skillGap.map((skill, index) => (
                            <div key={skill.skill} className="skill-card">
                                <div className="skill-header">
                                    <span className="skill-name">{skill.skill}</span>
                                    <span
                                        className="gap-badge"
                                        style={{ backgroundColor: getGapColor(skill.gapLevel) }}
                                    >
                                        {skill.gapLevel}
                                    </span>
                                </div>
                                <div className="skill-progress">
                                    <div
                                        className="progress-bar"
                                        style={{
                                            width: `${skill.avgScore}%`,
                                            backgroundColor: COLORS[index % COLORS.length]
                                        }}
                                    ></div>
                                </div>
                                <div className="skill-stats">
                                    <span>Avg: {skill.avgScore}%</span>
                                    <span>{skill.candidatesAssessed} assessed</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Top Skills Chart */}
                    <div className="chart-card">
                        <h3>Top Skills by Demand</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.topSkills} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis type="number" stroke="#9ca3af" />
                                <YAxis type="category" dataKey="name" stroke="#9ca3af" width={100} />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                <Legend />
                                <Bar dataKey="demand" fill="#4f46e5" name="Demand" />
                                <Bar dataKey="avgPerformance" fill="#10b981" name="Avg Performance" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Integrity Tab */}
            {activeTab === 'integrity' && integrityData && (
                <div className="tab-content integrity-tab">
                    <h2><Shield className="icon" /> Integrity Analysis</h2>

                    {/* Summary Cards */}
                    <div className="integrity-summary">
                        <div className="summary-card">
                            <span className="value">{integrityData.summary.totalAnalyzed}</span>
                            <span className="label">Total Analyzed</span>
                        </div>
                        <div className="summary-card danger">
                            <span className="value">{integrityData.summary.highRisk}</span>
                            <span className="label">High Risk</span>
                        </div>
                        <div className="summary-card warning">
                            <span className="value">{integrityData.summary.mediumRisk}</span>
                            <span className="label">Medium Risk</span>
                        </div>
                        <div className="summary-card success">
                            <span className="value">{integrityData.summary.lowRisk}</span>
                            <span className="label">Low Risk</span>
                        </div>
                        <div className="summary-card">
                            <span className="value">{integrityData.summary.avgIntegrityScore}%</span>
                            <span className="label">Avg Integrity</span>
                        </div>
                    </div>

                    {/* Risk Distribution Chart */}
                    <div className="charts-row">
                        <div className="chart-card">
                            <h3>Risk Distribution</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'High Risk', value: integrityData.summary.highRisk, color: '#ef4444' },
                                            { name: 'Medium Risk', value: integrityData.summary.mediumRisk, color: '#f59e0b' },
                                            { name: 'Low Risk', value: integrityData.summary.lowRisk, color: '#10b981' }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label
                                    >
                                        <Cell fill="#ef4444" />
                                        <Cell fill="#f59e0b" />
                                        <Cell fill="#10b981" />
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-card">
                            <h3>Integrity Score Distribution</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={integrityData.candidates.slice(0, 15)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="candidateName" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                                    <YAxis stroke="#9ca3af" domain={[0, 100]} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                    <Bar dataKey="integrityScore" fill="#06b6d4" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Flagged Candidates Table */}
                    <div className="flagged-table">
                        <h3><AlertTriangle className="icon warning" /> Flagged Candidates</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Candidate</th>
                                    <th>Integrity Score</th>
                                    <th>Risk Level</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {integrityData.candidates
                                    .filter(c => c.riskLevel !== 'low')
                                    .map(candidate => (
                                        <tr key={candidate.applicationId}>
                                            <td>{candidate.candidateName}</td>
                                            <td>
                                                <span className={`score ${candidate.integrityScore < 50 ? 'low' : ''}`}>
                                                    {candidate.integrityScore}%
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className="risk-badge"
                                                    style={{ backgroundColor: getRiskColor(candidate.riskLevel) }}
                                                >
                                                    {candidate.riskLevel}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn-review">Review</button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnhancedAnalyticsPage;
