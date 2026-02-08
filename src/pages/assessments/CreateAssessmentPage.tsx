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
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/assessments')}
            className="w-8 h-8 p-0 rounded-full hover:bg-slate-50 border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
          </Button>
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Create Assessment</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure & Generate with Recruiter AI</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {generatedAssessment && (
        <Card className="bg-emerald-50/50 border-emerald-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-900 text-sm">Assessment Created Successfully!</h3>
              <p className="text-[11px] text-emerald-700 font-medium">
                {generatedAssessment.title} with {generatedAssessment.totalQuestions} questions
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Config */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Base Configuration</h2>
            </div>

            <Card className="p-6 border-slate-200 shadow-sm space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Target Job Position
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 outline-none transition-all"
                  disabled={generating}
                >
                  <option value="">Select a job from pool...</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id} className="font-sans">
                      {job.title} — {job.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Mcq Questions</label>
                  <Input
                    type="number"
                    value={config.objectiveCount}
                    onChange={(e) => setConfig({ ...config, objectiveCount: Number(e.target.value) })}
                    className="bg-slate-50 border-slate-200 h-12 rounded-xl font-bold"
                    disabled={generating}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Subjective Questions</label>
                  <Input
                    type="number"
                    value={config.subjectiveCount}
                    onChange={(e) => setConfig({ ...config, subjectiveCount: Number(e.target.value) })}
                    className="bg-slate-50 border-slate-200 h-12 rounded-xl font-bold"
                    disabled={generating}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Coding Challenges</label>
                  <Input
                    type="number"
                    value={config.codingCount}
                    onChange={(e) => setConfig({ ...config, codingCount: Number(e.target.value) })}
                    className="bg-slate-50 border-slate-200 h-12 rounded-xl font-bold"
                    disabled={generating}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Difficulty Tier</label>
                  <select
                    value={config.difficulty}
                    onChange={(e) => setConfig({ ...config, difficulty: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 outline-none"
                    disabled={generating}
                  >
                    <option value="easy">Easy (Entry)</option>
                    <option value="medium">Medium (Professional)</option>
                    <option value="hard">Hard (Lead/Expert)</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-8">
          {/* Summary Panel */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Wand2 className="w-3 h-3" />
              Intelligence Summary
            </h3>
            <Card className="p-6 border-blue-100 bg-blue-50/20 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Volume</p>
                  <p className="text-xl font-black text-slate-900">{config.objectiveCount + config.subjectiveCount + config.codingCount} Items</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Duration</p>
                  <p className="text-xl font-black text-blue-600">{config.duration}m</p>
                </div>
              </div>

              <div className="pt-4 border-t border-blue-100/50">
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                  Recruiter AI will generate a balanced set of questions mapping to the job's core technical requirements and difficulty tier.
                </p>
              </div>

              <Button
                onClick={handleGenerate}
                loading={generating}
                disabled={!selectedJobId || generating}
                className="w-full bg-slate-900 hover:bg-black text-white rounded-xl h-14 font-black shadow-lg shadow-slate-200 transition-all uppercase tracking-widest text-xs"
              >
                {generating ? 'Generating Questions...' : 'Initialize AI Flow'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/assessments')}
                disabled={generating}
                className="w-full text-slate-400 font-bold text-xs uppercase tracking-tighter"
              >
                Cancel Process
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>

  );
};
