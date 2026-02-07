import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { analyticsAPI, jobAPI } from '@/services/api';
import { 
  TrendingUp, 
  Users, 
  Award,
  Download,
  Loader2,
  BarChart3
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      loadAnalytics();
    }
  }, [selectedJobId]);

  const loadJobs = async () => {
    try {
      const response = await jobAPI.getJobs({ status: 'active' });
      const jobsData = response.data.data || response.data;
      setJobs(jobsData);
      if (jobsData.length > 0) {
        setSelectedJobId(jobsData[0]._id);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsRes, leaderboardRes] = await Promise.all([
        analyticsAPI.getJobAnalytics(selectedJobId),
        analyticsAPI.getLeaderboard(selectedJobId)
      ]);

      setAnalytics(analyticsRes.data.data || analyticsRes.data);
      setLeaderboard(leaderboardRes.data.data || leaderboardRes.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: string) => {
    try {
      const response = await analyticsAPI.exportData(selectedJobId, format);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics_${selectedJobId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
            <p className="text-slate-600 mt-1">Deep insights into candidate performance</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </select>

            <Button variant="secondary" onClick={() => handleExport('csv')}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : !analytics ? (
          <Card className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No analytics data available</p>
          </Card>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-6">
              <Card>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Candidates</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {analytics.totalCandidates || 0}
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Avg Score</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {analytics.avgScore || 0}%
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Qualified</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {analytics.qualifiedCount || 0}
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Pass Rate</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {analytics.passRate || 0}%
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Score Distribution */}
            <Card>
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Score Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.scoreDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="range" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Skill Gap Analysis */}
            {analytics.skillGap && (
              <Card>
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Skill Gap Analysis</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.skillGap} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#64748b" />
                    <YAxis dataKey="skill" type="category" stroke="#64748b" width={120} />
                    <Tooltip />
                    <Bar dataKey="avgScore" fill="#10b981" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Section Performance */}
            {analytics.sectionPerformance && (
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <h2 className="text-lg font-semibold text-slate-900 mb-6">Section Performance</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.sectionPerformance}
                        dataKey="avgScore"
                        nameKey="section"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {analytics.sectionPerformance.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                <Card>
                  <h2 className="text-lg font-semibold text-slate-900 mb-6">Top Skills Required</h2>
                  <div className="space-y-4">
                    {analytics.topSkills?.map((skill: any, idx: number) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-900">{skill.name}</span>
                          <span className="text-sm text-slate-600">{skill.demand}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${skill.demand}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Leaderboard */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Top Performers</h2>
                <Badge variant="info">{leaderboard.length} candidates</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                        Percentile
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {leaderboard.slice(0, 10).map((candidate, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">#{idx + 1}</span>
                            {idx < 3 && <Award className="w-5 h-5 text-amber-500" />}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">{candidate.candidateName}</p>
                          <p className="text-sm text-slate-500">{candidate.candidateEmail}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-blue-600">{candidate.totalScore}%</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-900">{candidate.percentile}th</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              candidate.status === 'shortlisted' ? 'success' :
                              candidate.status === 'rejected' ? 'danger' : 'info'
                            }
                          >
                            {candidate.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
};
