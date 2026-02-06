import RecruiterLayout from '../components/RecruiterLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  FileText,
  Clock,
  Target,
  Brain,
  Shield
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface CandidateAnalyticsPageProps {
  navigate: (page: string) => void;
  onLogout: () => void;
}

export default function CandidateAnalyticsPage({ navigate, onLogout }: CandidateAnalyticsPageProps) {
  const candidate = {
    name: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    score: 94,
    rank: 1,
    percentile: 98,
    status: 'Qualified',
    completedAt: '2026-02-05',
    duration: 82, // minutes
  };

  const skillScores = [
    { skill: 'React', score: 96, max: 100 },
    { skill: 'Node.js', score: 92, max: 100 },
    { skill: 'JavaScript', score: 95, max: 100 },
    { skill: 'TypeScript', score: 88, max: 100 },
    { skill: 'MongoDB', score: 85, max: 100 },
    { skill: 'REST APIs', score: 93, max: 100 },
  ];

  const sectionScores = [
    { section: 'Objective', score: 95, avgScore: 78, color: '#4F46E5' },
    { section: 'Subjective', score: 92, avgScore: 75, color: '#10B981' },
    { section: 'Coding', score: 94, avgScore: 72, color: '#8B5CF6' },
  ];

  const strengths = [
    'Excellent problem-solving skills demonstrated in coding challenges',
    'Strong understanding of React hooks and component lifecycle',
    'Well-articulated explanations in subjective answers',
    'Efficient code implementation with proper error handling',
    'Good grasp of asynchronous JavaScript patterns'
  ];

  const weaknesses = [
    'Could improve on database optimization strategies',
    'Limited experience with advanced TypeScript features',
    'Room for improvement in system design thinking'
  ];

  const resumeComparison = [
    {
      claim: 'Expert in React with 5+ years experience',
      verification: 'Verified',
      score: 96,
      status: 'match'
    },
    {
      claim: 'Strong Node.js and backend development',
      verification: 'Verified',
      score: 92,
      status: 'match'
    },
    {
      claim: 'Advanced MongoDB and database design',
      verification: 'Partial',
      score: 85,
      status: 'partial'
    },
    {
      claim: 'TypeScript expert',
      verification: 'Overstated',
      score: 88,
      status: 'mismatch'
    },
  ];

  const aiInsights = [
    {
      category: 'Technical Proficiency',
      insight: 'Candidate demonstrates strong technical skills across the stack. Performance in coding challenges indicates hands-on experience with modern JavaScript frameworks.',
      confidence: 95
    },
    {
      category: 'Problem Solving',
      insight: 'Excellent analytical thinking. Approaches problems methodically and provides well-reasoned solutions. Code quality is consistently high.',
      confidence: 92
    },
    {
      category: 'Communication',
      insight: 'Clear and concise written communication. Technical explanations are well-structured and demonstrate deep understanding of concepts.',
      confidence: 89
    },
    {
      category: 'Experience Level',
      insight: 'Performance aligns with 5+ years of experience claim. Shows senior-level expertise in React and Node.js ecosystem.',
      confidence: 94
    }
  ];

  return (
    <RecruiterLayout navigate={navigate} onLogout={onLogout} currentPage="candidate-analytics">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('evaluation-results')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{candidate.name}</h1>
              <p className="text-slate-600">{candidate.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Shortlist
            </Button>
            <Button variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">Overall Score</div>
            <div className="text-3xl font-bold text-indigo-600">{candidate.score}/100</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">Rank</div>
            <div className="text-3xl font-bold text-slate-900">#{candidate.rank}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">Percentile</div>
            <div className="text-3xl font-bold text-emerald-600">{candidate.percentile}th</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">Duration</div>
            <div className="text-3xl font-bold text-slate-900">{candidate.duration}m</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">Status</div>
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-base px-3 py-1">
              {candidate.status}
            </Badge>
          </div>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skill Analysis</TabsTrigger>
            <TabsTrigger value="strengths">Strengths & Weaknesses</TabsTrigger>
            <TabsTrigger value="resume">Resume vs Performance</TabsTrigger>
            <TabsTrigger value="ai">AI Explanation</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Skill Radar Chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Skill Performance Overview</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={skillScores}>
                      <PolarGrid stroke="#E2E8F0" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748B', fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 10 }} />
                      <Radar name="Score" dataKey="score" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {skillScores.map((skill) => (
                    <div key={skill.skill}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">{skill.skill}</span>
                        <span className="text-sm font-bold text-indigo-600">{skill.score}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                          style={{ width: `${skill.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section Comparison */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Section Performance vs Average</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sectionScores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="section" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="score" name="Candidate Score" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="avgScore" name="Average Score" fill="#CBD5E1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skillScores.map((skill) => (
                <div key={skill.skill} className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-slate-900">{skill.skill}</h4>
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-600 flex items-center justify-center">
                      <span className="text-xl font-bold text-indigo-600">{skill.score}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Proficiency Level</span>
                      <Badge className="bg-indigo-100 text-indigo-700">Expert</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Questions Answered</span>
                      <span className="font-medium text-slate-900">5/5</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Accuracy</span>
                      <span className="font-medium text-slate-900">96%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Strengths & Weaknesses Tab */}
          <TabsContent value="strengths" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Key Strengths</h3>
                </div>
                <div className="space-y-3">
                  {strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Areas for Improvement</h3>
                </div>
                <div className="space-y-3">
                  {weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700">{weakness}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Resume vs Performance Tab */}
          <TabsContent value="resume" className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Resume Claims Verification</h3>
                  <p className="text-sm text-slate-600">How candidate's performance matches their resume</p>
                </div>
              </div>

              <div className="space-y-4">
                {resumeComparison.map((item, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 mb-1">{item.claim}</p>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={
                              item.status === 'match'
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                : item.status === 'partial'
                                ? 'bg-amber-100 text-amber-700 border-amber-200'
                                : 'bg-red-100 text-red-700 border-red-200'
                            }
                          >
                            {item.verification}
                          </Badge>
                          <span className="text-sm text-slate-600">Score: {item.score}%</span>
                        </div>
                      </div>
                      {item.status === 'match' ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      ) : item.status === 'partial' ? (
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.status === 'match'
                            ? 'bg-emerald-500'
                            : item.status === 'partial'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* AI Explanation Tab */}
          <TabsContent value="ai" className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">AI-Powered Insights</h3>
                  <p className="text-slate-700">
                    Our AI has analyzed {candidate.name}'s performance across all sections and generated the following insights 
                    based on answer quality, code implementation, and problem-solving approach.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {aiInsights.map((insight, index) => (
                <div key={index} className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-semibold text-slate-900">{insight.category}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-600">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-700">{insight.insight}</p>
                  <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                      style={{ width: `${insight.confidence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Hiring Recommendation */}
            <div className="bg-white rounded-xl border-2 border-emerald-300 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Hiring Recommendation</h3>
                  <p className="text-slate-700 mb-4">
                    <strong>Strong Recommend for Hire.</strong> {candidate.name} demonstrates exceptional technical skills 
                    and problem-solving abilities that align perfectly with the Senior Full Stack Developer role. Their 
                    performance significantly exceeds the qualification threshold and ranks in the top 2% of all candidates.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Move to Interview
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download Full Report
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RecruiterLayout>
  );
}
