import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { jobAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wand2, Save, Loader2 } from 'lucide-react';

export const CreateJobPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rawJD: '',
  });
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  const handleParseJD = async () => {
    if (!formData.rawJD.trim()) {
      alert('Please paste a job description first');
      return;
    }

    try {
      setParsing(true);
      const response = await jobAPI.parseJD(formData.rawJD);
      const data = response.data.data || response.data;
      
      setParsedData(data);
      setFormData({
        ...formData,
        title: data.title || '',
        description: data.description || '',
      });
    } catch (error) {
      console.error('Parse failed:', error);
      alert('Failed to parse JD');
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.rawJD) {
      alert('Please fill required fields');
      return;
    }

    try {
      setSaving(true);
      const response = await jobAPI.createJob({
        ...formData,
        skills: parsedData?.skills || [],
        experience: parsedData?.experience || '',
        location: parsedData?.location || '',
      });

      alert('Job created successfully!');
      navigate(`/jobs/${response.data.data._id}`);
    } catch (error) {
      console.error('Failed to create job:', error);
      alert('Failed to create job');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/jobs')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create New Job</h1>
            <p className="text-slate-600 mt-1">AI will extract skills and requirements</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* JD Parser */}
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Job Description Parser
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Paste Job Description
                </label>
                <textarea
                  value={formData.rawJD}
                  onChange={(e) => setFormData({ ...formData, rawJD: e.target.value })}
                  placeholder="Paste your complete job description here..."
                  className="w-full h-64 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <Button
                type="button"
                onClick={handleParseJD}
                loading={parsing}
                variant="secondary"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Parse with AI
              </Button>
            </div>
          </Card>

          {/* Parsed Results */}
          {parsedData && (
            <Card className="bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-slate-900 mb-4">AI Extracted Data</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-slate-700">Skills:</span>
                  <p className="text-slate-600">{parsedData.skills?.join(', ')}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Experience:</span>
                  <p className="text-slate-600">{parsedData.experience}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Location:</span>
                  <p className="text-slate-600">{parsedData.location}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Basic Info */}
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <Input
                label="Job Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Senior Full Stack Developer"
                required
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief job description..."
                  className="w-full h-32 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" loading={saving}>
              <Save className="w-4 h-4 mr-2" />
              Create Job
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/jobs')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};
