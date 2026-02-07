// src/pages/candidate/CandidateAssessment.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { assessmentAPI, applicationAPI } from '@/services/api';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  FileText,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Send
} from 'lucide-react';

export const CandidateAssessment: React.FC = () => {
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (assessmentId) {
      loadAssessment();
    }
  }, [assessmentId]);

  useEffect(() => {
    if (started && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [started, timeRemaining]);

  const loadAssessment = async () => {
    try {
      // Try to start/resume assessment immediately to check status
      const response = await applicationAPI.startAssessment(assessmentId!);
      const data = response.data.data;

      setAssessment({
        _id: assessmentId,
        title: data.jobTitle,
        questions: data.questions,
        timeLimit: data.duration
      });
      setApplicationId(data.applicationId);

      // Calculate remaining time if resuming
      if (data.startedAt) {
        const startTime = new Date(data.startedAt).getTime();
        const now = new Date().getTime();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const remaining = (data.duration * 60) - elapsedSeconds;

        if (remaining > 0) {
          setTimeRemaining(remaining);
          setStarted(true);
        } else {
          // Time expired
          setTimeRemaining(0);
          alert('Time has expired for this assessment.');
          navigate('/candidate/applications');
        }
      } else {
        setTimeRemaining(data.duration * 60);
      }
    } catch (error: any) {
      console.error('Failed to load assessment:', error);
      if (error.response?.status === 400) {
        alert(error.response.data.message);
        navigate('/candidate/applications');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    setStarted(true);
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleNext = async () => {
    // Save current answer before moving next
    const currentQ = assessment.questions[currentQuestionIndex];
    const currentAns = answers[currentQ._id];

    if (currentAns && applicationId) {
      try {
        await applicationAPI.submitAnswer(applicationId, {
          questionId: currentQ._id,
          type: currentQ.type,
          answer: currentAns,
          timeSpent: 0 // Track per-question time if needed
        });
      } catch (err) {
        console.error('Failed to save answer:', err);
      }
    }

    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!applicationId) return;

    try {
      setSubmitting(true);

      // Save last answer
      const currentQ = assessment.questions[currentQuestionIndex];
      const currentAns = answers[currentQ._id];
      if (currentAns) {
        await applicationAPI.submitAnswer(applicationId, {
          questionId: currentQ._id,
          type: currentQ.type,
          answer: currentAns
        });
      }

      await applicationAPI.submitApplication(applicationId, {});

      alert('Assessment submitted successfully!');
      navigate('/candidate/applications');
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      alert('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <Card className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-slate-600">Assessment not found</p>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate('/candidate/jobs')}
        >
          Back to Jobs
        </Button>
      </Card>
    );
  }

  if (!started) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{assessment.title}</h1>
            <p className="text-slate-600">{assessment.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{assessment.questions?.length || 0}</p>
              <p className="text-sm text-slate-600">Questions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{assessment.timeLimit}</p>
              <p className="text-sm text-slate-600">Minutes</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{assessment.passingScore || 70}%</p>
              <p className="text-sm text-slate-600">Passing Score</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-700 space-y-2">
                <p className="font-medium">Instructions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Read each question carefully before answering</li>
                  <li>You can navigate between questions using Next/Previous buttons</li>
                  <li>Timer will start when you click "Start Assessment"</li>
                  <li>Submit your answers before time runs out</li>
                  <li>You cannot pause or restart once started</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full mt-6"
            onClick={handleStart}
          >
            Start Assessment
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Timer & Progress */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Question {currentQuestionIndex + 1} of {assessment.questions.length}</p>
            <div className="w-64 h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
            <Clock className="w-5 h-5" />
            <span className="text-lg font-bold">{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </Card>

      {/* Question */}
      <Card>
        <div className="space-y-6">
          <div>
            <Badge variant="info" className="mb-4">
              {currentQuestion.type}
            </Badge>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              {currentQuestion.question}
            </h2>
            {currentQuestion.description && (
              <p className="text-slate-600">{currentQuestion.description}</p>
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.type === 'mcq' && currentQuestion.options && (
              <div className="space-y-2">
                {currentQuestion.options.map((option: string, idx: number) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${answers[currentQuestion._id] === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion._id}`}
                      value={option}
                      checked={answers[currentQuestion._id] === option}
                      onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-slate-900">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'text' && (
              <textarea
                value={answers[currentQuestion._id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full p-4 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
              />
            )}

            {currentQuestion.type === 'coding' && (
              <div className="space-y-3">
                <textarea
                  value={answers[currentQuestion._id]?.code || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion._id, {
                    ...answers[currentQuestion._id],
                    code: e.target.value
                  })}
                  placeholder="Write your code here..."
                  className="w-full p-4 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm min-h-[200px]"
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {currentQuestionIndex === assessment.questions.length - 1 ? (
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Assessment
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleNext}
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
