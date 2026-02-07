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
  BarChart3,
  Calendar,
  ChevronDown,
  Filter,
  ArrowUpRight,
  Target
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
  ResponsiveContainer,
  AreaChart,
  Area
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
    }
  };

  const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-medium text-sm mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Performance Insights</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">Measure and optimize your hiring pipeline efficiency.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-w-[200px]"
            >
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {!analytics ? (
        <Card className="text-center py-20 border-dashed border-2">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Data Available</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-1">We couldn't find any analytics data for this job posting yet.</p>
        </Card>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Candidates"
              value={analytics.totalCandidates || 0}
              icon={Users}
              trend="+12% vs last month"
              color="blue"
            />
            <MetricCard
              label="Average Score"
              value={`${analytics.avgScore || 0}%`}
              icon={Target}
              trend="+5% vs benchmark"
              color="indigo"
            />
            <MetricCard
              label="Qualified"
              value={analytics.qualifiedCount || 0}
              icon={Award}
              trend={`${analytics.passRate || 0}% pass rate`}
              color="emerald"
            />
            <MetricCard
              label="Time to Evaluate"
              value="2.4d"
              icon={Calendar}
              trend="-0.5d this week"
              color="amber"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Score Distribution */}
            <Card className="lg:col-span-2 border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Score Distribution</h2>
                  <p className="text-xs text-slate-500">Candidate performance breakdown by percentage ranges.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Frequency</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.scoreDistribution || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="range"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Top Skills */}
            <Card className="border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Top Skills Performance</h2>
              <div className="space-y-6">
                {analytics.topSkills?.slice(0, 5).map((skill: any, idx: number) => (
                  <div key={idx} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-700">{skill.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-blue-600">{skill.avgPerformance}%</span>
                        <span className="text-[10px] text-slate-400 font-medium">avg.</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-1000 group-hover:bg-blue-600"
                        style={{ width: `${skill.avgPerformance}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium italic">
                      Based on {skill.demand} assessment attempts
                    </p>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-6 text-blue-600 text-xs font-bold uppercase tracking-wider">
                View Full Skill Audit
              </Button>
            </Card>

            {/* Section Analysis */}
            <Card className="border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Category Breakdown</h2>
              <div className="h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.sectionPerformance}
                      dataKey="avgScore"
                      nameKey="section"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                    >
                      {analytics.sectionPerformance.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase">Avg Score</p>
                    <p className="text-xl font-black text-slate-900">{analytics.avgScore}%</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {analytics.sectionPerformance.map((entry: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="font-medium text-slate-600">{entry.section}</span>
                    </div>
                    <span className="font-bold text-slate-900">{entry.avgScore}%</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Leaderboard */}
            <Card className="lg:col-span-2 border-slate-200 overflow-hidden" padding="none">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Top Performing Candidates</h2>
                  <p className="text-xs text-slate-500 mt-1">High-potential talent identified by AI evaluation.</p>
                </div>
                <Badge variant="info" className="bg-blue-50 text-blue-700 border-blue-100">AI Verified</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rank</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Candidate</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Score</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Stability</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leaderboard.slice(0, 5).map((candidate, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {idx < 3 ? (
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-amber-100 text-amber-700' :
                                idx === 1 ? 'bg-slate-100 text-slate-700' :
                                  'bg-orange-100 text-orange-700'
                                }`}>
                                {idx + 1}
                              </div>
                            ) : (
                              <span className="w-7 text-center font-bold text-slate-400 text-xs">#{idx + 1}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                              {candidate.candidateName?.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{candidate.candidateName}</p>
                              <p className="text-[11px] text-slate-500 font-medium">{candidate.candidateEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 font-black text-xs">
                            {candidate.totalScore}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${candidate.totalScore > 80 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${candidate.percentile}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <StatusBadge status={candidate.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-slate-50/30 border-t border-slate-100">
                <Button variant="ghost" size="sm" className="w-full text-slate-500 hover:text-blue-600 font-bold text-xs uppercase tracking-widest">
                  Show All Candidates
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, trend, color }: any) => {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600'
  };

  return (
    <Card className="border-slate-200">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-900">{value}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-1">
        <ArrowUpRight className="w-3 h-3 text-emerald-500" />
        <span className="text-[11px] font-bold text-emerald-600">{trend}</span>
      </div>
    </Card>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    shortlisted: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rejected: 'bg-red-50 text-red-700 border-red-100',
    completed: 'bg-blue-50 text-blue-700 border-blue-100',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status?.toLowerCase()] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
      {status}
    </span>
  );
};
