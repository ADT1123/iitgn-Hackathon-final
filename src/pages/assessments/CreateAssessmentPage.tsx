import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { assessmentAPI, jobAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wand2, CheckCircle } from 'lucide-react';

export const CreateAssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [config, setConfig] = useState({
    duration: 90,
    objectiveCount: 10,
    subjectiveCount: 5,
    codingCount: 3,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  });
  const [generating, setGenerating] = useState(false);
  const [generatedAssessment, setGeneratedAssessment] = useState<any>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await jobAPI.getJobs({ status: 'active' });
      setJobs(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedJobId) {
      alert('Please select a job');
      return;
    }

    try {
      setGenerating(true);
      console.log('Generating assessment with config:', config);

      const response = await assessmentAPI.generateQuestions(selectedJobId, config);
      const assessment = response.data.data || response.data;

      console.log('Assessment created:', assessment);

      setGeneratedAssessment(assessment);
      alert('✅ Assessment generated successfully!');

      // Navigate back to assessments list after 2 seconds
      setTimeout(() => {
        navigate('/assessments');
      }, 2000);

    } catch (error: any) {
      console.error('Failed to generate assessment:', error);
      alert(error.response?.data?.message || 'Failed to generate assessment');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/assessments')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Assessment</h1>
          <p className="text-slate-600 mt-1">AI will generate questions automatically</p>
        </div>
      </div>

      {/* Success Message */}
      {generatedAssessment && (
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">Assessment Created Successfully!</h3>
              <p className="text-sm text-green-700 mt-1">
                {generatedAssessment.title} with {generatedAssessment.totalQuestions} questions
              </p>
              <p className="text-xs text-green-600 mt-1">
                Redirecting to assessments list...
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-6">
        {/* Select Job */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Select Job</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Job Position *
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={generating}
            >
              <option value="">Select a job...</option>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title} - {job.department}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Configuration */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Question Configuration
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Objective Questions (MCQ)"
                type="number"
                value={config.objectiveCount}
                onChange={(e) => setConfig({ ...config, objectiveCount: Number(e.target.value) })}
                min="0"
                max="50"
                disabled={generating}
              />
              <Input
                label="Subjective Questions"
                type="number"
                value={config.subjectiveCount}
                onChange={(e) => setConfig({ ...config, subjectiveCount: Number(e.target.value) })}
                min="0"
                max="20"
                disabled={generating}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Coding Questions"
                type="number"
                value={config.codingCount}
                onChange={(e) => setConfig({ ...config, codingCount: Number(e.target.value) })}
                min="0"
                max="10"
                disabled={generating}
              />
              <Input
                label="Duration (minutes)"
                type="number"
                value={config.duration}
                onChange={(e) => setConfig({ ...config, duration: Number(e.target.value) })}
                min="30"
                max="180"
                disabled={generating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Overall Difficulty
              </label>
              <select
                value={config.difficulty}
                onChange={(e) => setConfig({ ...config, difficulty: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={generating}
              >
                <option value="easy">Easy (Fresher Level)</option>
                <option value="medium">Medium (2-4 years exp)</option>
                <option value="hard">Hard (Senior Level)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Summary */}
        <Card className="bg-purple-50 border-purple-200">
          <h3 className="font-semibold text-slate-900 mb-3">Assessment Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Total Questions</p>
              <p className="text-2xl font-bold text-purple-600">
                {config.objectiveCount + config.subjectiveCount + config.codingCount}
              </p>
            </div>
            <div>
              <p className="text-slate-600">Duration</p>
              <p className="text-2xl font-bold text-blue-600">{config.duration} min</p>
            </div>
            <div>
              <p className="text-slate-600">Difficulty</p>
              <p className="text-lg font-semibold text-slate-900 capitalize">{config.difficulty}</p>
            </div>
            <div>
              <p className="text-slate-600">Estimated Time per Question</p>
              <p className="text-lg font-semibold text-slate-900">
                {Math.round(config.duration / (config.objectiveCount + config.subjectiveCount + config.codingCount))} min
              </p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={handleGenerate}
            loading={generating}
            disabled={!selectedJobId || generating}
            className="flex-1"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            {generating ? 'Generating Questions...' : 'Generate Assessment with AI'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/assessments')}
            disabled={generating}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>

  );
};
