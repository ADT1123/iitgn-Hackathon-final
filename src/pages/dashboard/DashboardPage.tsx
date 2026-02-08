// src/pages/dashboard/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
  Plus,
  Activity,
  BarChart2
} from 'lucide-react';
import { jobAPI, applicationAPI } from '@/services/api';
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer
} from 'recharts';

interface StatsCardProps {
  label: string;
  value: number | string;
  trend: string;
  icon: any;
  color: 'blue' | 'emerald' | 'amber' | 'red';
}

const DashboardStatsCard: React.FC<StatsCardProps> = ({ label, value, trend, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50/50',
    emerald: 'text-emerald-600 bg-emerald-50/50',
    amber: 'text-amber-600 bg-amber-50/50',
    red: 'text-red-600 bg-red-50/50',
  }[color];

  return (
    <Card className="border-slate-100 shadow-sm hover:border-blue-100 transition-all p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-black text-slate-900 mt-1.5">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5">
        <span className={`text-[10px] font-black uppercase tracking-tighter ${trend.startsWith('+') ? 'text-emerald-600' : 'text-slate-400'}`}>
          {trend}
        </span>
      </div>
    </Card>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    shortlisted: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    qualified: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rejected: 'bg-red-50 text-red-700 border-red-100',
    pending: 'bg-amber-50 text-amber-700 border-amber-100',
    submitted: 'bg-blue-50 text-blue-700 border-blue-100',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status.toLowerCase()] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
      {status}
    </span>
  );
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalCandidates: 0,
    pendingReviews: 0,
    shortlisted: 0
  });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{"name": "Recruiter"}');

  useEffect(() => {
    fetchDashboardData();

    // Real-time updates: Poll for new applications every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes] = await Promise.all([
        jobAPI.getJobs(),
        applicationAPI.getApplications()
      ]);

      const jobs = jobsRes.data.data || jobsRes.data || [];
      const apps = appsRes.data.data || appsRes.data || [];

      setRecentJobs(jobs.slice(0, 3));
      setRecentApplications(apps.slice(0, 5));

      setStats({
        activeJobs: jobs.filter((j: any) => j.status === 'active').length,
        totalCandidates: apps.length,
        pendingReviews: apps.filter((a: any) => a.status === 'pending' || a.status === 'submitted').length,
        shortlisted: apps.filter((a: any) => a.status === 'shortlisted').length
      });

      // Simple trend mock-up based on apps
      const last5Days = [4, 3, 2, 1, 0].map(d => {
        const date = new Date();
        date.setDate(date.getDate() - d);
        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          apps: apps.filter((a: any) => new Date(a.createdAt).toDateString() === date.toDateString()).length
        };
      });
      setTrendData(last5Days);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest mb-2">
            <TrendingUp className="w-3 h-3" />
            <span>Recruiter Engine v3.0</span>
            <span className="text-slate-200">|</span>
            <span className="text-slate-400">{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{getTimeBasedGreeting()}, <span className="text-blue-600">{(user?.name || 'Recruiter').split(' ')[0]}</span></h1>
          <p className="text-slate-500 mt-1.5 text-xs font-bold uppercase tracking-tight opacity-70">Pipeline pulse is healthy • {stats.pendingReviews} urgent actions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => navigate('/jobs')} className="rounded-xl h-11 px-6 font-bold text-xs uppercase tracking-tight text-slate-600">
            Manage Pool
          </Button>
          <Button variant="primary" onClick={() => navigate('/jobs/create')} className="bg-slate-900 hover:bg-black text-white rounded-xl h-11 px-6 font-bold text-xs uppercase tracking-tight shadow-xl shadow-slate-200">
            <Plus className="w-3.5 h-3.5 mr-2" />
            Create Position
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatsCard
          label="Active Jobs"
          value={stats.activeJobs}
          trend="+2 this week"
          icon={Briefcase}
          color="blue"
        />
        <DashboardStatsCard
          label="Total Candidates"
          value={stats.totalCandidates}
          trend="+12 this week"
          icon={Users}
          color="blue"
        />
        <DashboardStatsCard
          label="Pending Reviews"
          value={stats.pendingReviews}
          trend="-5 since yesterday"
          icon={Clock}
          color="amber"
        />
        <DashboardStatsCard
          label="Shortlisted"
          value={stats.shortlisted}
          trend="+4 this week"
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications & Pulse */}
        <div className="lg:col-span-2 space-y-8">
          {/* Trend Micro-graph */}
          <Card className="p-6 border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50/50 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div>
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Pipeline Pulse</h2>
                <p className="text-lg font-black text-slate-900 uppercase tracking-tight">Application Velocity</p>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                <TrendingUp className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase font-mono">Real-time</span>
              </div>
            </div>
            <div className="h-32 -ml-6 -mr-6 -mb-6 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: '900' }}
                  />
                  <Area type="monotone" dataKey="apps" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorApps)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">High Priority Queue</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/candidates')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                Entire History <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <Card padding="none" className="overflow-hidden border-slate-100 shadow-xl shadow-slate-100/30 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Identity</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Job Node</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentApplications.map((app: any) => (
                      <tr key={app._id} className="hover:bg-slate-50/80 transition-all border-b border-slate-50 last:border-0 group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[9px] font-black uppercase">
                              {app.candidateName?.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{app.candidateName}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{app.candidateEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[11px] font-black text-slate-600 uppercase tracking-tighter">{app.job?.title || 'System Admin'}</span>
                        </td>
                        <td className="px-6 py-4 uppercase">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/candidates/profile/${app.candidate?._id || app.candidateId || app._id}`)} className="text-[10px] font-black uppercase tracking-tighter text-blue-600 hover:bg-blue-50 h-8 px-4 rounded-lg">
                            Evaluate
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>

        {/* Newest Jobs Sidebar */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Hot Postings</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
              Manage
            </Button>
          </div>

          <div className="space-y-4">
            {recentJobs.map((job: any) => (
              <Card
                key={job._id}
                onClick={() => navigate(`/jobs/${job._id}`)}
                className="p-6 border-slate-100 shadow-md hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden bg-white"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all text-slate-300">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <Badge variant={job.status === 'active' ? 'success' : 'default'} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                    {job.status}
                  </Badge>
                </div>
                <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{job.title}</h3>
                <div className="mt-4 flex items-center justify-between text-[9px] text-slate-400 font-black uppercase tracking-[0.1em]">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-slate-300" />
                    {job.applicantsCount || 0} Applicants
                  </span>
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
