import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import {
  Target,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Save,
  AlertCircle,
  Code
} from 'lucide-react';
import { UserRole } from '../App';

interface CandidateAssessmentPageProps {
  navigate: (page: string) => void;
  onLogout: () => void;
  userRole: UserRole;
}

export default function CandidateAssessmentPage({ navigate, onLogout, userRole }: CandidateAssessmentPageProps) {
  const [currentSection, setCurrentSection] = useState<'objective' | 'subjective' | 'coding'>('objective');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(5400); // 90 minutes in seconds
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [codeAnswer, setCodeAnswer] = useState('');

  const objectiveQuestions = [
    {
      id: 1,
      text: 'What is the primary purpose of React hooks?',
      options: [
        'To replace class components entirely',
        'To manage state and side effects in functional components',
        'To improve performance by 50%',
        'To add CSS styling to components'
      ],
      skill: 'React'
    },
    {
      id: 2,
      text: 'Which of the following is NOT a valid HTTP method?',
      options: ['GET', 'POST', 'FETCH', 'DELETE'],
      skill: 'REST APIs'
    },
    {
      id: 3,
      text: 'What is the time complexity of searching in a balanced binary search tree?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      skill: 'Data Structures'
    },
  ];

  const subjectiveQuestions = [
    {
      id: 4,
      text: 'Explain the difference between authentication and authorization in web applications. Provide examples of when each is used.',
      skill: 'Security',
      minWords: 50
    },
    {
      id: 5,
      text: 'Describe your approach to optimizing database queries in a production environment. What tools and techniques would you use?',
      skill: 'MongoDB',
      minWords: 75
    },
  ];

  const codingQuestions = [
    {
      id: 6,
      text: 'Implement a function to debounce API calls in JavaScript.',
      description: 'Write a debounce function that delays invoking a function until after a specified wait time has elapsed since the last time it was invoked.',
      skill: 'JavaScript',
      starterCode: 'function debounce(func, wait) {\n  // Your code here\n}'
    },
    {
      id: 7,
      text: 'Create a REST API endpoint to handle user authentication.',
      description: 'Implement a POST endpoint that accepts email and password, validates credentials, and returns a JWT token.',
      skill: 'Node.js',
      starterCode: 'app.post(\'/api/auth/login\', async (req, res) => {\n  // Your code here\n});'
    },
  ];

  const getCurrentQuestion = () => {
    if (currentSection === 'objective') {
      return objectiveQuestions[currentQuestionIndex];
    } else if (currentSection === 'subjective') {
      return subjectiveQuestions[currentQuestionIndex];
    } else {
      return codingQuestions[currentQuestionIndex];
    }
  };

  const getTotalQuestions = () => {
    if (currentSection === 'objective') return objectiveQuestions.length;
    if (currentSection === 'subjective') return subjectiveQuestions.length;
    return codingQuestions.length;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentQuestionIndex + 1) / getTotalQuestions()) * 100;
  const currentQuestion = getCurrentQuestion();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900">Senior Full Stack Developer Assessment</h1>
              <p className="text-sm text-slate-600">Section: {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5 text-slate-600" />
              <span className="font-mono font-semibold text-slate-900">{formatTime(timeRemaining)}</span>
            </div>
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              Auto-saving
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-slate-600">Question {currentQuestionIndex + 1} of {getTotalQuestions()}</span>
            <span className="text-slate-600">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Section Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => {
                setCurrentSection('objective');
                setCurrentQuestionIndex(0);
              }}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                currentSection === 'objective'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Objective ({objectiveQuestions.length})
            </button>
            <button
              onClick={() => {
                setCurrentSection('subjective');
                setCurrentQuestionIndex(0);
              }}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                currentSection === 'subjective'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Subjective ({subjectiveQuestions.length})
            </button>
            <button
              onClick={() => {
                setCurrentSection('coding');
                setCurrentQuestionIndex(0);
              }}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                currentSection === 'coding'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Coding ({codingQuestions.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-6">
          {/* Question Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-semibold flex-shrink-0">
                {currentQuestionIndex + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    {currentQuestion.skill}
                  </span>
                  <span className="text-xs text-slate-500">• Required</span>
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  {currentQuestion.text}
                </h2>

                {/* Objective - Multiple Choice */}
                {currentSection === 'objective' && 'options' in currentQuestion && (
                  <div className="space-y-3 mt-6">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedAnswer(option)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedAnswer === option
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {selectedAnswer === option ? (
                            <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          )}
                          <span className="text-slate-900">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Subjective - Text Answer */}
                {currentSection === 'subjective' && (
                  <div className="mt-6">
                    {'minWords' in currentQuestion && (
                      <p className="text-sm text-slate-600 mb-3">
                        Minimum {currentQuestion.minWords} words required
                      </p>
                    )}
                    <Textarea
                      placeholder="Type your answer here..."
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      className="min-h-[300px] text-base"
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      {textAnswer.split(/\s+/).filter(w => w.length > 0).length} words
                    </p>
                  </div>
                )}

                {/* Coding - Code Editor */}
                {currentSection === 'coding' && (
                  <div className="mt-6">
                    {'description' in currentQuestion && (
                      <p className="text-slate-600 mb-4">{currentQuestion.description}</p>
                    )}
                    <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-300">solution.js</span>
                        </div>
                        <select className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded border-none">
                          <option>JavaScript</option>
                          <option>Python</option>
                          <option>Java</option>
                        </select>
                      </div>
                      <Textarea
                        value={codeAnswer || ('starterCode' in currentQuestion ? currentQuestion.starterCode : '')}
                        onChange={(e) => setCodeAnswer(e.target.value)}
                        className="min-h-[400px] bg-slate-900 text-slate-100 font-mono text-sm border-none focus:ring-0 resize-none"
                        placeholder="// Write your code here..."
                      />
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <Button variant="outline" size="sm">
                        Run Tests
                      </Button>
                      <span className="text-sm text-slate-600">All test cases will run on submission</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: getTotalQuestions() }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            {currentQuestionIndex < getTotalQuestions() - 1 ? (
              <Button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Submit Section
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Anti-cheat Notice */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900 mb-1">Assessment Monitoring Active</p>
              <p className="text-xs text-amber-800">
                This assessment tracks time spent on each question and monitors for unusual patterns. 
                Please ensure you complete all questions honestly.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
