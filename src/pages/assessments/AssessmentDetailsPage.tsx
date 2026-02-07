import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { assessmentAPI } from '@/services/api';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Link as LinkIcon,
  Clock,
  FileText,
  Users,
  Copy,
  CheckCircle,
  XCircle,
  TrendingUp,
  Download,
  Eye,
  Power
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AssessmentDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) loadAssessment();
  }, [id]);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      const response = await assessmentAPI.getAssessmentById(id!);
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to load assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/take-assessment/${data.assessment.uniqueLink}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleLinkStatus = async () => {
    try {
      await assessmentAPI.toggleLinkStatus(id!);
      alert('Link status updated');
      loadAssessment();
    } catch (error) {
      alert('Failed to update link status');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-slate-600">Loading assessment...</p>
        </div>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Assessment not found</p>
        </div>
      </MainLayout>
    );
  }

  const { assessment, applications, stats } = data;
  const link = `${window.location.origin}/take-assessment/${assessment.uniqueLink}`;

  const statusData = [
    { name: 'Shortlisted', value: stats.shortlisted, color: '#10b981' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
    { name: 'Pending', value: stats.completed - stats.shortlisted - stats.rejected, color: '#f59e0b' }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/assessments')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{assessment.title}</h1>
              <p className="text-slate-600 mt-1">
                {assessment.job?.title} - {assessment.job?.department}
              </p>
            </div>
          </div>
        </div>

        {/* Assessment Link Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Candidate Assessment Link</h3>
                  <p className="text-sm text-slate-600">Share this link with candidates</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                <code className="flex-1 text-sm text-blue-600 font-mono">{link}</code>
                <Button size="sm" onClick={copyLink}>
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              <div className="flex items-center gap-4 mt-3">
                <Badge variant={assessment.linkActive ? 'success' : 'danger'}>
                  {assessment.linkActive ? 'Link Active' : 'Link Disabled'}
                </Badge>
                <span className="text-sm text-slate-600">
                  {assessment.totalAttempts} attempts | {assessment.completedAttempts} completed
                </span>
              </div>
            </div>

            <Button
              variant={assessment.linkActive ? 'danger' : 'primary'}
              onClick={toggleLinkStatus}
            >
              <Power className="w-4 h-4 mr-2" />
              {assessment.linkActive ? 'Disable Link' : 'Enable Link'}
            </Button>
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-5 gap-6">
          <Card>
            <p className="text-sm text-slate-600 mb-1">Total Questions</p>
            <p className="text-3xl font-bold text-slate-900">{assessment.totalQuestions}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-600 mb-1">Total Applications</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalApplications}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-600 mb-1">Shortlisted</p>
            <p className="text-3xl font-bold text-green-600">{stats.shortlisted}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-600 mb-1">Average Score</p>
            <p className="text-3xl font-bold text-purple-600">{stats.averageScore}%</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-600 mb-1">Highest Score</p>
            <p className="text-3xl font-bold text-amber-600">{stats.highestScore}%</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Application Status Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Score Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={applications.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="candidateName" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalScore" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Applications Table */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">All Applications</h2>
            <Button variant="secondary" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No applications yet</p>
              <p className="text-sm text-slate-500 mt-1">Share the assessment link with candidates</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">Rank</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">Candidate</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">Email</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">Score</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">Status</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">Submitted</th>
                    <th className="text-left p-3 text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app: any, index: number) => (
                    <tr key={app._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3">
                        <span className="font-semibold text-slate-900">#{index + 1}</span>
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-slate-900">{app.candidateName}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm text-slate-600">{app.candidateEmail}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-blue-600">{app.totalScore}%</span>
                          {app.totalScore >= 80 && (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            app.status === 'shortlisted' ? 'success' :
                            app.status === 'rejected' ? 'danger' : 'warning'
                          }
                        >
                          {app.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <p className="text-sm text-slate-600">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/candidates/${app._id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};
