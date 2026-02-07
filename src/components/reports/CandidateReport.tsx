// src/components/reports/CandidateReport.tsx
// FEATURE 11: Automated Report Generation
// FEATURE 20: Explainable AI Scoring

import React, { useState, useEffect } from 'react';
import {
    Download, Printer, Share2, ChevronDown, ChevronUp,
    User, Mail, Phone, Calendar, Award, Target, Brain,
    CheckCircle, XCircle, AlertTriangle, Shield, Clock,
    BarChart2, Code, FileText, TrendingUp
} from 'lucide-react';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { analyticsAPI, proctoringAPI } from '../../services/api';
import './CandidateReport.css';

interface ReportData {
    candidateInfo: {
        name: string;
        email: string;
        phone: string;
        appliedFor: string;
        department: string;
        applicationDate: string;
        completionDate: string;
    };
    assessmentInfo: {
        title: string;
        duration: number;
        totalQuestions: number;
        questionsAttempted: number;
        timeTaken: number;
    };
    scores: {
        overall: number;
        weighted: number;
        percentile: number;
        rank: number;
        bySection: {
            objective: { scored: number; total: number; percentage: number };
            subjective: { scored: number; total: number; percentage: number };
            coding: { scored: number; total: number; percentage: number };
        };
    };
    skillAnalysis: Array<{
        skill: string;
        score: number;
        maxScore: number;
        percentage: number;
        level: string;
    }>;
    performance: {
        status: string;
        recommendation: string;
        reasoning: string;
    };
    aiInsights: {
        strengths: string[];
        weaknesses: string[];
        recommendation: string;
        confidenceScore: number;
    };
    integrityCheck: {
        credibilityScore: number;
        proctoring: {
            tabSwitches: number;
            copyPasteEvents: number;
            flaggedForReview: boolean;
        };
        skillGaps: Array<{
            skill: string;
            claimed: boolean;
            actualScore: number;
            severity: string;
        }>;
    };
}

interface CandidateReportProps {
    applicationId: string;
    onClose?: () => void;
}

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const CandidateReport: React.FC<CandidateReportProps> = ({ applicationId, onClose }) => {
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'skills', 'ai']));

    useEffect(() => {
        fetchReport();
    }, [applicationId]);

    const fetchReport = async () => {
        try {
            const res = await analyticsAPI.generateCandidateReport(applicationId, 'json');
            setReport(res.data.data);
        } catch (err) {
            console.error('Error fetching report:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        } else {
            newExpanded.add(section);
        }
        setExpandedSections(newExpanded);
    };

    const handleDownloadPDF = async () => {
        try {
            const res = await analyticsAPI.generateCandidateReport(applicationId, 'pdf');
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `candidate_report_${applicationId}.pdf`;
            a.click();
        } catch (err) {
            console.error('Download error:', err);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="report-loading">
                <div className="spinner"></div>
                <p>Generating report...</p>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="report-error">
                <AlertTriangle className="icon" />
                <p>Failed to load report</p>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'shortlisted': return '#10b981';
            case 'rejected': return '#ef4444';
            default: return '#f59e0b';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#06b6d4';
        if (score >= 40) return '#f59e0b';
        return '#ef4444';
    };

    const skillChartData = report.skillAnalysis.map(s => ({
        skill: s.skill,
        score: s.percentage,
        fullMark: 100
    }));

    const sectionData = [
        { name: 'Objective', score: report.scores.bySection.objective.percentage },
        { name: 'Subjective', score: report.scores.bySection.subjective.percentage },
        { name: 'Coding', score: report.scores.bySection.coding.percentage }
    ];

    return (
        <div className="candidate-report">
            {/* Header Actions */}
            <div className="report-actions">
                <button onClick={handleDownloadPDF} className="btn-action">
                    <Download className="icon" /> Download PDF
                </button>
                <button onClick={handlePrint} className="btn-action">
                    <Printer className="icon" /> Print
                </button>
                {onClose && (
                    <button onClick={onClose} className="btn-close">
                        &times;
                    </button>
                )}
            </div>

            {/* Report Content */}
            <div className="report-content">
                {/* Candidate Header */}
                <div className="report-header">
                    <div className="candidate-avatar">
                        {report.candidateInfo.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="candidate-details">
                        <h1>{report.candidateInfo.name}</h1>
                        <div className="detail-row">
                            <span><Mail className="icon" /> {report.candidateInfo.email}</span>
                            {report.candidateInfo.phone && (
                                <span><Phone className="icon" /> {report.candidateInfo.phone}</span>
                            )}
                        </div>
                        <div className="applied-for">
                            Applied for: <strong>{report.candidateInfo.appliedFor}</strong>
                            <span className="department">({report.candidateInfo.department})</span>
                        </div>
                    </div>
                    <div
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(report.performance.status) }}
                    >
                        {report.performance.status.toUpperCase()}
                    </div>
                </div>

                {/* Overall Score Card */}
                <div className="score-hero">
                    <div className="score-circle" style={{ borderColor: getScoreColor(report.scores.overall) }}>
                        <span className="score-value">{report.scores.overall}</span>
                        <span className="score-label">Overall Score</span>
                    </div>
                    <div className="score-details">
                        <div className="score-item">
                            <span className="label">Percentile</span>
                            <span className="value">Top {100 - report.scores.percentile}%</span>
                        </div>
                        <div className="score-item">
                            <span className="label">Rank</span>
                            <span className="value">#{report.scores.rank}</span>
                        </div>
                        <div className="score-item">
                            <span className="label">Weighted Score</span>
                            <span className="value">{report.scores.weighted}%</span>
                        </div>
                        <div className="score-item">
                            <span className="label">Credibility</span>
                            <span className="value">{report.integrityCheck.credibilityScore}%</span>
                        </div>
                    </div>
                </div>

                {/* Section Performance */}
                <div className="report-section">
                    <div
                        className="section-header"
                        onClick={() => toggleSection('overview')}
                    >
                        <h2><BarChart2 className="icon" /> Section Performance</h2>
                        {expandedSections.has('overview') ? <ChevronUp /> : <ChevronDown />}
                    </div>

                    {expandedSections.has('overview') && (
                        <div className="section-content">
                            <div className="section-grid">
                                <div className="section-card">
                                    <div className="section-icon objective">
                                        <CheckCircle />
                                    </div>
                                    <div className="section-info">
                                        <span className="section-name">Objective</span>
                                        <span className="section-score">
                                            {report.scores.bySection.objective.scored}/{report.scores.bySection.objective.total}
                                        </span>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{
                                                    width: `${report.scores.bySection.objective.percentage}%`,
                                                    backgroundColor: '#0ea5e9'
                                                }}
                                            ></div>
                                        </div>
                                        <span className="percentage">{report.scores.bySection.objective.percentage}%</span>
                                    </div>
                                </div>

                                <div className="section-card">
                                    <div className="section-icon subjective">
                                        <FileText />
                                    </div>
                                    <div className="section-info">
                                        <span className="section-name">Subjective</span>
                                        <span className="section-score">
                                            {report.scores.bySection.subjective.scored}/{report.scores.bySection.subjective.total}
                                        </span>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{
                                                    width: `${report.scores.bySection.subjective.percentage}%`,
                                                    backgroundColor: '#8b5cf6'
                                                }}
                                            ></div>
                                        </div>
                                        <span className="percentage">{report.scores.bySection.subjective.percentage}%</span>
                                    </div>
                                </div>

                                <div className="section-card">
                                    <div className="section-icon coding">
                                        <Code />
                                    </div>
                                    <div className="section-info">
                                        <span className="section-name">Coding</span>
                                        <span className="section-score">
                                            {report.scores.bySection.coding.scored}/{report.scores.bySection.coding.total}
                                        </span>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{
                                                    width: `${report.scores.bySection.coding.percentage}%`,
                                                    backgroundColor: '#10b981'
                                                }}
                                            ></div>
                                        </div>
                                        <span className="percentage">{report.scores.bySection.coding.percentage}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={sectionData} layout="vertical">
                                        <XAxis type="number" domain={[0, 100]} />
                                        <YAxis type="category" dataKey="name" width={100} />
                                        <Tooltip />
                                        <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                                            {sectionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>

                {/* Skill Analysis */}
                <div className="report-section">
                    <div
                        className="section-header"
                        onClick={() => toggleSection('skills')}
                    >
                        <h2><Target className="icon" /> Skill Analysis</h2>
                        {expandedSections.has('skills') ? <ChevronUp /> : <ChevronDown />}
                    </div>

                    {expandedSections.has('skills') && (
                        <div className="section-content">
                            <div className="skills-chart">
                                <ResponsiveContainer width="100%" height={300}>
                                    <RadarChart data={skillChartData}>
                                        <PolarGrid stroke="#374151" />
                                        <PolarAngleAxis dataKey="skill" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9ca3af" />
                                        <Radar
                                            name="Score"
                                            dataKey="score"
                                            stroke="#8b5cf6"
                                            fill="#8b5cf6"
                                            fillOpacity={0.3}
                                        />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="skills-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Skill</th>
                                            <th>Score</th>
                                            <th>Level</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.skillAnalysis.map(skill => (
                                            <tr key={skill.skill}>
                                                <td>{skill.skill}</td>
                                                <td>
                                                    <div className="skill-score">
                                                        <div
                                                            className="skill-bar"
                                                            style={{
                                                                width: `${skill.percentage}%`,
                                                                backgroundColor: getScoreColor(skill.percentage)
                                                            }}
                                                        ></div>
                                                        <span>{skill.percentage}%</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`level-badge ${skill.level.toLowerCase()}`}>
                                                        {skill.level}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Insights - FEATURE 20: Explainable AI */}
                <div className="report-section ai-section">
                    <div
                        className="section-header"
                        onClick={() => toggleSection('ai')}
                    >
                        <h2><Brain className="icon" /> AI-Powered Insights</h2>
                        <span className="confidence-badge">
                            {report.aiInsights.confidenceScore}% Confidence
                        </span>
                        {expandedSections.has('ai') ? <ChevronUp /> : <ChevronDown />}
                    </div>

                    {expandedSections.has('ai') && (
                        <div className="section-content">
                            <div className="insights-grid">
                                <div className="insight-card strengths">
                                    <h4><TrendingUp className="icon green" /> Strengths</h4>
                                    <ul>
                                        {report.aiInsights.strengths.map((strength, i) => (
                                            <li key={i}>
                                                <CheckCircle className="icon" />
                                                {strength}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="insight-card weaknesses">
                                    <h4><AlertTriangle className="icon orange" /> Areas for Improvement</h4>
                                    <ul>
                                        {report.aiInsights.weaknesses.map((weakness, i) => (
                                            <li key={i}>
                                                <XCircle className="icon" />
                                                {weakness}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="ai-recommendation">
                                <h4>AI Recommendation</h4>
                                <p className="recommendation-text">{report.aiInsights.recommendation}</p>
                                <div className="reasoning">
                                    <h5>Reasoning</h5>
                                    <p>{report.performance.reasoning}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Integrity Check */}
                <div className="report-section">
                    <div
                        className="section-header"
                        onClick={() => toggleSection('integrity')}
                    >
                        <h2><Shield className="icon" /> Integrity Check</h2>
                        {report.integrityCheck.proctoring.flaggedForReview && (
                            <span className="flag-badge">⚠️ Flagged</span>
                        )}
                        {expandedSections.has('integrity') ? <ChevronUp /> : <ChevronDown />}
                    </div>

                    {expandedSections.has('integrity') && (
                        <div className="section-content">
                            <div className="integrity-metrics">
                                <div className="metric">
                                    <span className="metric-label">Credibility Score</span>
                                    <span
                                        className="metric-value"
                                        style={{ color: getScoreColor(report.integrityCheck.credibilityScore) }}
                                    >
                                        {report.integrityCheck.credibilityScore}%
                                    </span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Tab Switches</span>
                                    <span className={`metric-value ${report.integrityCheck.proctoring.tabSwitches > 5 ? 'warning' : ''}`}>
                                        {report.integrityCheck.proctoring.tabSwitches}
                                    </span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Copy/Paste Events</span>
                                    <span className={`metric-value ${report.integrityCheck.proctoring.copyPasteEvents > 3 ? 'warning' : ''}`}>
                                        {report.integrityCheck.proctoring.copyPasteEvents}
                                    </span>
                                </div>
                            </div>

                            {report.integrityCheck.skillGaps.length > 0 && (
                                <div className="skill-gaps">
                                    <h4>Resume-Skill Mismatches</h4>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Skill</th>
                                                <th>Claimed</th>
                                                <th>Actual Score</th>
                                                <th>Severity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.integrityCheck.skillGaps.map((gap, i) => (
                                                <tr key={i}>
                                                    <td>{gap.skill}</td>
                                                    <td>{gap.claimed ? '✓' : '✗'}</td>
                                                    <td>{gap.actualScore}%</td>
                                                    <td>
                                                        <span className={`severity-badge ${gap.severity}`}>
                                                            {gap.severity}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Assessment Info */}
                <div className="report-section">
                    <div
                        className="section-header"
                        onClick={() => toggleSection('assessment')}
                    >
                        <h2><Clock className="icon" /> Assessment Details</h2>
                        {expandedSections.has('assessment') ? <ChevronUp /> : <ChevronDown />}
                    </div>

                    {expandedSections.has('assessment') && (
                        <div className="section-content">
                            <div className="assessment-details">
                                <div className="detail">
                                    <span className="label">Assessment</span>
                                    <span className="value">{report.assessmentInfo.title}</span>
                                </div>
                                <div className="detail">
                                    <span className="label">Duration</span>
                                    <span className="value">{report.assessmentInfo.duration} minutes</span>
                                </div>
                                <div className="detail">
                                    <span className="label">Time Taken</span>
                                    <span className="value">{Math.round(report.assessmentInfo.timeTaken / 60)} minutes</span>
                                </div>
                                <div className="detail">
                                    <span className="label">Questions Attempted</span>
                                    <span className="value">
                                        {report.assessmentInfo.questionsAttempted}/{report.assessmentInfo.totalQuestions}
                                    </span>
                                </div>
                                <div className="detail">
                                    <span className="label">Applied On</span>
                                    <span className="value">
                                        {new Date(report.candidateInfo.applicationDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="detail">
                                    <span className="label">Completed On</span>
                                    <span className="value">
                                        {new Date(report.candidateInfo.completionDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="report-footer">
                    <p>Report generated on {new Date().toLocaleString()}</p>
                    <p>AI Hiring Platform - Confidential</p>
                </div>
            </div>
        </div>
    );
};

export default CandidateReport;
