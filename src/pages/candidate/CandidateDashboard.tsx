// src/pages/candidate/CandidateDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { applicationAPI, jobsAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
  Target,
  Award
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

export const CandidateDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalApplications: 0,
    qualified: 0,
    pending: 0,
    rejected: 0,
    avgScore: 0
  });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [skillData, setSkillData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const appsRes = await applicationAPI.getApplications();
      const apps = appsRes.data.data || appsRes.data || [];

      setMyApplications(apps);

      const completedApps = apps.filter((a: any) => a.totalScore !== undefined);
      const avg = completedApps.length > 0
        ? Math.round(completedApps.reduce((sum: number, a: any) => sum + (a.totalScore || 0), 0) / completedApps.length)
        : 0;

      setStats({
        totalApplications: apps.length,
        qualified: apps.filter((a: any) => a.status === 'shortlisted' || a.status === 'qualified').length,
        pending: apps.filter((a: any) =>
          ['pending', 'in-progress', 'submitted'].includes(a.status)
        ).length,
        rejected: apps.filter((a: any) => a.status === 'rejected').length,
        avgScore: avg
      });

      // Prepare Performance Chart Data
      const perf = apps.slice(-5).map((a: any) => ({
        date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: a.totalScore || 0
      }));
      setPerformanceData(perf);

      // Mock Skill Data for Radar (In a real app, this would come from a specific endpoint)
      setSkillData([
        { subject: 'Technical', A: 85, fullMark: 100 },
        { subject: 'Logic', A: 92, fullMark: 100 },
        { subject: 'Coding', A: 78, fullMark: 100 },
        { subject: 'Comm.', A: 80, fullMark: 100 },
        { subject: 'System', A: 75, fullMark: 100 },
      ]);

      const jobsRes = await jobsAPI.getJobs();
      setRecentJobs((jobsRes.data.data || jobsRes.data || []).slice(0, 3));
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse text-xs uppercase tracking-widest">Constructing Career View...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* Premium Welcome Section */}
      <div className="bg-slate-900 rounded-[2rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <Badge variant="info" className="bg-blue-600 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 mb-2 border-0">
              Candidate Terminal
            </Badge>
            <h1 className="text-4xl font-black tracking-tight">Welcome back, {user.name?.split(' ')[0] || 'Talent'} ✨</h1>
            <p className="text-slate-400 font-medium max-w-md">Your career trajectory is accelerating. You've outpaced <span className="text-blue-400 font-black">78%</span> of recent applicants in Technical Aptitude.</p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/candidate/jobs')}
            className="rounded-2xl h-14 px-8 bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Discover Opportunities
          </Button>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-10 blur-3xl bg-blue-600 rounded-full w-96 h-96 -mr-48 -mt-48"></div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          label="Life Applications"
          value={stats.totalApplications}
          sub="Across all domains"
          icon={Activity}
          color="blue"
        />
        <StatsCard
          label="In Progress"
          value={stats.pending}
          sub="Evaluation pending"
          icon={Clock}
          color="amber"
        />
        <StatsCard
          label="Mean Aptitude"
          value={`${stats.avgScore}%`}
          sub="AI benchmark active"
          icon={Zap}
          color="indigo"
        />
        <StatsCard
          label="Opportunities"
          value={stats.qualified}
          sub="Shortlisted status"
          icon={Award}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Visualization */}
        <Card className="lg:col-span-2 p-8 rounded-[2rem] border-slate-100 shadow-xl shadow-slate-100/50">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em] mb-1">Performance Journey</h3>
              <p className="text-slate-400 text-xs font-bold font-mono">Statistical growth across assessments</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: '900' }}
                />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPerf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Skill Matrix */}
        <Card className="p-8 rounded-[2rem] border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col items-center">
          <div className="w-full text-left mb-6">
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em] mb-1">Competency Radar</h3>
            <p className="text-slate-400 text-xs font-bold font-mono">Relative skill proficiencies</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                <Radar
                  name="Aptitude"
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 w-full">
            {skillData.slice(0, 4).map((s, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{s.subject}</p>
                <p className="text-lg font-black text-slate-900">{s.A}%</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Applications Table */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Funnel</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/candidate/applications')} className="font-black text-[10px] uppercase tracking-widest text-blue-600">
              Complete History <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <Card className="overflow-hidden border-slate-100 shadow-lg shadow-slate-100/50" padding="none">
            {myApplications.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role Matrix</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stability</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {myApplications.slice(0, 5).map((app: any) => (
                    <tr key={app._id} className="hover:bg-slate-50/50 transition-all border-b border-slate-50 last:border-0 group">
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors uppercase tracking-tight">{app.job?.title || 'Unknown Role'}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{app.job?.company || 'Ecosystem Partner'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-[11px] font-black font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                          {app.totalScore !== undefined ? `${app.totalScore}%` : '--'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <StatusBadge status={app.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-400 font-black uppercase text-xs tracking-widest">
                Funnel is empty. Deploy your first application.
              </div>
            )}
          </Card>
        </div>

        {/* Discovery Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">New Nodes</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/candidate/jobs')} className="font-black text-[10px] uppercase tracking-widest text-blue-600">
              Market Discovery
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {recentJobs.map((job: any) => (
              <Card
                key={job._id}
                onClick={() => navigate('/candidate/jobs')}
                className="p-6 border-slate-100 shadow-md hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{job.title}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{job.department} • {job.location}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-slate-50 text-slate-600 border-slate-100 font-black text-[9px] uppercase">{job.type}</Badge>
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {recentJobs.length === 0 && (
              <div className="p-12 bg-slate-50 rounded-[2rem] text-center text-slate-400 font-black uppercase text-xs tracking-widest border border-dashed border-slate-200">
                Network latency... check back soon.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ label, value, sub, icon: Icon, color }: any) => {
  return (
    <Card className="p-8 rounded-[2rem] border-slate-100 shadow-lg shadow-slate-100/50 group hover:-translate-y-1 transition-all">
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
            <p className="text-3xl font-black text-slate-900">{value}</p>
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">{sub}</p>
        </div>
        <div className={`p-4 rounded-2xl bg-slate-50 text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
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
    processing: 'bg-blue-50 text-blue-700 border-blue-100',
    completed: 'bg-slate-900 text-white border-0',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${styles[status?.toLowerCase()] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
      {status}
    </span>
  );
};
