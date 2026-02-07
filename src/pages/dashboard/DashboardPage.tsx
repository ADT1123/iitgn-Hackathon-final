import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { jobAPI, applicationAPI } from '@/services/api';
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Clock,
  Loader2
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>({
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    pendingReviews: 0
  });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      // Load jobs and applications in parallel
      const [jobsResponse, applicationsResponse] = await Promise.all([
        jobAPI.getJobs({ limit: 5, sort: '-createdAt' }).catch(() => ({ data: { data: [] } })),
        applicationAPI.getApplications({ limit: 5, sort: '-createdAt' }).catch(() => ({ data: { data: [] } }))
      ]);

      const jobs = jobsResponse.data.data || jobsResponse.data || [];
      const applications = applicationsResponse.data.data || applicationsResponse.data || [];

      setRecentJobs(jobs);
      setRecentApplications(applications);

      // Calculate stats from data
      setStats({
        totalJobs: jobs.length,
        activeJobs: jobs.filter((j: any) => j.status === 'active').length,
        totalCandidates: applications.length,
        pendingReviews: applications.filter((a: any) => a.status === 'pending').length
      });

    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back! Here's what's happening.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Jobs</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalJobs}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Jobs</p>
                <p className="text-2xl font-bold text-slate-900">{stats.activeJobs}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Candidates</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalCandidates}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-slate-900">{stats.pendingReviews}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Jobs */}
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Jobs</h2>
            {recentJobs.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No jobs yet</p>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <div key={job._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{job.title}</p>
                      <p className="text-sm text-slate-600">{job.department}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Applications */}
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Applications</h2>
            {recentApplications.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No applications yet</p>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div key={app._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{app.candidateName || 'Unknown'}</p>
                      <p className="text-sm text-slate-600">{app.candidateEmail}</p>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">
                      {app.totalScore || 0}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
