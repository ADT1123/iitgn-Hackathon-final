import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { jobAPI, assessmentAPI } from '@/services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  FileText, 
  Users,
  BarChart3,
  Loader2 
} from 'lucide-react';

export const JobDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getJobById(id!);
      setJob(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to load job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssessment = async () => {
    try {
      const response = await assessmentAPI.createAssessment({ jobId: id });
      navigate(`/assessments/${response.data.data._id}`);
    } catch (error) {
      console.error('Failed to create assessment:', error);
      alert('Failed to create assessment');
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

  if (!job) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Job not found</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/jobs')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
              <p className="text-slate-600 mt-1">{job.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant={
                job.status === 'active' ? 'success' :
                job.status === 'closed' ? 'danger' : 'default'
              }
            >
              {job.status}
            </Badge>
            <Button variant="secondary" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="danger" size="sm">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Applicants</p>
                <p className="text-2xl font-bold text-slate-900">{job.applicantsCount || 0}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Assessment</p>
                <p className="text-2xl font-bold text-slate-900">
                  {job.assessmentId ? '✓' : '—'}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Avg Score</p>
                <p className="text-2xl font-bold text-slate-900">—%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Details */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Job Details</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {job.skills?.map((skill: string, idx: number) => (
                  <Badge key={idx} variant="info">{skill}</Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Experience</p>
              <p className="text-slate-900">{job.experience || 'Not specified'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Location</p>
              <p className="text-slate-900">{job.location || 'Not specified'}</p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        {!job.assessmentId && (
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Create Assessment
                </h3>
                <p className="text-sm text-slate-600">
                  Generate AI-powered questions for this job
                </p>
              </div>
              <Button onClick={handleCreateAssessment}>
                <FileText className="w-4 h-4 mr-2" />
                Create
              </Button>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};
