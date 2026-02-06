import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Clock,
  CheckCircle2,
  Code,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Shield,
  Save
} from 'lucide-react';

interface CandidateAssessmentPageProps {
  navigate: (page: string) => void;
  onLogout: () => void;
}

export default function CandidateAssessmentPage({ navigate, onLogout }: CandidateAssessmentPageProps) {
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState('objective');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(5400); // 90 minutes in seconds
  const [assessment, setAssessment] = useState<any>(null);
  const [autoSaving, setAutoSaving] = useState(false);

  // ✅ Load assessment
  useEffect(() => {
    loadAssessment();
  }, []);

  // ✅ Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ✅ Auto-save every 30 seconds
  useEffect(() => {
    const autoSave = setInterval(() => {
      saveProgress();
    }, 30000);

    return () => clearInterval(autoSave);
  }, [answers]);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      // Mock assessment data - replace with real API call
      const mockAssessment = {
        title: 'Senior Full Stack Developer Assessment',
        sections: {
          objective: [
            {
              id: '1',
              type: 'objective',
              text: 'What is the primary purpose of React hooks?',
              options: [
                'To replace class components',
                'To add state and lifecycle to functional components',
                'To improve performance',
                'To enable routing'
              ],
              skill: 'React',
              difficulty: 'Medium'
            },
            {
              id: '2',
              type: 'objective',
              text: 'Which of the following is NOT a valid HTTP method?',
              options: ['GET', 'POST', 'FETCH', 'DELETE'],
              skill: 'REST APIs',
              difficulty: 'Easy'
            }
          ],
          subjective: [
            {
              id: '3',
              type: 'subjective',
              text: 'Explain the difference between authentication and authorization in web applications.',
              skill: 'Security',
              difficulty: 'Medium',
              maxWords: 200
            }
          ],
          coding: [
            {
              id: '4',
              type: 'coding',
              text: 'Implement a function to debounce API calls in JavaScript.',
              skill: 'JavaScript',
              difficulty: 'Hard',
              language: 'javascript',
              testCases: [
                { input: 'debounce(fn, 300)', expected: 'Function executes after 300ms delay' }
              ]
            }
          ]
        }
      };
      
      setAssessment(mockAssessment);
      console.log('✅ Assessment loaded');
    } catch (error) {
      console.error('❌ Load assessment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    try {
      setAutoSaving(true);
      // Save to backend
      console.log('💾 Auto-saving progress...', answers);
      await new Promise(resolve => setTimeout(resolve, 500)); // Mock delay
      console.log('✅ Progress saved');
    } catch (error) {
      console.error('❌ Save progress error:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      console.log('📤 Submitting assessment...', answers);
      
      // Submit to backend
      // await applicationAPI.submitAssessment({ answers });
      
      alert('Assessment submitted successfully!');
      navigate('evaluation-results');
    } catch (error) {
      console.error('❌ Submit error:', error);
      alert('Failed to submit assessment');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  const sections = assessment?.sections || {};
  const currentQuestions = sections[currentSection] || [];
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const totalQuestions = Object.values(sections).flat().length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900">{assessment.title}</h1>
              <p className="text-sm text-slate-600">
                Question {answeredCount + 1} of {totalQuestions}
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Auto-save indicator */}
              {autoSaving && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
              
              {/* Timer */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeRemaining < 600 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Section Tabs */}
            <div className="bg-white rounded-xl border border-slate-200 p-2 flex gap-2">
              {Object.entries(sections).map(([key, questions]: [string, any]) => (
                <button
                  key={key}
                  onClick={() => {
                    setCurrentSection(key);
                    setCurrentQuestionIndex(0);
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    currentSection === key
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {key === 'objective' && <CheckCircle2 className="w-4 h-4" />}
                    {key === 'subjective' && <MessageSquare className="w-4 h-4" />}
                    {key === 'coding' && <Code className="w-4 h-4" />}
                    <span className="capitalize">{key}</span>
                    <Badge variant="outline" className={currentSection === key ? 'bg-white/20 text-white border-white/30' : ''}>
                      {questions.length}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>

            {/* Question Card */}
            {currentQuestion && (
              <div className="bg-white rounded-xl border border-slate-200 p-8">
                {/* Question Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="outline">{currentQuestion.skill}</Badge>
                      <Badge className={
                        currentQuestion.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                        currentQuestion.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }>
                        {currentQuestion.difficulty}
                      </Badge>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {currentQuestion.text}
                    </h2>
                  </div>
                </div>

                {/* Question Content */}
                <div className="space-y-4">
                  {/* Objective - MCQ */}
                  {currentQuestion.type === 'objective' && (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => setAnswers({ ...answers, [currentQuestion.id]: option })}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            answers[currentQuestion.id] === option
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              answers[currentQuestion.id] === option
                                ? 'border-indigo-600 bg-indigo-600'
                                : 'border-slate-300'
                            }`}>
                              {answers[currentQuestion.id] === option && (
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <span className="text-slate-900">{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Subjective - Text Area */}
                  {currentQuestion.type === 'subjective' && (
                    <div>
                      <textarea
                        placeholder="Type your answer here..."
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                        className="w-full h-64 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        {(answers[currentQuestion.id] || '').split(' ').filter(Boolean).length} / {currentQuestion.maxWords} words
                      </p>
                    </div>
                  )}

                  {/* Coding - Code Editor */}
                  {currentQuestion.type === 'coding' && (
                    <div className="space-y-4">
                      <div className="bg-slate-900 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="bg-slate-800 text-slate-300">
                            {currentQuestion.language}
                          </Badge>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                            <Save className="w-4 h-4 mr-1" />
                            Save Code
                          </Button>
                        </div>
                        <textarea
                          placeholder="// Write your code here..."
                          value={answers[currentQuestion.id] || ''}
                          onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                          className="w-full h-96 bg-transparent text-slate-100 font-mono text-sm border-none focus:outline-none resize-none"
                          style={{ fontFamily: 'Monaco, Consolas, monospace' }}
                        />
                      </div>
                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <Code className="w-4 h-4 mr-2" />
                        Run Code
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentQuestionIndex > 0) {
                    setCurrentQuestionIndex(currentQuestionIndex - 1);
                  }
                }}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentQuestionIndex < currentQuestions.length - 1 ? (
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleSubmit}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submit Assessment
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar - Progress */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
              <h3 className="font-semibold text-slate-900 mb-4">Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600">Completed</span>
                    <span className="font-bold text-slate-900">{answeredCount}/{totalQuestions}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all"
                      style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Section Progress */}
                {Object.entries(sections).map(([key, questions]: [string, any]) => {
                  const sectionAnswered = questions.filter((q: any) => answers[q.id]).length;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-600 capitalize">{key}</span>
                        <span className="text-slate-900">{sectionAnswered}/{questions.length}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            key === 'objective' ? 'bg-indigo-600' :
                            key === 'subjective' ? 'bg-emerald-600' :
                            'bg-purple-600'
                          }`}
                          style={{ width: `${(sectionAnswered / questions.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Anti-Cheat Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 text-sm mb-1">Proctored Assessment</h4>
                  <p className="text-xs text-amber-800">
                    Your activity is being monitored. Switching tabs may be flagged.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
