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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest mb-2">
            <TrendingUp className="w-3 h-3" />
            <span>Recruiter Engine v3.0</span>
            <span className="text-slate-200">|</span>
            <span className="text-slate-400">{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{getTimeBasedGreeting()}, <span className="text-blue-600">{user.name.split(' ')[0]}</span></h1>
          <p className="text-slate-500 mt-1.5 text-xs font-bold uppercase tracking-tight opacity-70">Pipeline pulse is healthy • {stats.pendingReviews} urgent actions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => navigate('/jobs')} className="rounded-xl h-11 px-6 font-bold text-xs uppercase tracking-tight">
            Manage Pool
          </Button>
          <Button variant="primary" onClick={() => navigate('/jobs/create')} className="bg-slate-900 hover:bg-black text-white rounded-xl h-11 px-6 font-bold text-xs uppercase tracking-tight shadow-lg shadow-slate-200">
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
        {/* Recent Applications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Applications</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/candidates')}>
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <Card padding="none" className="overflow-hidden border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                    <th className="px-6 py-3 font-black text-slate-400 uppercase tracking-widest">Target Role</th>
                    <th className="px-6 py-3 font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-3 font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentApplications.map((app: any) => (
                    <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-[9px] font-black border border-slate-200 uppercase">
                            {app.candidateName?.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 leading-tight">{app.candidateName}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{app.candidateEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 font-bold">
                        {app.job?.title || 'System Admin'}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/candidates/profile/${app.candidate?._id || app.candidateId || app._id}`)} className="text-[10px] font-black uppercase tracking-tighter text-blue-600 hover:bg-blue-50">
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {recentApplications.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        No recent applications to display.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Newest Jobs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Postings</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')} className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">
              Manage All
            </Button>
          </div>

          <div className="space-y-3">
            {recentJobs.map((job: any) => (
              <Card
                key={job._id}
                padding="sm"
                variant="outline"
                onClick={() => navigate(`/jobs/${job._id}`)}
                className="hover:border-blue-200 hover:bg-white transition-all group border-slate-100 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center border border-slate-100 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <Badge variant={job.status === 'active' ? 'success' : 'default'} className="text-[9px] font-black uppercase tracking-widest">
                    {job.status}
                  </Badge>
                </div>
                <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{job.title}</h3>
                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-300" />
                    {job.applicantsCount || 0} Pool
                  </span>
                  <span className="flex items-center gap-1 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1">
                    Enter <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Card>
            ))}
            {recentJobs.length === 0 && (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm">No active job postings.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
