// src/pages/candidate/CandidateApplications.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { applicationAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Calendar, 
  TrendingUp, 
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Award
} from 'lucide-react';

export const CandidateApplications: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await applicationAPI.getApplications();
      setApplications(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const stats = {
    total: applications.length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    pending: applications.filter(a => a.status === 'pending' || a.status === 'in-progress' || a.status === 'completed').length,
    rejected: applications.filter(a => a.status === 'rejected').length
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Applications</h1>
          <p className="text-slate-600">Track your job applications and results</p>
        </div>
        <Button 
          variant="primary"
          onClick={() => navigate('/candidate/jobs')}
        >
          <Briefcase className="w-4 h-4 mr-2" />
          Browse Jobs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Shortlisted</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.shortlisted}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">In Progress</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All Applications' },
            { value: 'shortlisted', label: 'Shortlisted' },
            { value: 'completed', label: 'Completed' },
            { value: 'rejected', label: 'Rejected' }
          ].map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card className="text-center py-12">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 mb-4">
            {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
          </p>
          <Button 
            variant="primary"
            onClick={() => navigate('/candidate/jobs')}
          >
            Browse Jobs
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app: any) => (
            <Card key={app._id} className="hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-7 h-7 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {app.job?.title || 'Job Position'}
                        </h3>
                        <p className="text-sm text-slate-600">{app.job?.department || 'Department'}</p>
                      </div>
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

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {app.totalScore && (
                        <div>
                          <p className="text-xs text-slate-600 mb-1">Overall Score</p>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="text-lg font-bold text-blue-600">{app.totalScore}%</span>
                          </div>
                        </div>
                      )}

                      {app.rank && (
                        <div>
                          <p className="text-xs text-slate-600 mb-1">Rank</p>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-600" />
                            <span className="text-lg font-bold text-slate-900">#{app.rank}</span>
                          </div>
                        </div>
                      )}

                      {app.percentile && (
                        <div>
                          <p className="text-xs text-slate-600 mb-1">Percentile</p>
                          <span className="text-lg font-bold text-green-600">{app.percentile}th</span>
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-slate-600 mb-1">Applied On</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-900">
                            {new Date(app.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AI Recommendation */}
                    {app.aiRecommendation && (
                      <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-sm font-medium text-purple-900 mb-1">
                          AI Recommendation: {app.aiRecommendation.replace('-', ' ').toUpperCase()}
                        </p>
                        {app.aiReasoning && (
                          <p className="text-xs text-purple-700">{app.aiReasoning}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
