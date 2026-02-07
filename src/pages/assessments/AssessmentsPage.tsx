import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { assessmentAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  FileText, 
  Clock, 
  HelpCircle,
  Loader2,
  Eye,
  Settings
} from 'lucide-react';

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
      setAssessments(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to load assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Assessments</h1>
            <p className="text-slate-600 mt-1">Create and manage assessments</p>
          </div>
          <Button onClick={() => navigate('/assessments/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Assessment
          </Button>
        </div>

        {/* Assessments List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : assessments.length === 0 ? (
          <Card className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">No assessments found</p>
            <Button onClick={() => navigate('/assessments/create')}>
              Create Your First Assessment
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((assessment) => (
              <Card
                key={assessment._id}
                onClick={() => navigate(`/assessments/${assessment._id}`)}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <Badge
                      variant={assessment.status === 'published' ? 'success' : 'default'}
                    >
                      {assessment.status}
                    </Badge>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg mb-1">
                      {assessment.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      For: {assessment.job?.title || 'Unknown Job'}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                    <div>
                      <div className="flex items-center gap-2 text-slate-600 mb-1">
                        <HelpCircle className="w-4 h-4" />
                        <span className="text-sm">Questions</span>
                      </div>
                      <p className="font-semibold text-slate-900">
                        {assessment.totalQuestions || 0}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-slate-600 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Duration</span>
                      </div>
                      <p className="font-semibold text-slate-900">
                        {assessment.duration} min
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/assessments/${assessment._id}`);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/assessments/${assessment._id}/edit`);
                      }}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
