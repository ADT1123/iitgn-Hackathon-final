import React, { useState, useEffect } from 'react';
import { publicAssessmentAPI } from '@/services/api';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

export const TakeAssessmentPage: React.FC = () => {
  const { link } = useParams();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [candidateInfo, setCandidateInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (link) loadAssessment();
  }, [link]);

  useEffect(() => {
    if (started && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [started, timeLeft]);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      const response = await publicAssessmentAPI.getByLink(link!);
      setAssessment(response.data.data);
      setTimeLeft(response.data.data.duration * 60);
    } catch (error) {
      console.error('Failed to load assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (!candidateInfo.name || !candidateInfo.email) {
      alert('Please fill in your name and email');
      return;
    }
    setStarted(true);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: { questionId, answer, timeTaken: 0 }
    });
  };

  const handleSubmit = async () => {
    try {
      const answerArray = Object.values(answers);
      const response = await publicAssessmentAPI.submit(link!, {
        candidateName: candidateInfo.name,
        candidateEmail: candidateInfo.email,
        phone: candidateInfo.phone,
        answers: answerArray
      });

      setResult(response.data.data);
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('Failed to submit assessment');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading assessment...</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-center text-slate-900 mb-2">
            Assessment Not Found
          </h2>
          <p className="text-center text-slate-600">
            This assessment link is invalid or has expired.
          </p>
        </Card>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-4">
            Assessment Submitted Successfully
          </h2>
          
          <div className="text-center mb-6">
            <p className="text-5xl font-bold text-blue-600 mb-2">{result.totalScore}%</p>
            <p className="text-slate-600">{result.feedback}</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Status:</span>
              <span className="font-semibold text-slate-900 capitalize">{result.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Application ID:</span>
              <span className="font-mono text-sm text-slate-900">{result.applicationId}</span>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            We will contact you via email with the next steps.
          </p>
        </Card>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{assessment.title}</h1>
          <p className="text-slate-600 mb-6">
            {assessment.job?.title} - {assessment.job?.department}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600 mb-1">Questions</p>
              <p className="text-2xl font-bold text-slate-900">{assessment.totalQuestions}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600 mb-1">Duration</p>
              <p className="text-2xl font-bold text-slate-900">{assessment.duration} min</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600 mb-1">Passing Score</p>
              <p className="text-2xl font-bold text-slate-900">{assessment.passingScore}%</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={candidateInfo.name}
                onChange={(e) => setCandidateInfo({ ...candidateInfo, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                value={candidateInfo.email}
                onChange={(e) => setCandidateInfo({ ...candidateInfo, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input
                type="tel"
                value={candidateInfo.phone}
                onChange={(e) => setCandidateInfo({ ...candidateInfo, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Read each question carefully</li>
              <li>Answer all questions</li>
              <li>Timer will start once you begin</li>
              <li>Assessment will auto-submit when time expires</li>
            </ul>
          </div>

          <Button onClick={handleStart} className="w-full">
            Start Assessment
          </Button>
        </Card>
      </div>
    );
  }

  const question = assessment.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Timer */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Question {currentQuestion + 1} of {assessment.totalQuestions}</p>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${((currentQuestion + 1) / assessment.totalQuestions) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="w-5 h-5 text-red-500" />
              <span className={timeLeft < 300 ? 'text-red-500' : 'text-slate-900'}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </Card>

        {/* Question */}
        <Card>
          <div className="mb-4">
            <span className="text-sm text-slate-600 font-medium">{question.type.toUpperCase()}</span>
            <h2 className="text-xl font-semibold text-slate-900 mt-2">{question.question}</h2>
          </div>

          {question.type === 'objective' && (
            <div className="space-y-3">
              {question.options.map((option: string, idx: number) => (
                <label
                  key={idx}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    answers[question._id]?.answer === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={question._id}
                    value={option}
                    checked={answers[question._id]?.answer === option}
                    onChange={() => handleAnswer(question._id, option)}
                    className="mr-3"
                  />
                  {option}
                </label>
              ))}
            </div>
          )}

          {question.type === 'subjective' && (
            <textarea
              value={answers[question._id]?.answer || ''}
              onChange={(e) => handleAnswer(question._id, e.target.value)}
              className="w-full h-48 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your answer here..."
            />
          )}

          {question.type === 'coding' && (
            <textarea
              value={answers[question._id]?.answer || ''}
              onChange={(e) => handleAnswer(question._id, e.target.value)}
              className="w-full h-64 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="// Write your code here..."
            />
          )}

          <div className="flex justify-between mt-6">
            <Button
              variant="secondary"
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            {currentQuestion === assessment.totalQuestions - 1 ? (
              <Button onClick={handleSubmit}>
                Submit Assessment
              </Button>
            ) : (
              <Button onClick={() => setCurrentQuestion(prev => prev + 1)}>
                Next Question
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
