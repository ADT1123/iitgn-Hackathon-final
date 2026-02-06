import { useState, useEffect } from 'react';
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
  Shield,
  Code,
  MessageSquare,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Award
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { applicationAPI } from '../services/api';

interface CandidateAnalyticsPageProps {
  navigate: (page: string) => void;
  onLogout: () => void;
  candidateId?: string;
}

export default function CandidateAnalyticsPage({ navigate, onLogout, candidateId }: CandidateAnalyticsPageProps) {
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadCandidateData();
  }, [candidateId]);

  // ✅ Load candidate data from backend
  const loadCandidateData = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading candidate analytics...', candidateId);
      
      // Mock data for now - replace with real API call
      const mockCandidate = {
        id: candidateId || '1',
        name: 'Sarah Chen',
        email: 'sarah.chen@email.com',
        phone: '+1 234 567 8900',
        score: 94,
        rank: 1,
        percentile: 98,
        status: 'Qualified',
        completedAt: '2026-02-05T14:30:00Z',
        duration: 82,
        
        // Skill scores
        skillScores: [
          { skill: 'React', score: 96, max: 100, category: 'Frontend' },
          { skill: 'Node.js', score: 92, max: 100, category: 'Backend' },
          { skill: 'JavaScript', score: 95, max: 100, category: 'Programming' },
          { skill: 'TypeScript', score: 88, max: 100, category: 'Programming' },
          { skill: 'MongoDB', score: 85, max: 100, category: 'Database' },
          { skill: 'REST APIs', score: 93, max: 100, category: 'Backend' }
        ],
        
        // Section scores
        sectionScores: [
          { section: 'Objective', score: 95, avgScore: 78, total: 20, answered: 19, color: '#4F46E5' },
          { section: 'Subjective', score: 92, avgScore: 75, total: 5, answered: 5, color: '#10B981' },
          { section: 'Coding', score: 94, avgScore: 72, total: 3, answered: 3, color: '#8B5CF6' }
        ],
        
        // Time tracking
        timeSpentPerSection: [
          { section: 'Objective', time: 28, avgTime: 35 },
          { section: 'Subjective', time: 35, avgTime: 30 },
          { section: 'Coding', time: 19, avgTime: 25 }
        ],
        
        // Strengths
        strengths: [
          'Excellent problem-solving skills demonstrated in coding challenges',
          'Strong understanding of React hooks and component lifecycle',
          'Well-articulated explanations in subjective answers',
          'Efficient code implementation with proper error handling',
          'Good grasp of asynchronous JavaScript patterns',
          'Clean code structure and best practices followed'
        ],
        
        // Weaknesses
        weaknesses: [
          'Could improve on database optimization strategies',
          'Limited experience with advanced TypeScript features',
          'Room for improvement in system design thinking',
          'Needs better understanding of caching mechanisms'
        ],
        
        // Resume comparison
        resumeComparison: [
          {
            claim: 'Expert in React with 5+ years experience',
            verification: 'Verified',
            score: 96,
            status: 'match',
            evidence: 'Scored 96% in React questions, demonstrated advanced concepts'
          },
          {
            claim: 'Strong Node.js and backend development',
            verification: 'Verified',
            score: 92,
            status: 'match',
            evidence: 'Solid backend knowledge, API design score 93%'
          },
          {
            claim: 'Advanced MongoDB and database design',
            verification: 'Partial',
            score: 85,
            status: 'partial',
            evidence: 'Good basics but lacks advanced optimization knowledge'
          },
          {
            claim: 'TypeScript expert',
            verification: 'Overstated',
            score: 88,
            status: 'mismatch',
            evidence: 'Intermediate level, not expert. Missing advanced type patterns'
          }
        ],
        
        // AI insights
        aiInsights: [
          {
            category: 'Technical Proficiency',
            insight: 'Candidate demonstrates strong technical skills across the stack. Performance in coding challenges indicates hands-on experience with modern JavaScript frameworks. Code quality is consistently high with proper error handling and ES6+ patterns.',
            confidence: 95,
            tags: ['Technical Excellence', 'Modern Practices']
          },
          {
            category: 'Problem Solving',
            insight: 'Excellent analytical thinking demonstrated through systematic approach to complex problems. Approaches challenges methodically and provides well-reasoned solutions. Strong debugging skills evident in coding submissions.',
            confidence: 92,
            tags: ['Analytical', 'Methodical']
          },
          {
            category: 'Communication',
            insight: 'Clear and concise written communication in subjective answers. Technical explanations are well-structured and demonstrate deep understanding of concepts. Articulates thought process effectively.',
            confidence: 89,
            tags: ['Clear Communication', 'Technical Writing']
          },
          {
            category: 'Experience Level',
            insight: 'Performance aligns with 5+ years of experience claim in frontend development. Shows senior-level expertise in React and Node.js ecosystem. Code patterns indicate professional development background.',
            confidence: 94,
            tags: ['Senior Level', 'Experienced']
          },
          {
            category: 'Code Quality',
            insight: 'Follows industry best practices and coding standards. Uses modern ES6+ features appropriately. Implements proper error handling and validation. Code is maintainable and well-documented.',
            confidence: 93,
            tags: ['Best Practices', 'Clean Code']
          }
        ],
        
        // Question-wise breakdown
        questionBreakdown: [
          { id: 1, question: 'React Hooks', score: 100, time: 2.5, difficulty: 'Medium', type: 'objective' },
          { id: 2, question: 'HTTP Methods', score: 100, time: 1.8, difficulty: 'Easy', type: 'objective' },
          { id: 3, question: 'Auth vs Authorization', score: 95, time: 8.5, difficulty: 'Medium', type: 'subjective' },
          { id: 4, question: 'Debounce Function', score: 90, time: 15.2, difficulty: 'Hard', type: 'coding' },
          { id: 5, question: 'BST Time Complexity', score: 100, time: 2.1, difficulty: 'Medium', type: 'objective' },
          { id: 6, question: 'REST API Endpoint', score: 95, time: 18.5, difficulty: 'Hard', type: 'coding' },
          { id: 7, question: 'Database Optimization', score: 85, time: 12.3, difficulty: 'Hard', type: 'subjective' },
          { id: 8, question: 'React State Management', score: 100, time: 2.8, difficulty: 'Medium', type: 'objective' }
        ],
        
        // Flags
        flags: {
          resumeMismatch: false,
          plagiarism: false,
          unusualTimePattern: false,
          tabSwitches: 2,
          copyPasteAttempts: 0
        }
      };
      
      setCandidate(mockCandidate);
      console.log('✅ Candidate data loaded');
      
    } catch (error) {
      console.error('❌ Load candidate error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Download report
  const handleDownloadReport = async () => {
    try {
      setDownloading(true);
      console.log('⬇️ Downloading candidate report...');
      
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Report downloaded successfully!');
      
    } catch (error) {
      console.error('❌ Download error:', error);
    } finally {
      setDownloading(false);
    }
  };

  // ✅ Shortlist candidate
  const handleShortlist = async () => {
    try {
      console.log('✅ Shortlisting candidate:', candidate.id);
      // await applicationAPI.updateStatus(candidate.id, 'shortlisted');
      alert(`${candidate.name} has been shortlisted!`);
    } catch (error) {
      console.error('❌ Shortlist error:', error);
    }
  };

  // ✅ Reject candidate
  const handleReject = async () => {
    try {
      console.log('❌ Rejecting candidate:', candidate.id);
      // await applicationAPI.updateStatus(candidate.id, 'rejected');
      alert(`${candidate.name} has been rejected.`);
    } catch (error) {
      console.error('❌ Reject error:', error);
    }
  };

  if (loading) {
    return (
      <RecruiterLayout navigate={navigate} onLogout={onLogout} currentPage="candidate-analytics">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading candidate analytics...</p>
          </div>
        </div>
      </RecruiterLayout>
    );
  }

  if (!candidate) {
    return (
      <RecruiterLayout navigate={navigate} onLogout={onLogout} currentPage="candidate-analytics">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
            <p className="text-slate-600">Candidate not found</p>
          </div>
        </div>
      </RecruiterLayout>
    );
  }

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
              <div className="flex items-center gap-3 text-slate-600 mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {candidate.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {candidate.phone}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleDownloadReport}
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              onClick={handleShortlist}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Shortlist
            </Button>
            <Button
              variant="outline"
              className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
              onClick={handleReject}
            >
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
            <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                style={{ width: `${candidate.score}%` }}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">Rank</div>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-slate-900">#{candidate.rank}</div>
              {candidate.rank <= 3 && <Award className="w-6 h-6 text-amber-500" />}
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">Percentile</div>
            <div className="text-3xl font-bold text-emerald-600">{candidate.percentile}th</div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">Duration</div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              <div className="text-3xl font-bold text-slate-900">{candidate.duration}m</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">Status</div>
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-base px-3 py-1">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              {candidate.status}
            </Badge>
          </div>
        </div>

        {/* Flags/Warnings */}
        {(candidate.flags.tabSwitches > 5 || candidate.flags.copyPasteAttempts > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900 mb-2">Activity Flags</h4>
                <div className="space-y-1 text-sm text-amber-800">
                  {candidate.flags.tabSwitches > 5 && (
                    <p>• Switched tabs {candidate.flags.tabSwitches} times during assessment</p>
                  )}
                  {candidate.flags.copyPasteAttempts > 0 && (
                    <p>• {candidate.flags.copyPasteAttempts} copy/paste attempts detected</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skill Analysis</TabsTrigger>
            <TabsTrigger value="questions">Question Breakdown</TabsTrigger>
            <TabsTrigger value="strengths">Strengths & Weaknesses</TabsTrigger>
            <TabsTrigger value="resume">Resume vs Performance</TabsTrigger>
            <TabsTrigger value="ai">AI Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Skill Radar Chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Skill Performance Overview</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={candidate.skillScores}>
                      <PolarGrid stroke="#E2E8F0" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748B', fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 10 }} />
                      <Radar name="Score" dataKey="score" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {candidate.skillScores.map((skill: any, i: number) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-sm font-medium text-slate-900">{skill.skill}</span>
                          <span className="text-xs text-slate-500 ml-2">({skill.category})</span>
                        </div>
                        <span className="text-sm font-bold text-indigo-600">{skill.score}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all"
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
                <BarChart data={candidate.sectionScores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="section" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="score" name="Candidate Score" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="avgScore" name="Average Score" fill="#CBD5E1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Time Analysis */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Time Spent Analysis</h3>
              <div className="space-y-4">
                {candidate.timeSpentPerSection.map((section: any, i: number) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{section.section}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-600">
                          Candidate: <strong>{section.time}m</strong>
                        </span>
                        <span className="text-sm text-slate-600">
                          Avg: <strong>{section.avgTime}m</strong>
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600"
                          style={{ width: `${(section.time / 60) * 100}%` }}
                        />
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-400"
                          style={{ width: `${(section.avgTime / 60) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidate.skillScores.map((skill: any, i: number) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900">{skill.skill}</h4>
                      <p className="text-sm text-slate-600">{skill.category}</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-600 flex items-center justify-center">
                      <span className="text-xl font-bold text-indigo-600">{skill.score}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Proficiency Level</span>
                      <Badge className={
                        skill.score >= 90 ? 'bg-emerald-100 text-emerald-700' :
                        skill.score >= 80 ? 'bg-blue-100 text-blue-700' :
                        skill.score >= 70 ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }>
                        {skill.score >= 90 ? 'Expert' : skill.score >= 80 ? 'Advanced' : skill.score >= 70 ? 'Intermediate' : 'Beginner'}
                      </Badge>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                        style={{ width: `${skill.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900">#</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900">Question</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900">Type</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900">Difficulty</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900">Score</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {candidate.questionBreakdown.map((q: any) => (
                      <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-semibold text-slate-700">
                            {q.id}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-slate-900">{q.question}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="capitalize">
                            {q.type === 'objective' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {q.type === 'subjective' && <MessageSquare className="w-3 h-3 mr-1" />}
                            {q.type === 'coding' && <Code className="w-3 h-3 mr-1" />}
                            {q.type}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={
                            q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                            q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }>
                            {q.difficulty}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{q.score}%</span>
                            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  q.score >= 90 ? 'bg-emerald-600' :
                                  q.score >= 70 ? 'bg-amber-600' :
                                  'bg-red-600'
                                }`}
                                style={{ width: `${q.score}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-slate-600">{q.time} min</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                  <h3 className="text-lg font-semibold text-slate-900">Key Strengths ({candidate.strengths.length})</h3>
                </div>
                <div className="space-y-3">
                  {candidate.strengths.map((strength: string, index: number) => (
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
                  <h3 className="text-lg font-semibold text-slate-900">Areas for Improvement ({candidate.weaknesses.length})</h3>
                </div>
                <div className="space-y-3">
                  {candidate.weaknesses.map((weakness: string, index: number) => (
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
                {candidate.resumeComparison.map((item: any, index: number) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 mb-2">{item.claim}</p>
                        <div className="flex items-center gap-3 mb-2">
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
                          <span className="text-sm font-semibold text-slate-900">Score: {item.score}%</span>
                        </div>
                        <p className="text-sm text-slate-600">{item.evidence}</p>
                      </div>
                      {item.status === 'match' ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                      ) : item.status === 'partial' ? (
                        <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
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

          {/* AI Insights Tab */}
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
              {candidate.aiInsights.map((insight: any, index: number) => (
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
                  <p className="text-slate-700 mb-4">{insight.insight}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {insight.tags.map((tag: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all"
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
                    <strong className="text-emerald-700">Strong Recommend for Hire.</strong> {candidate.name} demonstrates exceptional technical skills 
                    and problem-solving abilities that align perfectly with the Senior Full Stack Developer role. Their 
                    performance significantly exceeds the qualification threshold and ranks in the top {100 - candidate.percentile}% of all candidates.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleShortlist}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Move to Interview
                    </Button>
                    <Button variant="outline" onClick={handleDownloadReport}>
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
