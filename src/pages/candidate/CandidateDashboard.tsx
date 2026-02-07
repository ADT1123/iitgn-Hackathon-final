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
  Activity
} from 'lucide-react';

export const CandidateDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalApplications: 0,
    qualified: 0,
    pending: 0,
    rejected: 0
  });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
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

      setStats({
        totalApplications: apps.length,
        qualified: apps.filter((a: any) => a.status === 'shortlisted' || a.status === 'qualified').length,
        pending: apps.filter((a: any) =>
          ['pending', 'in-progress', 'submitted'].includes(a.status)
        ).length,
        rejected: apps.filter((a: any) => a.status === 'rejected').length
      });

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
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hello, {user.name || 'Candidate'}</h1>
          <p className="text-slate-600 mt-1">Ready to take the next step in your career?</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/candidate/jobs')}
          className="w-full md:w-auto"
        >
          <Briefcase className="w-4 h-4 mr-2" />
          Browse Open Positions
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          label="Total Applications"
          value={stats.totalApplications}
          icon={Activity}
          color="blue"
        />
        <StatsCard
          label="In Progress"
          value={stats.pending}
          icon={Clock}
          color="amber"
        />
        <StatsCard
          label="Qualified"
          value={stats.qualified}
          icon={CheckCircle}
          color="emerald"
        />
        <StatsCard
          label="Not Selected"
          value={stats.rejected}
          icon={XCircle}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Applications</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/candidate/applications')}>
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            {myApplications.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 font-medium text-slate-700">Role</th>
                    <th className="px-6 py-3 font-medium text-slate-700">Company</th>
                    <th className="px-6 py-3 font-medium text-slate-700">Date</th>
                    <th className="px-6 py-3 font-medium text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myApplications.slice(0, 5).map((app: any) => (
                    <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{app.job?.title || 'Unknown Role'}</td>
                      <td className="px-6 py-4 text-slate-600">{app.job?.company || 'Unknown Company'}</td>
                      <td className="px-6 py-4 text-slate-600">{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={app.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-500">
                No applications yet. Start by browsing jobs!
              </div>
            )}
          </div>
        </div>

        {/* Recommended Jobs (Compact) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">New Opportunities</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/candidate/jobs')}>
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {recentJobs.map((job: any) => (
              <div
                key={job._id}
                onClick={() => navigate('/candidate/jobs')}
                className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              >
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{job.department} • {job.location}</p>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="secondary">{job.type}</Badge>
                  <span className="text-xs font-medium text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center">
                    View Details <ArrowRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </div>
            ))}
            {recentJobs.length === 0 && (
              <div className="p-6 bg-slate-50 rounded-lg text-center text-slate-500 text-sm">
                No new jobs available right now.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ label, value, icon: Icon, color }: any) => {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
  }[color as string] || 'bg-slate-50 text-slate-600';

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorStyles}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    shortlisted: 'bg-emerald-100 text-emerald-800',
    qualified: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
    pending: 'bg-amber-100 text-amber-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-purple-100 text-purple-800',
  }[status.toLowerCase()] || 'bg-slate-100 text-slate-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles}`}>
      {status}
    </span>
  );
};
