import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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

        {/* Quick Actions */}
        <div className="flex gap-4 mb-6">
          <Button onClick={() => window.location.href = '/recruiter/jobs/create'}>
            <Briefcase className="w-4 h-4 mr-2" /> Post New Job
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/recruiter/candidates'}>
            <Users className="w-4 h-4 mr-2" /> View Candidates
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Total Jobs</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalJobs}</p>
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Active Jobs</p>
                <p className="text-2xl font-bold text-slate-900">{stats.activeJobs}</p>
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Total Candidates</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalCandidates}</p>
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Pending Reviews</p>
                <p className="text-2xl font-bold text-slate-900">{stats.pendingReviews}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Jobs */}
          <Card className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Recent Jobs</h2>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/recruiter/jobs'}>View All</Button>
            </div>
            {recentJobs.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-500">No jobs posted yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <div key={job._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-md border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                        {job.title.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{job.title}</p>
                        <p className="text-sm text-slate-600">{job.department} • {job.location}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'
                      }`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Applications */}
          <Card className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Recent Applications</h2>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/recruiter/candidates'}>View All</Button>
            </div>
            {recentApplications.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-500">No applications received yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div key={app._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium shadow-sm">
                        {(app.candidateName || 'U').charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{app.candidateName || 'Unknown Candidate'}</p>
                        <p className="text-sm text-slate-600">{app.jobId?.title || 'Unknown Job'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-sm font-bold text-blue-600">
                        {app.scores?.overall?.percentage || 0}%
                      </span>
                      <span className="text-xs text-slate-500">Score</span>
                    </div>
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
