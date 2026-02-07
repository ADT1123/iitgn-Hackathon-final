import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { jobAPI, resumeAPI } from '@/services/api';
import { Upload, FileText, CheckCircle, XCircle, Loader2, Users } from 'lucide-react';

export const ResumeScreeningPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [screening, setScreening] = useState(false);
  const [results, setResults] = useState<any>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleScreenResumes = async () => {
    if (!selectedJobId) {
      alert('Please select a job');
      return;
    }

    if (files.length === 0) {
      alert('Please upload at least one resume');
      return;
    }

    try {
      setScreening(true);
      
      if (files.length === 1) {
        const response = await resumeAPI.uploadAndScreen(selectedJobId, files[0]);
        setResults({
          total: 1,
          eligible: response.data.data.eligibility.isEligible ? 1 : 0,
          rejected: response.data.data.eligibility.isEligible ? 0 : 1,
          results: [response.data.data]
        });
      } else {
        const response = await resumeAPI.bulkScreenResumes(selectedJobId, files);
        setResults(response.data.data);
      }

      alert('✅ Resume screening completed!');
    } catch (error) {
      console.error('Screening failed:', error);
      alert('Failed to screen resumes');
    } finally {
      setScreening(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resume Screening</h1>
          <p className="text-slate-600 mt-1">AI-powered resume screening and eligibility check</p>
        </div>

        {/* Upload Section */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Upload Resumes</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Select Job
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a job...</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title} - {job.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Upload Resume PDFs
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 flex items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-900">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      PDF files only, up to 5MB each
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-slate-700">
                    {files.length} file(s) selected:
                  </p>
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-slate-700">{file.name}</span>
                      <span className="text-xs text-slate-500">
                        ({Math.round(file.size / 1024)} KB)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleScreenResumes}
              loading={screening}
              disabled={!selectedJobId || files.length === 0}
              className="w-full"
            >
              <Users className="w-4 h-4 mr-2" />
              {screening ? 'Screening Resumes...' : `Screen ${files.length} Resume(s)`}
            </Button>
          </div>
        </Card>

        {/* Results */}
        {results && (
          <>
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Screening Results</h2>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{results.total}</p>
                  <p className="text-sm text-slate-600 mt-1">Total Screened</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{results.eligible}</p>
                  <p className="text-sm text-slate-600 mt-1">Eligible</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{results.rejected}</p>
                  <p className="text-sm text-slate-600 mt-1">Rejected</p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Candidate Details</h2>
              
              <div className="space-y-3">
                {results.results?.map((result: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 ${
                      result.isEligible
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {result.isEligible ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">
                            {result.candidateName || result.fileName}
                          </p>
                          <p className="text-sm text-slate-600">
                            Skill Match: {result.skillMatch || result.eligibility?.skillMatchPercentage}%
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={result.isEligible ? 'success' : 'danger'}
                      >
                        {result.isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                      </Badge>
                    </div>

                    {result.eligibility && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-slate-700">Matched Skills:</span>
                            <p className="text-slate-600">
                              {result.eligibility.matchedSkills?.join(', ') || 'None'}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">Missing Skills:</span>
                            <p className="text-slate-600">
                              {result.eligibility.missingSkills?.join(', ') || 'None'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
};
