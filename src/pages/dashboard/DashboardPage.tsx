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
  Loader2,
  Plus,
  ArrowRight,
  TrendingUp as TrendingUpIcon,
  Sparkles
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
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);
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

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-pulse"></div>
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-500 font-medium animate-pulse">Initializing Dashboard...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-10 pb-10 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                Overview
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400 text-xs font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              {getTimeGreeting()}, {user?.firstName || 'Recruiter'}! <Sparkles className="w-6 h-6 text-amber-400" />
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Your hiring pipeline is looking healthy today.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl" onClick={() => window.location.href = '/jobs'}>
              Manage All Jobs
            </Button>
            <Button variant="primary" className="rounded-xl" onClick={() => window.location.href = '/jobs/create'}>
              <Plus className="w-4 h-4 mr-2" /> Post New Job
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Jobs', val: stats.totalJobs, icon: Briefcase, color: 'blue', trend: '+2' },
            { label: 'Active Jobs', val: stats.activeJobs, icon: TrendingUpIcon, color: 'green', trend: '+1' },
            { label: 'Total Candidates', val: stats.totalCandidates, icon: Users, color: 'purple', trend: '+12' },
            { label: 'Pending Reviews', val: stats.pendingReviews, icon: Clock, color: 'amber', trend: '-5' }
          ].map((stat, i) => (
            <Card key={i} variant="elevated" hoverable className="relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-50 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-110`} />
              <div className="relative flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center shadow-sm`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <div className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-slate-500 bg-slate-50'} px-2 py-1 rounded-lg`}>
                    {stat.trend} this week
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">{stat.val}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Jobs */}
          <Card variant="default" className="flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recent Job Openings</h2>
                <p className="text-sm text-slate-500 font-medium">Manage your latest postings</p>
              </div>
              <Button variant="ghost" size="sm" className="rounded-lg text-blue-600 font-bold" onClick={() => window.location.href = '/jobs'}>
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {recentJobs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-400 font-bold">No jobs posted yet</p>
                <Button variant="outline" size="sm" className="mt-4 border-slate-200" onClick={() => window.location.href = '/jobs/create'}>
                  Create your first job
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentJobs.slice(0, 4).map((job) => (
                  <div key={job._id} className="group flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-blue-100 transition-all cursor-pointer" onClick={() => window.location.href = `/jobs/${job._id}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center font-black text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors shadow-sm">
                        {job.title.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{job.title}</p>
                        <p className="text-xs text-slate-500 font-medium">{job.department} • {job.location}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-black ${job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {job.status}
                      </span>
                      <p className="text-[10px] text-slate-400 font-bold">{new Date(job.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Applications */}
          <Card variant="default" className="flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recent Applications</h2>
                <p className="text-sm text-slate-500 font-medium">Latest candidates to review</p>
              </div>
              <Button variant="ghost" size="sm" className="rounded-lg text-blue-600 font-bold" onClick={() => window.location.href = '/candidates'}>
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {recentApplications.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-400 font-bold">Waiting for candidates...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentApplications.slice(0, 4).map((app) => (
                  <div key={app._id} className="group flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-violet-100 transition-all cursor-pointer" onClick={() => window.location.href = `/candidates/${app._id}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-blue-100 group-hover:scale-105 transition-transform">
                        {(app.candidateName || 'U').charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{app.candidateName || 'Unknown Candidate'}</p>
                        <p className="text-xs text-slate-500 font-medium line-clamp-1 max-w-[150px]">{app.jobId?.title || 'Applied Position'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-black text-blue-600">
                            {app.scores?.overall?.percentage || 0}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Score</span>
                        </div>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${app.scores?.overall?.percentage || 0}%` }} />
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:border-violet-200 transition-colors">
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-600" />
                      </div>
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
