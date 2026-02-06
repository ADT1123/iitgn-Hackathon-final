import { useState } from 'react';
import RecruiterLayout from '../components/RecruiterLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  Loader2,
  Brain,
  Zap,
  Target,
  Code,
  AlertCircle,
  ArrowRight,
  Copy,
  X
} from 'lucide-react';
import { jobAPI } from '../services/api.ts';

interface JobUploadPageProps {
  navigate: (page: string) => void;
  onLogout: () => void;
}

export default function JobUploadPage({ navigate, onLogout }: JobUploadPageProps) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Parsing, 3: Review
  const [jobTitle, setJobTitle] = useState('');
  const [rawJD, setRawJD] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [jobId, setJobId] = useState('');

  // ✅ Parse JD with AI
  const handleParseJD = async () => {
    if (!jobTitle || !rawJD) {
      setError('Please provide both job title and description');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setStep(2);

      console.log('🤖 Parsing JD with AI...', { jobTitle, rawJD: rawJD.substring(0, 100) });
      
      // Call backend API
      const response = await jobAPI.createJob({
        title: jobTitle,
        rawDescription: rawJD
      });

      console.log('✅ JD parsed successfully:', response.data);
      
      setParsedData(response.data.data.parsedData);
      setJobId(response.data.data._id);
      setStep(3);
      
    } catch (err: any) {
      console.error('❌ Parse error:', err);
      setError(err.response?.data?.message || 'Failed to parse job description');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Generate assessment
  const handleGenerateAssessment = async () => {
    try {
      setLoading(true);
      console.log('🎯 Generating assessment for job:', jobId);
      
      await jobAPI.generateAssessment(jobId);
      console.log('✅ Assessment generated');
      
      // Navigate to assessment builder
      navigate('assessment-builder');
      
    } catch (err: any) {
      console.error('❌ Generate assessment error:', err);
      setError('Failed to generate assessment');
    } finally {
      setLoading(false);
    }
  };

  // Sample JD
  const fillSampleJD = () => {
    setJobTitle('Senior Full Stack Developer');
    setRawJD(`We are seeking an experienced Full Stack Developer to join our growing team.

Requirements:
- 5+ years of experience in web development
- Strong proficiency in React.js and Node.js
- Experience with MongoDB and database design
- Solid understanding of RESTful APIs
- Knowledge of TypeScript and modern JavaScript (ES6+)
- Familiarity with Git and version control
- Experience with cloud platforms (AWS/Azure)

Responsibilities:
- Develop and maintain web applications
- Write clean, maintainable code
- Collaborate with cross-functional teams
- Participate in code reviews
- Mentor junior developers

Nice to have:
- Experience with Docker and Kubernetes
- Knowledge of CI/CD pipelines
- Understanding of microservices architecture`);
  };

  return (
    <RecruiterLayout navigate={navigate} onLogout={onLogout} currentPage="job-upload">
      <div className="p-6">
        {/* Step 1: Upload JD */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-indigo-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Assessment</h1>
              <p className="text-slate-600">Upload your job description and let AI do the magic</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
              {/* Error */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                  <button onClick={() => setError('')}>
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              )}

              {/* Job Title */}
              <div className="mb-6">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Job Title *
                </label>
                <Input
                  placeholder="e.g., Senior Full Stack Developer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="text-lg"
                />
              </div>

              {/* Job Description */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">
                    Job Description *
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fillSampleJD}
                    className="text-indigo-600"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Use Sample
                  </Button>
                </div>
                <textarea
                  placeholder="Paste your complete job description here...

Include:
- Required skills and experience
- Responsibilities
- Technologies and tools
- Qualifications"
                  value={rawJD}
                  onChange={(e) => setRawJD(e.target.value)}
                  className="w-full h-64 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                />
                <p className="text-xs text-slate-500 mt-2">
                  {rawJD.length} characters • Recommended: 500-2000 characters
                </p>
              </div>

              {/* Features */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-600" />
                  AI Will Extract:
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Target, label: 'Required Skills' },
                    { icon: Zap, label: 'Experience Level' },
                    { icon: Code, label: 'Technologies' },
                    { icon: CheckCircle2, label: 'Qualifications' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <item.icon className="w-4 h-4 text-indigo-600" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload File Option */}
              <div className="mb-6">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 mb-1">Or upload a file</p>
                  <p className="text-xs text-slate-500">PDF, DOC, DOCX (Max 5MB)</p>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
                </div>
              </div>

              {/* Submit */}
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-6"
                onClick={handleParseJD}
                disabled={!jobTitle || !rawJD}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Parse with AI
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Parsing (Loading) */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <Sparkles className="w-12 h-12 text-indigo-600 animate-pulse" />
              <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">AI is analyzing your JD...</h2>
            <p className="text-slate-600 mb-8">This usually takes 5-10 seconds</p>
            
            <div className="space-y-3 max-w-md mx-auto">
              {[
                'Extracting required skills',
                'Identifying experience level',
                'Parsing technologies',
                'Analyzing responsibilities'
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-left bg-white rounded-lg p-4 border border-slate-200">
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin flex-shrink-0" />
                  <span className="text-slate-700">{text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Review Parsed Data */}
        {step === 3 && parsedData && (
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{jobTitle}</h1>
                  <p className="text-slate-600">Review AI-extracted data</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Required Skills */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    Required Skills ({parsedData.requiredSkills?.length || 0})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.requiredSkills?.map((skill: any, i: number) => (
                      <Badge
                        key={i}
                        className={`px-3 py-1 ${
                          skill.importance === 'critical'
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : skill.importance === 'high'
                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {skill.skill} • {skill.weight}%
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Responsibilities */}
                {parsedData.responsibilities?.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Key Responsibilities
                    </h3>
                    <ul className="space-y-2">
                      {parsedData.responsibilities.map((resp: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tools & Technologies */}
                {parsedData.tools?.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Code className="w-5 h-5 text-purple-600" />
                      Tools & Technologies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.tools.map((tool: string, i: number) => (
                        <Badge key={i} variant="outline" className="px-3 py-1">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar - Summary */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Quick Summary</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Experience Level</div>
                      <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                        {parsedData.experienceLevel || 'Mid-Senior'}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Domain</div>
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                        {parsedData.domain || 'Technology'}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Skills to Assess</div>
                      <div className="text-2xl font-bold text-slate-900">
                        {parsedData.requiredSkills?.length || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Soft Skills */}
                {parsedData.softSkills?.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Soft Skills</h3>
                    <div className="space-y-2">
                      {parsedData.softSkills.map((skill: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                  <h3 className="font-semibold mb-4">Ready to generate?</h3>
                  <p className="text-sm opacity-90 mb-6">
                    AI will create custom MCQs, coding challenges, and subjective questions based on this JD.
                  </p>
                  <Button
                    className="w-full bg-white text-indigo-600 hover:bg-slate-100"
                    onClick={handleGenerateAssessment}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Generate Assessment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RecruiterLayout>
  );
}
