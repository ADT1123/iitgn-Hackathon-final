import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { assessmentAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, FileText, Trash2, Edit, Eye } from 'lucide-react';

export const AssessmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const response = await assessmentAPI.getAssessments();
      setAssessments(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to load assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assessment?')) return;

    try {
      await assessmentAPI.deleteAssessment(id);
      alert('Assessment deleted successfully');
      loadAssessments();
    } catch (error) {
      console.error('Failed to delete assessment:', error);
      alert('Failed to delete assessment');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Assessments</h1>
            <p className="text-slate-600 mt-1">Manage and create assessments</p>
          </div>
          <Button onClick={() => navigate('/assessments/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Assessment
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6">
          <Card>
            <p className="text-sm text-slate-600 mb-1">Total Assessments</p>
            <p className="text-3xl font-bold text-slate-900">{assessments.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-600 mb-1">Published</p>
            <p className="text-3xl font-bold text-green-600">
              {assessments.filter(a => a.status === 'published').length}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-slate-600 mb-1">Draft</p>
            <p className="text-3xl font-bold text-amber-600">
              {assessments.filter(a => a.status === 'draft').length}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-slate-600 mb-1">Total Questions</p>
            <p className="text-3xl font-bold text-blue-600">
              {assessments.reduce((sum, a) => sum + (a.totalQuestions || 0), 0)}
            </p>
          </Card>
        </div>

        {/* Assessments List */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">All Assessments</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Loading assessments...</p>
            </div>
          ) : assessments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 mb-4">No assessments yet</p>
              <Button onClick={() => navigate('/assessments/create')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Assessment
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {assessments.map((assessment) => (
                <div
                  key={assessment._id}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">
                          {assessment.title}
                        </h3>
                        <Badge
                          variant={
                            assessment.status === 'published' ? 'success' :
                            assessment.status === 'draft' ? 'warning' : 'default'
                          }
                        >
                          {assessment.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {assessment.totalQuestions} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {assessment.duration} minutes
                        </span>
                        {assessment.job && (
                          <span className="text-blue-600">
                            Job: {assessment.job.title}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/assessments/${assessment._id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/assessments/${assessment._id}/edit`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(assessment._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};
