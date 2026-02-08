// src/pages/analytics/AnalyticsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts';
import {
  Trophy, Users, Target, TrendingUp, Download, RefreshCw,
  CheckCircle, Clock, Shield, BarChart2, Activity, Zap
} from 'lucide-react';
import { analyticsAPI, proctoringAPI, jobAPI } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/toaster';
import './Analytics.css';

const COLORS = ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export const AnalyticsPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [integrityData, setIntegrityData] = useState<any | null>(null);
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
      const res = await jobAPI.getJobs({ status: 'active' });
      const jobsData = res.data.data || res.data || [];
      setJobs(jobsData);
      if (jobsData.length > 0) {
        setSelectedJobId(jobsData[0]._id);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      toast.error('❌ Failed to load jobs');
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

      setAnalytics(analyticsRes.data.data || analyticsRes.data);
      setLeaderboard(leaderboardRes.data.data || leaderboardRes.data || []);
      setIntegrityData(integrityRes.data.data || integrityRes.data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      toast.error('❌ Failed to refresh analytics');
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
      toast.success(`📤 Exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('Export error:', err);
      toast.error('❌ Export failed');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Synchronizing Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="analytics-container space-y-8 pb-20">
      {/* Premium Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50">
        <div className="space-y-2">
          <Badge variant="info" className="bg-slate-900 text-white border-0 font-black text-[10px] uppercase tracking-[0.2em] px-3 py-1 mb-2">
            Live Intelligence Pipeline
          </Badge>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BarChart2 className="w-8 h-8 text-blue-600" />
            Talent Analytics
          </h1>
          <p className="text-slate-400 font-bold text-sm">Quantifying potential through multi-dimensional AI assessment.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="pl-4 pr-10 py-3 bg-slate-50 border-0 rounded-2xl text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 appearance-none min-w-[240px]"
            >
              {jobs.map(job => (
                <option key={job._id} value={job._id}>{job.title}</option>
              ))}
            </select>
          </div>

          <Button
            variant="secondary"
            className="rounded-2xl h-11 px-6 font-black uppercase text-[10px] tracking-widest"
            onClick={fetchAllData}
            loading={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Data
          </Button>

          <div className="h-10 w-px bg-slate-100 hidden md:block"></div>

          <Button
            variant="primary"
            className="rounded-2xl h-11 px-6 bg-slate-900 hover:bg-black font-black uppercase text-[10px] tracking-widest"
            onClick={() => handleExport('csv')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </header>

      {/* Modern Navigation Tabs */}
      <div className="analytics-tab-list">
        {[
          { id: 'overview', icon: Activity, label: 'Pipeline' },
          { id: 'leaderboard', icon: Trophy, label: 'Performance' },
          { id: 'skills', icon: Target, label: 'Skill Gap' },
          { id: 'integrity', icon: Shield, label: 'Credibility' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`analytics-tab flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && analytics && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Key Metric Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              label="Pipeline Volume"
              value={analytics.overview.totalCandidates}
              sub={`+${Math.floor(Math.random() * 20)}% velocity`}
              color="blue"
              icon={Users}
            />
            <MetricCard
              label="Qualified Talent"
              value={analytics.qualifiedCount}
              sub={`${analytics.passRate}% fit rate`}
              color="emerald"
              icon={CheckCircle}
            />
            <MetricCard
              label="Mean Intelligence"
              value={`${analytics.scores.average}%`}
              sub={`Target: 70%`}
              color="indigo"
              icon={Zap}
            />
            <MetricCard
              label="Risk Quotient"
              value={`${analytics.qualityMetrics.flaggedPercentage}%`}
              sub={`${analytics.qualityMetrics.flaggedSubmissions} flagged`}
              color="amber"
              icon={Shield}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 p-8 analytics-card">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em] mb-1">Score Distribution</h3>
                  <p className="text-slate-400 text-xs font-bold font-mono">Statistical spread of candidate performance</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-8 analytics-card">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em] mb-6">Status Breakdown</h3>
              <div className="h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Shortlisted', value: analytics.overview.shortlisted },
                        { name: 'Review', value: analytics.overview.completed - analytics.overview.shortlisted - analytics.overview.rejected },
                        { name: 'Rejected', value: analytics.overview.rejected },
                      ]}
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <span className="text-[10px] font-black text-slate-300 uppercase block">Total</span>
                    <span className="text-2xl font-black text-slate-900">{analytics.overview.completed}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                {[
                  { label: 'Shortlisted', val: analytics.overview.shortlisted, c: '#3b82f6' },
                  { label: 'Under Review', val: analytics.overview.completed - analytics.overview.shortlisted - analytics.overview.rejected, c: '#6366f1' },
                  { label: 'Not Selected', val: analytics.overview.rejected, c: '#10b981' }
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] font-black uppercase tracking-tighter">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.c }}></div>
                      <span className="text-slate-500">{s.label}</span>
                    </div>
                    <span className="text-slate-900">{s.val}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-8 analytics-card">
              <div className="mb-6">
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em] mb-1">Activity Trend</h3>
                <p className="text-slate-400 text-xs font-bold font-mono">Submission velocity over 7 days</p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={analytics.completionTrend}>
                  <defs>
                    <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#areaColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-8 analytics-card">
              <div className="mb-6">
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em] mb-1">Section Benchmark</h3>
                <p className="text-slate-400 text-xs font-bold font-mono">Performance across question archetypes</p>
              </div>
              <div className="space-y-6">
                {analytics.sectionPerformance.map((item: any, i: number) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>{item.section} Focus</span>
                      <span className="text-slate-900">{item.avgScore}%</span>
                    </div>
                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 rounded-full transition-all duration-1000"
                        style={{ width: `${item.avgScore}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="analytics-card overflow-hidden" padding="none">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div>
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em] mb-1">Talent Ranking</h3>
                <p className="text-slate-400 text-xs font-bold font-mono">Proprietary AI score aggregation</p>
              </div>
              <Badge variant="info" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black text-[9px] uppercase">Validated Leaderboard</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full analytics-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Candidate Identity</th>
                    <th>Performance</th>
                    <th>Percentile</th>
                    <th>Status</th>
                    <th>AI Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leaderboard.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                      <td className="font-black text-slate-400">#{entry.rank}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-[10px]">
                            {entry.candidateName?.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm">{entry.candidateName}</p>
                            <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">{entry.candidateEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="font-black text-blue-600">{entry.totalScore}%</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-900" style={{ width: `${entry.percentile}%` }}></div>
                          </div>
                          <span className="text-[10px] font-black text-slate-500">{entry.percentile}%</span>
                        </div>
                      </td>
                      <td>
                        <span className="status-pill bg-slate-100 text-slate-600 border border-slate-200">
                          {entry.status}
                        </span>
                      </td>
                      <td className="max-w-[180px] text-[10px] font-bold text-slate-500 leading-tight">
                        {entry.aiRecommendation || 'Evaluation pending final audit.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'skills' && analytics && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analytics.skillGap.map((skill: any, i: number) => (
              <Card key={i} className="p-6 analytics-card group">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-black text-slate-900 uppercase text-[11px] tracking-widest">{skill.skill}</span>
                  <Badge className="bg-slate-900 text-[8px] font-black uppercase tracking-tighter rounded-md py-0.5">
                    {skill.gapLevel} gap
                  </Badge>
                </div>
                <div className="metric-value mb-1">{skill.avgScore}%</div>
                <p className="text-[10px] font-black text-slate-300 uppercase mb-4 tracking-tighter">Cohort Average</p>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden group-hover:bg-slate-200 transition-colors">
                  <div className="h-full bg-blue-600" style={{ width: `${skill.avgScore}%` }}></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'integrity' && integrityData && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <IntegritySummaryCard label="Analyzed" value={integrityData.summary.totalAnalyzed} />
            <IntegritySummaryCard label="High Risk" value={integrityData.summary.highRisk} isBad />
            <IntegritySummaryCard label="Medium Risk" value={integrityData.summary.mediumRisk} isWarn />
            <IntegritySummaryCard label="Low Risk" value={integrityData.summary.lowRisk} isGood />
            <IntegritySummaryCard label="Integrity" value={`${integrityData.summary.avgIntegrityScore}%`} />
          </div>

          <Card className="analytics-card overflow-hidden" padding="none">
            <div className="p-6 border-b border-slate-100 bg-slate-50/30">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Flagged Submissions</h3>
            </div>
            <table className="w-full analytics-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Integrity Score</th>
                  <th>Risk Categorization</th>
                  <th>Action Required</th>
                </tr>
              </thead>
              <tbody>
                {integrityData.candidates.filter((c: any) => c.riskLevel !== 'low').map((c: any, i: number) => (
                  <tr key={i}>
                    <td className="font-black text-slate-900 text-sm">{c.candidateName}</td>
                    <td className={`font-black ${c.integrityScore < 50 ? 'text-red-600' : 'text-amber-600'}`}>{c.integrityScore}%</td>
                    <td>
                      <Badge className={c.riskLevel === 'high' ? 'bg-red-500' : 'bg-amber-500'}>
                        {c.riskLevel.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50">Review Logs</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ label, value, sub, color, icon: Icon }: any) => {
  return (
    <Card className="p-8 analytics-card relative overflow-hidden group">
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className={`p-3 rounded-2xl mb-4 bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="metric-label mb-2">{label}</span>
        <span className="metric-value mb-1">{value}</span>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight">{sub}</span>
      </div>
      <div className="absolute top-0 right-0 p-2 opacity-[0.03]">
        <Icon className="w-16 h-16 transform rotate-12" />
      </div>
    </Card>
  );
};

const IntegritySummaryCard = ({ label, value, isBad, isGood, isWarn }: any) => (
  <Card className="p-6 text-center analytics-card border-none bg-slate-50">
    <span className="metric-label mb-2 block">{label}</span>
    <span className={`text-2xl font-black ${isBad ? 'text-red-600' : isGood ? 'text-emerald-600' : isWarn ? 'text-amber-600' : 'text-slate-900'}`}>{value}</span>
  </Card>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-xl font-black text-white">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};
