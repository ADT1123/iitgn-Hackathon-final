import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { jobAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wand2, Save, Loader2, Plus, X } from 'lucide-react';

export const CreateJobPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    experience: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    benefits: [''],
    skills: [''],
    salary: {
      min: 0,
      max: 0,
      currency: 'USD'
    },
    qualificationCriteria: {
      minimumScore: 60,
      autoShortlist: true,
      autoRejectBelow: 40,
      skillWeights: {
        technical: 50,
        problemSolving: 30,
        communication: 20
      }
    },
    rawJD: ''
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
        department: data.department || '',
        location: data.location || '',
        type: data.type || 'Full-time',
        experience: data.experience || '',
        description: data.description || '',
        requirements: data.requirements || [''],
        responsibilities: data.responsibilities || [''],
        benefits: data.benefits || [''],
        skills: data.skills || [''],
        salary: data.salary || formData.salary
      });

      alert('✅ Job description parsed successfully!');
    } catch (error) {
      console.error('Parse failed:', error);
      alert('Failed to parse JD. You can fill manually.');
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.department || !formData.location) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setSaving(true);

      // Clean up empty arrays
      const cleanedData = {
        ...formData,
        requirements: formData.requirements.filter(r => r.trim() !== ''),
        responsibilities: formData.responsibilities.filter(r => r.trim() !== ''),
        benefits: formData.benefits.filter(b => b.trim() !== ''),
        skills: formData.skills.filter(s => s.trim() !== '')
      };

      const response = await jobAPI.createJob(cleanedData);
      alert('✅ Job created successfully!');
      navigate(`/jobs/${response.data.data._id || response.data._id}`);
    } catch (error) {
      console.error('Failed to create job:', error);
      alert('Failed to create job');
    } finally {
      setSaving(false);
    }
  };

  const addArrayItem = (field: string) => {
    setFormData({
      ...formData,
      [field]: [...(formData as any)[field], '']
    });
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData({
      ...formData,
      [field]: (formData as any)[field].filter((_: any, i: number) => i !== index)
    });
  };

  const updateArrayItem = (field: string, index: number, value: string) => {
    const newArray = [...(formData as any)[field]];
    newArray[index] = value;
    setFormData({
      ...formData,
      [field]: newArray
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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
            AI Job Description Parser
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Paste Job Description
              </label>
              <textarea
                value={formData.rawJD}
                onChange={(e) => setFormData({ ...formData, rawJD: e.target.value })}
                placeholder="Paste your complete job description here... AI will automatically extract all fields!"
                className="w-full h-48 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
              />
            </div>

            <Button
              type="button"
              onClick={handleParseJD}
              loading={parsing}
              variant="secondary"
              className="w-full"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {parsing ? 'Parsing with AI...' : 'Parse with AI'}
            </Button>
          </div>
        </Card>

        {/* Parsed Results Preview */}
        {parsedData && (
          <Card className="bg-green-50 border-green-200">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              ✅ Successfully Parsed!
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-slate-700">Title:</span>
                <p className="text-slate-900">{parsedData.title}</p>
              </div>
              <div>
                <span className="font-medium text-slate-700">Department:</span>
                <p className="text-slate-900">{parsedData.department}</p>
              </div>
              <div>
                <span className="font-medium text-slate-700">Location:</span>
                <p className="text-slate-900">{parsedData.location}</p>
              </div>
              <div>
                <span className="font-medium text-slate-700">Experience:</span>
                <p className="text-slate-900">{parsedData.experience}</p>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-slate-700">Skills:</span>
                <p className="text-slate-900">{parsedData.skills?.join(', ')}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Basic Information */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Job Title *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Senior Full Stack Developer"
                required
              />
              <Input
                label="Department *"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Engineering"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Location *"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Remote, New York"
                required
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Job Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <Input
              label="Experience Required"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="e.g., 3-5 years"
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

        {/* Requirements */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Requirements</h2>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => addArrayItem('requirements')}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-3">
            {formData.requirements.map((req, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => updateArrayItem('requirements', index, e.target.value)}
                  placeholder="e.g., 5+ years of React experience"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.requirements.length > 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeArrayItem('requirements', index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Responsibilities */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Responsibilities</h2>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => addArrayItem('responsibilities')}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-3">
            {formData.responsibilities.map((resp, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={resp}
                  onChange={(e) => updateArrayItem('responsibilities', index, e.target.value)}
                  placeholder="e.g., Design and develop scalable web applications"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.responsibilities.length > 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeArrayItem('responsibilities', index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Skills */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Required Skills</h2>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => addArrayItem('skills')}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {formData.skills.map((skill, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => updateArrayItem('skills', index, e.target.value)}
                  placeholder="e.g., React, Node.js, MongoDB"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.skills.length > 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeArrayItem('skills', index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Salary */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Salary Range</h2>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Minimum"
              type="number"
              value={formData.salary.min}
              onChange={(e) => setFormData({
                ...formData,
                salary: { ...formData.salary, min: Number(e.target.value) }
              })}
              placeholder="50000"
            />
            <Input
              label="Maximum"
              type="number"
              value={formData.salary.max}
              onChange={(e) => setFormData({
                ...formData,
                salary: { ...formData.salary, max: Number(e.target.value) }
              })}
              placeholder="100000"
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Currency
              </label>
              <select
                value={formData.salary.currency}
                onChange={(e) => setFormData({
                  ...formData,
                  salary: { ...formData.salary, currency: e.target.value }
                })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Auto-Evaluation Settings */}
        <Card className="bg-purple-50 border-purple-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            AI Auto-Evaluation Settings
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Minimum Score to Pass (%)"
                type="number"
                value={formData.qualificationCriteria.minimumScore}
                onChange={(e) => setFormData({
                  ...formData,
                  qualificationCriteria: {
                    ...formData.qualificationCriteria,
                    minimumScore: Number(e.target.value)
                  }
                })}
                min="0"
                max="100"
              />

              <Input
                label="Auto-Reject Below (%)"
                type="number"
                value={formData.qualificationCriteria.autoRejectBelow}
                onChange={(e) => setFormData({
                  ...formData,
                  qualificationCriteria: {
                    ...formData.qualificationCriteria,
                    autoRejectBelow: Number(e.target.value)
                  }
                })}
                min="0"
                max="100"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
              <input
                type="checkbox"
                checked={formData.qualificationCriteria.autoShortlist}
                onChange={(e) => setFormData({
                  ...formData,
                  qualificationCriteria: {
                    ...formData.qualificationCriteria,
                    autoShortlist: e.target.checked
                  }
                })}
                className="w-4 h-4"
                id="autoShortlist"
              />
              <label htmlFor="autoShortlist" className="text-sm text-slate-700 cursor-pointer">
                Automatically shortlist candidates above minimum score
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Skill Category Weights (Total: {formData.qualificationCriteria.skillWeights.technical + formData.qualificationCriteria.skillWeights.problemSolving + formData.qualificationCriteria.skillWeights.communication}%)
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Input
                    label="Technical"
                    type="number"
                    value={formData.qualificationCriteria.skillWeights.technical}
                    onChange={(e) => setFormData({
                      ...formData,
                      qualificationCriteria: {
                        ...formData.qualificationCriteria,
                        skillWeights: {
                          ...formData.qualificationCriteria.skillWeights,
                          technical: Number(e.target.value)
                        }
                      }
                    })}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Input
                    label="Problem Solving"
                    type="number"
                    value={formData.qualificationCriteria.skillWeights.problemSolving}
                    onChange={(e) => setFormData({
                      ...formData,
                      qualificationCriteria: {
                        ...formData.qualificationCriteria,
                        skillWeights: {
                          ...formData.qualificationCriteria.skillWeights,
                          problemSolving: Number(e.target.value)
                        }
                      }
                    })}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Input
                    label="Communication"
                    type="number"
                    value={formData.qualificationCriteria.skillWeights.communication}
                    onChange={(e) => setFormData({
                      ...formData,
                      qualificationCriteria: {
                        ...formData.qualificationCriteria,
                        skillWeights: {
                          ...formData.qualificationCriteria.skillWeights,
                          communication: Number(e.target.value)
                        }
                      }
                    })}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              {(formData.qualificationCriteria.skillWeights.technical + formData.qualificationCriteria.skillWeights.problemSolving + formData.qualificationCriteria.skillWeights.communication) !== 100 && (
                <p className="text-sm text-amber-600 mt-2">⚠️ Weights should total 100%</p>
              )}
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 pb-8">
          <Button type="submit" loading={saving} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Creating Job...' : 'Create Job'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/jobs')}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>

  );
};
