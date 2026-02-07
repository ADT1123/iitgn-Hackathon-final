
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Upload, FileText, Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { resumeAPI } from '@/services/api';

export const ResumeScreeningPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a resume file');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please enter a job description to compare against');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    try {
      const response = await resumeAPI.screenResume(formData);
      setResult(response.data.data);
    } catch (err: any) {
      console.error('Screening failed:', err);
      setError(err.response?.data?.message || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resume Screening</h1>
          <p className="text-slate-600">AI-powered resume analysis and matching</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold mb-4">1. Job Details</h2>
              <textarea
                className="w-full h-40 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                placeholder="Paste the job description or requirements here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </Card>

            <Card>
              <h2 className="text-lg font-semibold mb-4">2. Upload Resume</h2>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  {file ? (
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-blue-600 mb-2" />
                      <p className="font-medium text-slate-900">{file.name}</p>
                      <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-12 h-12 text-slate-400 mb-2" />
                      <p className="font-medium text-slate-900">Click to upload resume</p>
                      <p className="text-sm text-slate-500">PDF or Word documents</p>
                    </div>
                  )}
                </label>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Button
                variant="primary"
                className="w-full mt-6"
                onClick={handleAnalyze}
                disabled={loading || !file || !jobDescription}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Analyze Resume
                  </>
                )}
              </Button>
            </Card>
          </div>

          {/* Results Section */}
          {result && (
            <div className="space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Analysis Results</h2>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Match Score</p>
                    <p className={`text-3xl font-bold ${result.score >= 70 ? 'text-emerald-600' :
                        result.score >= 40 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                      {result.score}%
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Summary</h3>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                      {result.summary}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Matching Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matchingSkills.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="success">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Missing Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="danger">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
