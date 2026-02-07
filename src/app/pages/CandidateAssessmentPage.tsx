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
  Save,
  Play,
  AlertTriangle,
  X,
  Sparkles,
  Target
} from 'lucide-react';
import { applicationAPI, proctoringAPI, codeExecutionAPI } from '../services/api';

interface CandidateAssessmentPageProps {
  navigate: (page: string) => void;
  onLogout: () => void;
  jobId?: string;
}

export default function CandidateAssessmentPage({ navigate, onLogout, jobId }: CandidateAssessmentPageProps) {
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState('objective');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(5400); // 90 minutes in seconds
  const [assessment, setAssessment] = useState<any>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [codeOutput, setCodeOutput] = useState<any>(null);
  const [runningCode, setRunningCode] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Load assessment
  useEffect(() => {
    loadAssessment();
    setupProctoring();
  }, []);

  // ✅ Timer
  useEffect(() => {
    if (!assessment || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [assessment, timeRemaining]);

  // ✅ Auto-save every 30 seconds
  useEffect(() => {
    if (!applicationId || Object.keys(answers).length === 0) return;

    const autoSave = setInterval(() => {
      saveProgress();
    }, 30000);

    return () => clearInterval(autoSave);
  }, [answers, applicationId]);

  // ✅ Setup proctoring
  const setupProctoring = () => {
    // Track tab switches
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        trackActivity('tab_switch');
      }
    };

    // Prevent copy/paste
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      trackActivity('copy');
      alert('Copying is disabled during assessment');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      trackActivity('paste');
      alert('Pasting is disabled during assessment');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
    };
  };

  // ✅ Track proctoring activity
  const trackActivity = async (eventType: 'tab_switch' | 'copy' | 'paste' | 'screenshot') => {
    if (!applicationId) return;

    try {
      await proctoringAPI.trackActivity({
        applicationId,
        eventType,
        timestamp: new Date().toISOString()
      });
      console.log('🔒 Proctoring event tracked:', eventType);
    } catch (error) {
      console.error('❌ Track activity error:', error);
    }
  };

  // ✅ Load assessment from backend
  const loadAssessment = async () => {
    try {
      setLoading(true);
      
      // Get job ID from props or URL
      const id = jobId || new URLSearchParams(window.location.search).get('jobId');
      
      if (!id) {
        alert('No job ID provided');
        navigate('landing');
        return;
      }

      console.log('📝 Starting assessment for job:', id);

      // ✅ Start assessment - creates application
      const response = await applicationAPI.startAssessment(id);
      const data = response.data.data || response.data;
      
      console.log('✅ Assessment started:', data);

      setApplicationId(data.applicationId || data._id);
      setAssessment(data.assessment || data);
      setTimeRemaining(data.duration * 60 || 5400); // Convert minutes to seconds

      // Load saved progress if exists
      if (data.savedAnswers) {
        setAnswers(data.savedAnswers);
      }

    } catch (err: any) {
      console.error('❌ Load assessment error:', err);
      
      // Fallback to mock data for development
      if (err.response?.status === 404 || err.message === 'Network Error') {
        console.log('⚠️ Using mock data for development');
        loadMockAssessment();
      } else {
        alert(err.response?.data?.message || 'Failed to load assessment');
        navigate('landing');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Mock data fallback
  const loadMockAssessment = () => {
    setApplicationId('mock-app-id');
    setAssessment({
      title: 'Senior Full Stack Developer Assessment',
      duration: 90,
      sections: {
        objective: [
          {
            id: 'obj-1',
            type: 'objective',
            text: 'What is the primary purpose of React hooks?',
            options: [
              'To replace class components',
              'To add state and lifecycle to functional components',
              'To improve performance',
              'To enable routing'
            ],
            correctAnswer: 'To add state and lifecycle to functional components',
            skill: 'React',
            difficulty: 'Medium',
            points: 10
          },
          {
            id: 'obj-2',
            type: 'objective',
            text: 'Which of the following is NOT a valid HTTP method?',
            options: ['GET', 'POST', 'FETCH', 'DELETE'],
            correctAnswer: 'FETCH',
            skill: 'REST APIs',
            difficulty: 'Easy',
            points: 5
          },
          {
            id: 'obj-3',
            type: 'objective',
            text: 'What is the time complexity of binary search?',
            options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
            correctAnswer: 'O(log n)',
            skill: 'Data Structures',
            difficulty: 'Medium',
            points: 10
          }
        ],
        subjective: [
          {
            id: 'sub-1',
            type: 'subjective',
            text: 'Explain the difference between authentication and authorization in web applications. Provide examples.',
            skill: 'Security',
            difficulty: 'Medium',
            maxWords: 200,
            points: 20
          },
          {
            id: 'sub-2',
            type: 'subjective',
            text: 'Describe the benefits and drawbacks of microservices architecture compared to monolithic architecture.',
            skill: 'System Design',
            difficulty: 'Hard',
            maxWords: 250,
            points: 25
          }
        ],
        coding: [
          {
            id: 'code-1',
            type: 'coding',
            text: 'Implement a function to debounce API calls in JavaScript. The function should accept a callback and a delay time.',
            skill: 'JavaScript',
            difficulty: 'Hard',
            language: 'javascript',
            points: 30,
            testCases: [
              { input: 'debounce(fn, 300)', expected: 'Function executes after 300ms delay' }
            ],
            starterCode: `function debounce(func, delay) {\n  // Your code here\n  \n}\n\n// Example usage:\nconst debouncedFn = debounce(() => console.log('Called!'), 300);`
          },
          {
            id: 'code-2',
            type: 'coding',
            text: 'Create a REST API endpoint using Express.js that handles user registration with email and password validation.',
            skill: 'Node.js',
            difficulty: 'Hard',
            language: 'javascript',
            points: 35,
            testCases: [],
            starterCode: `const express = require('express');\nconst app = express();\n\n// Your code here\n\napp.listen(3000);`
          }
        ]
      }
    });
  };

  // ✅ Save progress to backend
  const saveProgress = async () => {
    if (!applicationId || Object.keys(answers).length === 0) return;

    try {
      setAutoSaving(true);
      console.log('💾 Auto-saving progress...', { applicationId, answers });

      await applicationAPI.submitAnswer(applicationId, {
        answers,
        timeRemaining,
        currentSection,
        currentQuestionIndex
      });

      console.log('✅ Progress saved successfully');
    } catch (err: any) {
      console.error('❌ Save progress error:', err);
      // Don't show error to user for auto-save failures
    } finally {
      setAutoSaving(false);
    }
  };

  // ✅ Run code in backend
  const handleRunCode = async () => {
    const currentQuestion = getCurrentQuestion();
    const code = answers[currentQuestion.id] || currentQuestion.starterCode || '';

    if (!code.trim()) {
      alert('Please write some code first');
      return;
    }

    try {
      setRunningCode(true);
      setCodeOutput(null);
      console.log('▶️ Running code...', { language: currentQuestion.language, code });

      const response = await codeExecutionAPI.executeCode({
        code,
        language: currentQuestion.language,
        testCases: currentQuestion.testCases,
        timeLimit: 5000
      });

      const result = response.data.data || response.data;
      setCodeOutput(result);
      console.log('✅ Code executed:', result);

    } catch (err: any) {
      console.error('❌ Code execution error:', err);
      setCodeOutput({
        success: false,
        error: err.response?.data?.message || 'Code execution failed',
        output: ''
      });
    } finally {
      setRunningCode(false);
    }
  };

  // ✅ Submit assessment
  const handleSubmit = async () => {
    // Validate all questions answered
    const totalQuestions = Object.values(assessment?.sections || {}).flat().length;
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < totalQuestions) {
      const unanswered = totalQuestions - answeredCount;
      if (!confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
        return;
      }
    }

    setShowSubmitModal(false);
    
    try {
      setSubmitting(true);
      console.log('📤 Submitting assessment...', { applicationId, answers });

      await applicationAPI.submitAssessment(applicationId);

      console.log('✅ Assessment submitted successfully');
      alert('Assessment submitted successfully! Good luck! 🎉');
      
      // Navigate to thank you page or results
      navigate('landing');

    } catch (err: any) {
      console.error('❌ Submit error:', err);
      alert(err.response?.data?.message || 'Failed to submit assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Auto-submit when time runs out
  const handleAutoSubmit = async () => {
    console.log('⏰ Time expired - auto-submitting assessment');
    alert('Time is up! Your assessment will be submitted automatically.');
    await handleSubmit();
  };

  // ✅ Helper functions
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentQuestion = () => {
    const sections = assessment?.sections || {};
    const currentQuestions = sections[currentSection] || [];
    return currentQuestions[currentQuestionIndex] || {};
  };

  const goToNextQuestion = () => {
    const sections = assessment?.sections || {};
    const currentQuestions = sections[currentSection] || [];
    
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Move to next section
      const sectionKeys = Object.keys(sections);
      const currentSectionIdx = sectionKeys.indexOf(currentSection);
      
      if (currentSectionIdx < sectionKeys.length - 1) {
        setCurrentSection(sectionKeys[currentSectionIdx + 1]);
        setCurrentQuestionIndex(0);
      }
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      // Move to previous section
      const sectionKeys = Object.keys(assessment?.sections || {});
      const currentSectionIdx = sectionKeys.indexOf(currentSection);
      
      if (currentSectionIdx > 0) {
        const prevSection = sectionKeys[currentSectionIdx - 1];
        setCurrentSection(prevSection);
        setCurrentQuestionIndex(assessment.sections[prevSection].length - 1);
      }
    }
  };

  const isLastQuestion = () => {
    const sectionKeys = Object.keys(assessment?.sections || {});
    const currentSectionIdx = sectionKeys.indexOf(currentSection);
    const currentQuestions = assessment?.sections[currentSection] || [];
    
    return currentSectionIdx === sectionKeys.length - 1 && 
           currentQuestionIndex === currentQuestions.length - 1;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading assessment...</p>
          <p className="text-sm text-slate-500 mt-2">Please wait while we prepare your test</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-slate-900 font-semibold mb-2">Assessment Not Available</p>
          <p className="text-slate-600 mb-4">Unable to load assessment</p>
          <Button onClick={() => navigate('landing')}>Go Back</Button>
        </div>
      </div>
    );
  }

  const sections = assessment?.sections || {};
  const currentQuestion = getCurrentQuestion();
  const totalQuestions = Object.values(sections).flat().length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">{assessment.title}</h1>
                <p className="text-sm text-slate-600">
                  Question {Math.min(answeredCount + 1, totalQuestions)} of {totalQuestions} • 
                  <span className="ml-1">{answeredCount} answered</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Auto-save indicator */}
              {autoSaving && (
                <div className="flex items-center gap-2 text-sm text-indigo-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
              
              {/* Tab switch warning */}
              {tabSwitchCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{tabSwitchCount} tab switches</span>
                </div>
              )}
              
              {/* Timer */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                timeRemaining < 600 
                  ? 'bg-red-100 text-red-700 animate-pulse' 
                  : timeRemaining < 1800
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
              </div>

              {/* Submit Button */}
              <Button
                onClick={() => setShowSubmitModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit
              </Button>
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
              {Object.entries(sections).map(([key, questions]: [string, any]) => {
                const sectionAnswered = questions.filter((q: any) => answers[q.id]).length;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setCurrentSection(key);
                      setCurrentQuestionIndex(0);
                    }}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                      currentSection === key
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {key === 'objective' && <CheckCircle2 className="w-4 h-4" />}
                      {key === 'subjective' && <MessageSquare className="w-4 h-4" />}
                      {key === 'coding' && <Code className="w-4 h-4" />}
                      <span className="capitalize">{key}</span>
                      <Badge 
                        variant="outline" 
                        className={currentSection === key ? 'bg-white/20 text-white border-white/30' : ''}
                      >
                        {sectionAnswered}/{questions.length}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Question Card */}
            {currentQuestion && currentQuestion.id && (
              <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                {/* Question Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="outline" className="text-indigo-600 border-indigo-300">
                        {currentQuestion.skill}
                      </Badge>
                      <Badge className={
                        currentQuestion.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                        currentQuestion.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }>
                        {currentQuestion.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {currentQuestion.points} points
                      </Badge>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 leading-relaxed">
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
                              ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                              : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              answers[currentQuestion.id] === option
                                ? 'border-indigo-600 bg-indigo-600'
                                : 'border-slate-300'
                            }`}>
                              {answers[currentQuestion.id] === option && (
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                              )}
                            </div>
                            <span className="text-slate-900 flex-1">{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Subjective - Text Area */}
                  {currentQuestion.type === 'subjective' && (
                    <div>
                      <textarea
                        placeholder="Type your answer here... Be clear and concise."
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                        className="w-full h-64 p-4 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-slate-500">
                          {(answers[currentQuestion.id] || '').split(' ').filter(Boolean).length} / {currentQuestion.maxWords} words
                        </p>
                        {(answers[currentQuestion.id] || '').split(' ').filter(Boolean).length > currentQuestion.maxWords && (
                          <p className="text-sm text-red-600">
                            ⚠️ Word limit exceeded
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Coding - Code Editor */}
                  {currentQuestion.type === 'coding' && (
                    <div className="space-y-4">
                      <div className="bg-slate-900 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                          <Badge className="bg-slate-700 text-slate-300 border-slate-600">
                            {currentQuestion.language}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-slate-400 hover:text-white hover:bg-slate-700"
                              onClick={() => saveProgress()}
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-emerald-400 hover:text-emerald-300 hover:bg-slate-700"
                              onClick={handleRunCode}
                              disabled={runningCode}
                            >
                              {runningCode ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                  Running...
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-1" />
                                  Run Code
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        <textarea
                          placeholder="// Write your code here..."
                          value={answers[currentQuestion.id] || currentQuestion.starterCode || ''}
                          onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                          className="w-full h-96 p-4 bg-slate-900 text-slate-100 font-mono text-sm border-none focus:outline-none resize-none"
                          style={{ fontFamily: 'Monaco, Consolas, Courier, monospace', tabSize: 2 }}
                          spellCheck={false}
                        />
                      </div>

                      {/* Code Output */}
                      {codeOutput && (
                        <div className={`rounded-lg border-2 p-4 ${
                          codeOutput.success 
                            ? 'bg-emerald-50 border-emerald-300' 
                            : 'bg-red-50 border-red-300'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            {codeOutput.success ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                            )}
                            <h4 className={`font-semibold ${
                              codeOutput.success ? 'text-emerald-900' : 'text-red-900'
                            }`}>
                              {codeOutput.success ? 'Success' : 'Error'}
                            </h4>
                          </div>
                          <pre className={`text-sm font-mono whitespace-pre-wrap ${
                            codeOutput.success ? 'text-emerald-800' : 'text-red-800'
                          }`}>
                            {codeOutput.output || codeOutput.error || 'No output'}
                          </pre>
                          {codeOutput.testResults && (
                            <div className="mt-3 pt-3 border-t border-emerald-200">
                              <p className="text-sm font-medium text-emerald-900 mb-2">
                                Test Results: {codeOutput.testResults.passed}/{codeOutput.testResults.total} passed
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={goToPreviousQuestion}
                disabled={currentSection === Object.keys(sections)[0] && currentQuestionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="text-sm text-slate-600">
                Question {currentQuestionIndex + 1} of {sections[currentSection]?.length || 0}
              </div>

              {!isLastQuestion() ? (
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={goToNextQuestion}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setShowSubmitModal(true)}
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
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600">Completed</span>
                    <span className="font-bold text-slate-900">{answeredCount}/{totalQuestions}</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500"
                      style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {Math.round((answeredCount / totalQuestions) * 100)}% complete
                  </p>
                </div>

                {/* Section Progress */}
                <div className="pt-4 border-t border-slate-200">
                  {Object.entries(sections).map(([key, questions]: [string, any]) => {
                    const sectionAnswered = questions.filter((q: any) => answers[q.id]).length;
                    const percentage = (sectionAnswered / questions.length) * 100;
                    
                    return (
                      <div key={key} className="mb-4 last:mb-0">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <div className="flex items-center gap-2">
                            {key === 'objective' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                            {key === 'subjective' && <MessageSquare className="w-4 h-4 text-emerald-600" />}
                            {key === 'coding' && <Code className="w-4 h-4 text-purple-600" />}
                            <span className="text-slate-700 capitalize font-medium">{key}</span>
                          </div>
                          <span className="text-slate-900 font-semibold">{sectionAnswered}/{questions.length}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              key === 'objective' ? 'bg-indigo-600' :
                              key === 'subjective' ? 'bg-emerald-600' :
                              'bg-purple-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Anti-Cheat Warning */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 text-sm mb-1">Proctored Assessment</h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Your activity is being monitored. Switching tabs, copying, or pasting may be flagged.
                  </p>
                  {tabSwitchCount > 0 && (
                    <p className="text-xs text-amber-900 font-semibold mt-2">
                      ⚠️ {tabSwitchCount} tab switch{tabSwitchCount > 1 ? 'es' : ''} detected
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
              <h4 className="font-semibold text-indigo-900 text-sm mb-2">💡 Tips</h4>
              <ul className="text-xs text-indigo-800 space-y-1">
                <li>• Your progress is auto-saved every 30 seconds</li>
                <li>• You can navigate between questions freely</li>
                <li>• Review your answers before submitting</li>
                <li>• For coding questions, test your code before moving on</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Submit Assessment?</h3>
              <p className="text-slate-600">
                You have answered <strong>{answeredCount} out of {totalQuestions}</strong> questions.
              </p>
              {answeredCount < totalQuestions && (
                <p className="text-amber-600 text-sm mt-2">
                  ⚠️ {totalQuestions - answeredCount} question{totalQuestions - answeredCount > 1 ? 's' : ''} unanswered
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-lg"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Yes, Submit Now
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full py-6 text-lg"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </Button>
            </div>

            <p className="text-xs text-center text-slate-500 mt-4">
              Once submitted, you cannot make any changes
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
