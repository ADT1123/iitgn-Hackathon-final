import { useState } from 'react';
import RecruiterLayout from '../components/RecruiterLayout';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface JobUploadPageProps {
  navigate: (page: string) => void;
  onLogout: () => void;
}

export default function JobUploadPage({ navigate, onLogout }: JobUploadPageProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [isParsed, setIsParsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Mock parsed data
  const parsedData = {
    role: 'Senior Full Stack Developer',
    experienceLevel: '5-7 years',
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'MongoDB', 'REST APIs'],
    preferredSkills: ['GraphQL', 'Docker', 'AWS', 'Redis'],
    tools: ['Git', 'Jira', 'VS Code'],
    complexity: 'High',
    educationLevel: "Bachelor's in Computer Science or related field"
  };

  const handleParse = () => {
    if (jobDescription.trim()) {
      setIsParsed(true);
    }
  };

  const handleGenerateAssessment = () => {
    navigate('assessment-builder');
  };

  const removeSkill = (skill: string, category: 'required' | 'preferred') => {
    // Mock removal - in real app would update state
  };

  return (
    <RecruiterLayout navigate={navigate} onLogout={onLogout} currentPage="job-upload">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Description Parser</h1>
          <p className="text-slate-600 mt-1">Upload or paste your job description and let AI extract the requirements</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Job Description Input</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload PDF/DOC
              </Button>
            </div>
          </div>

          <Textarea
            placeholder="Paste your job description here...&#10;&#10;Example:&#10;We are looking for a Senior Full Stack Developer with 5+ years of experience...&#10;&#10;Requirements:&#10;- Strong experience with React and Node.js&#10;- Proficiency in TypeScript and MongoDB&#10;- Experience with REST APIs and microservices..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-500">
              {jobDescription.length} characters
            </p>
            <Button 
              onClick={handleParse} 
              disabled={!jobDescription.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Parse with AI
            </Button>
          </div>
        </div>

        {/* Parsed Results */}
        {isParsed && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-1">AI Parsing Complete</h2>
                    <p className="text-sm text-slate-600">
                      We've extracted key requirements from your job description
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Content */}
            {isExpanded && (
              <div className="p-6 space-y-6">
                {/* Role & Experience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Role Title</label>
                    <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-slate-900 font-medium">{parsedData.role}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Experience Level</label>
                    <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-slate-900 font-medium">{parsedData.experienceLevel}</p>
                    </div>
                  </div>
                </div>

                {/* Required Skills */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Required Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.requiredSkills.map((skill) => (
                      <div
                        key={skill}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {skill}
                        <button className="hover:bg-indigo-200 rounded p-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button className="px-3 py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:border-indigo-400 hover:text-indigo-600">
                      + Add Skill
                    </button>
                  </div>
                </div>

                {/* Preferred Skills */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Preferred Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.preferredSkills.map((skill) => (
                      <div
                        key={skill}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium"
                      >
                        {skill}
                        <button className="hover:bg-emerald-200 rounded p-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button className="px-3 py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:border-emerald-400 hover:text-emerald-600">
                      + Add Skill
                    </button>
                  </div>
                </div>

                {/* Tools & Technologies */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Tools & Technologies</label>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.tools.map((tool) => (
                      <div
                        key={tool}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium"
                      >
                        {tool}
                        <button className="hover:bg-slate-200 rounded p-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Complexity & Education */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Role Complexity</label>
                    <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            parsedData.complexity === 'High' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}
                        ></span>
                        <p className="text-slate-900 font-medium">{parsedData.complexity}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Education</label>
                    <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-slate-900 text-sm">{parsedData.educationLevel}</p>
                    </div>
                  </div>
                </div>

                {/* AI Explanation */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    How AI Interpreted Your JD
                  </h3>
                  <p className="text-sm text-indigo-800">
                    Based on the job description, this role requires <strong>advanced technical expertise</strong> with a focus on 
                    full-stack development. The position emphasizes modern JavaScript frameworks, backend development with Node.js, 
                    and database management. Candidates should have significant hands-on experience building scalable web applications.
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-slate-200 p-6 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FileText className="w-4 h-4" />
                <span>Ready to generate assessment</span>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline">
                  Save Draft
                </Button>
                <Button 
                  onClick={handleGenerateAssessment}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Assessment
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RecruiterLayout>
  );
}
