import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { applicationAPI } from '@/services/api';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Award,
  TrendingUp,
  TrendingDown,
  Loader2,
  Brain,
  Target,
  AlertCircle
} from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

export const CandidateDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadCandidate();
  }, [id]);

  const loadCandidate = async () => {
    try {
      setLoading(true);
      const [appResponse, analyticsResponse] = await Promise.all([
        applicationAPI.getApplicationById(id!),
        applicationAPI.getAnalytics(id!)
      ]);

      setApplication(appResponse.data.data || appResponse.data);
      setAnalytics(analyticsResponse.data.data || analyticsResponse.data);
    } catch (error) {
      console.error('Failed to load candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      await applicationAPI.updateStatus(id!, status);
      alert(`Status updated to ${status}`);
      loadCandidate();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await applicationAPI.downloadReport(id!, 'pdf');
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${application.candidateName}_Report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download report');
    }
  };

  const getRecommendationBadge = (recommendation: string) => {
    const variants: any = {
      'strong-hire': 'success',
      'hire': 'info',
      'maybe': 'warning',
      'no-hire': 'danger'
    };
    return variants[recommendation] || 'default';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!application) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Candidate not found</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/candidates')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {application.candidateName}
              </h1>
              <div className="flex items-center gap-3 text-slate-600 mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {application.candidateEmail}
                </span>
                {application.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {application.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleDownloadReport}>
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleUpdateStatus('shortlisted')}
              disabled={application.status === 'shortlisted'}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Shortlist
            </Button>
            <Button
              variant="danger"
              onClick={() => handleUpdateStatus('rejected')}
              disabled={application.status === 'rejected'}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-5 gap-6">
          <Card>
            <p className="text-sm text-slate-600 mb-1">Overall Score</p>
            <p className="text-3xl font-bold text-blue-600">{application.totalScore}%</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-600 mb-1">Weighted Score</p>
            <p className="text-3xl font-bold text-purple-600">{application.weightedScore}%</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-600 mb-1">Rank</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-slate-900">#{application.rank || '—'}</p>
              {application.rank && application.rank <= 3 && (
                <Award className="w-6 h-6 text-amber-500" />
              )}
            </div>
          </Card>
          <Card>
            <p className="text-sm text-slate-600 mb-1">Percentile</p>
            <p className="text-3xl font-bold text-green-600">{application.percentile || 0}th</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-600 mb-1">Status</p>
            <Badge
              variant={
                application.status === 'shortlisted' ? 'success' :
                application.status === 'rejected' ? 'danger' : 'info'
              }
              className="text-base px-3 py-1"
            >
              {application.status}
            </Badge>
          </Card>
        </div>

        {/* AI Recommendation Card */}
        {application.aiRecommendation && (
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-slate-900">AI Hiring Recommendation</h3>
                  <Badge variant={getRecommendationBadge(application.aiRecommendation)}>
                    {application.aiRecommendation.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
                <p className="text-slate-700">{application.aiReasoning}</p>
                {application.autoEvaluated && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-purple-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>Auto-evaluated by AI</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Detailed Scores */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Detailed Performance</h2>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Technical</span>
                <span className="text-lg font-bold text-blue-600">
                  {application.detailedScores?.technical || 0}%
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${application.detailedScores?.technical || 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Problem Solving</span>
                <span className="text-lg font-bold text-green-600">
                  {application.detailedScores?.problemSolving || 0}%
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 rounded-full"
                  style={{ width: `${application.detailedScores?.problemSolving || 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Communication</span>
                <span className="text-lg font-bold text-purple-600">
                  {application.detailedScores?.communication || 0}%
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: `${application.detailedScores?.communication || 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Coding</span>
                <span className="text-lg font-bold text-amber-600">
                  {application.detailedScores?.coding || 0}%
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-600 rounded-full"
                  style={{ width: `${application.detailedScores?.coding || 0}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Skills Breakdown */}
        {analytics?.skillBreakdown && (
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Skill Performance</h2>
            <div className="grid grid-cols-2 gap-8">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={analytics.skillBreakdown}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#64748b' }} />
                  <Radar dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>

              <div className="space-y-4">
                {analytics.skillBreakdown.map((skill: any, idx: number) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900">{skill.skill}</span>
                      <span className="text-sm font-bold text-blue-600">{skill.score}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${skill.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Section Performance */}
        {analytics?.sectionScores && (
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Section Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.sectionScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="section" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="score" name="Score" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="avgScore" name="Average" fill="#cbd5e1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Strengths</h3>
            </div>
            <div className="space-y-3">
              {analytics?.strengths?.map((strength: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700">{strength}</p>
                </div>
              )) || (
                <p className="text-slate-500 text-center py-4">No data available</p>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Areas for Improvement</h3>
            </div>
            <div className="space-y-3">
              {analytics?.weaknesses?.map((weakness: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700">{weakness}</p>
                </div>
              )) || (
                <p className="text-slate-500 text-center py-4">No data available</p>
              )}
            </div>
          </Card>
        </div>

        {/* AI Insights */}
        {analytics?.aiInsights && (
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-6">AI Insights</h2>
            <div className="space-y-4">
              {analytics.aiInsights.map((insight: any, idx: number) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      {insight.category}
                    </h4>
                    <Badge variant="success">{insight.confidence}% confidence</Badge>
                  </div>
                  <p className="text-sm text-slate-700">{insight.insight}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Skill Gaps (if any) */}
        {application.skillGaps && application.skillGaps.length > 0 && (
          <Card className="bg-amber-50 border-amber-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Skill Gaps Detected</h3>
                <div className="space-y-2">
                  {application.skillGaps.map((gap: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="font-medium text-slate-900">{gap.skill}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600">
                          Actual: {gap.actualScore}%
                        </span>
                        <Badge variant="warning">{gap.gap}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};
