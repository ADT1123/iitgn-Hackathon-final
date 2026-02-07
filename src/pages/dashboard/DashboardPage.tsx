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
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    red: 'text-red-600 bg-red-50',
  }[color];

  return (
    <Card className="border-slate-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${colorClasses}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5">
        <span className={`text-[11px] font-bold ${trend.startsWith('+') ? 'text-emerald-600' : 'text-slate-500'}`}>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-medium text-sm mb-1">
            <span>Overview</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{getTimeBasedGreeting()}, {user.name}</h1>
          <p className="text-slate-500 mt-1 text-sm">Your recruitment pipeline is looking healthy today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/jobs')}>
            Manage Jobs
          </Button>
          <Button variant="primary" onClick={() => navigate('/jobs/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
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
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-700">Candidate</th>
                    <th className="px-6 py-4 font-semibold text-slate-700">Role</th>
                    <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentApplications.map((app: any) => (
                    <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">
                            {app.candidateName?.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{app.candidateName}</p>
                            <p className="text-[11px] text-slate-500">{app.candidateEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {app.job?.title || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/candidates/${app._id}`)}>
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
            <h2 className="text-lg font-bold text-slate-900">Active Postings</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')}>
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
                className="hover:border-blue-300 hover:bg-white transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <Badge variant={job.status === 'active' ? 'success' : 'default'} className="text-[10px]">
                    {job.status}
                  </Badge>
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {job.applicantsCount || 0} Applicants
                  </span>
                  <span className="flex items-center gap-1 text-blue-600 group-hover:translate-x-1 transition-transform">
                    View <ArrowRight className="w-3 h-3" />
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
