import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { assessmentAPI, jobAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wand2, Save, Loader2 } from 'lucide-react';

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
      const response = await assessmentAPI.generateQuestions(selectedJobId, config);
      const assessmentId = response.data.data._id || response.data.data.id;
      
      alert('Assessment generated successfully!');
      navigate(`/assessments/${assessmentId}`);
    } catch (error) {
      console.error('Failed to generate assessment:', error);
      alert('Failed to generate assessment');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <MainLayout>
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

        <div className="space-y-6">
          {/* Select Job */}
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Select Job</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Job Position
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a job...</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title}
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
                  label="Objective Questions"
                  type="number"
                  value={config.objectiveCount}
                  onChange={(e) => setConfig({ ...config, objectiveCount: Number(e.target.value) })}
                  min="0"
                />
                <Input
                  label="Subjective Questions"
                  type="number"
                  value={config.subjectiveCount}
                  onChange={(e) => setConfig({ ...config, subjectiveCount: Number(e.target.value) })}
                  min="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Coding Questions"
                  type="number"
                  value={config.codingCount}
                  onChange={(e) => setConfig({ ...config, codingCount: Number(e.target.value) })}
                  min="0"
                />
                <Input
                  label="Duration (minutes)"
                  type="number"
                  value={config.duration}
                  onChange={(e) => setConfig({ ...config, duration: Number(e.target.value) })}
                  min="30"
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
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-slate-900 mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <p className="text-slate-700">
                Total Questions: <strong>{config.objectiveCount + config.subjectiveCount + config.codingCount}</strong>
              </p>
              <p className="text-slate-700">
                Duration: <strong>{config.duration} minutes</strong>
              </p>
              <p className="text-slate-700">
                Difficulty: <strong className="capitalize">{config.difficulty}</strong>
              </p>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={handleGenerate} loading={generating}>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate with AI
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/assessments')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
