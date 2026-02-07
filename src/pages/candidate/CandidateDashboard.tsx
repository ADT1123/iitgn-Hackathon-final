// src/pages/candidate/CandidateDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { applicationAPI, jobsAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Loader2,
  ArrowRight,
  MapPin,
  Building2
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch candidate's applications
      const appsRes = await applicationAPI.getApplications();
      const apps = appsRes.data.data || appsRes.data || [];
      
      setMyApplications(apps);
      
      // Calculate stats
      setStats({
        totalApplications: apps.length,
        qualified: apps.filter((a: any) => a.status === 'shortlisted').length,
        pending: apps.filter((a: any) => 
          a.status === 'pending' || 
          a.status === 'in-progress' || 
          a.status === 'completed'
        ).length,
        rejected: apps.filter((a: any) => a.status === 'rejected').length
      });
      
      // Fetch recent jobs
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back!</h1>
          <p className="text-slate-600">Discover new opportunities and track your applications.</p>
        </div>
        <Button 
          variant="primary" 
          size="lg"
          onClick={() => navigate('/candidate/jobs')}
        >
          <Briefcase className="w-4 h-4 mr-2" />
          Browse Jobs
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Applications</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalApplications}</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Qualified</p>
              <p className="text-3xl font-bold text-emerald-600">{stats.qualified}</p>
            </div>
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
            </div>
            <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-7 h-7 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-7 h-7 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Applications */}
      {myApplications.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Recent Applications</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/candidate/applications')}
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {myApplications.slice(0, 3).map((app: any) => (
              <div 
                key={app._id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => navigate('/candidate/applications')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{app.job?.title || 'Job Position'}</h3>
                    <p className="text-sm text-slate-600">{app.job?.company || 'Company'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {app.totalScore && (
                    <div className="text-right mr-4">
                      <p className="text-sm text-slate-600">Score</p>
                      <p className="text-lg font-bold text-blue-600">{app.totalScore}%</p>
                    </div>
                  )}
                  <Badge
                    variant={
                      app.status === 'shortlisted' ? 'success' :
                      app.status === 'rejected' ? 'danger' :
                      app.status === 'completed' ? 'info' : 'warning'
                    }
                  >
                    {app.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Available Jobs */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Available Jobs</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/candidate/jobs')}
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        {recentJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No jobs available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentJobs.map((job: any) => (
              <Card 
                key={job._id}
                onClick={() => navigate('/candidate/jobs')}
                className="hover:shadow-lg transition-all cursor-pointer group border-2 border-transparent hover:border-blue-200"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="info">{job.type || 'Full-time'}</Badge>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {job.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-1">
                      {job.department || 'Engineering'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location || 'Remote'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
