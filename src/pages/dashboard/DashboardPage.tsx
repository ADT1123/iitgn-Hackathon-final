import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { analyticsAPI, applicationAPI } from '@/services/api';
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getDashboard();
      const data = response.data.data || response.data;
      
      setStats(data.stats);
      setRecentApps(data.recentApplications || []);
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

  const statCards = [
    {
      label: 'Active Jobs',
      value: stats?.activeJobs || 0,
      total: stats?.totalJobs || 0,
      icon: Briefcase,
      color: 'blue',
    },
    {
      label: 'Total Applicants',
      value: stats?.totalApplications || 0,
      icon: Users,
      color: 'green',
    },
    {
      label: 'Completed Tests',
      value: stats?.completedApplications || 0,
      icon: CheckCircle,
      color: 'purple',
    },
    {
      label: 'Avg Score',
      value: `${stats?.avgScore || 0}%`,
      icon: TrendingUp,
      color: 'amber',
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back! Here's your overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => (
            <Card key={idx} className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  {stat.total && (
                    <p className="text-xs text-slate-500 mt-1">of {stat.total} total</p>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-50 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Applications */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Recent Applications</h2>
            <button
              onClick={() => navigate('/candidates')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {recentApps.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No applications yet</p>
            ) : (
              recentApps.map((app) => (
                <div
                  key={app._id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/candidates/${app._id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{app.candidateName}</p>
                      <p className="text-sm text-slate-500">{app.candidateEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{app.totalScore}%</p>
                      <p className="text-xs text-slate-500">Score</p>
                    </div>

                    <Badge
                      variant={
                        app.status === 'completed' ? 'success' :
                        app.status === 'shortlisted' ? 'info' :
                        app.status === 'rejected' ? 'danger' : 'default'
                      }
                    >
                      {app.status}
                    </Badge>

                    <Eye className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};
