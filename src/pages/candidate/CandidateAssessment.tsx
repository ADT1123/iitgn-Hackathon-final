// src/pages/candidate/CandidateAssessment.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { applicationAPI } from '@/services/api';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  FileText,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  Timer,
  Info,
  ChevronRight,
  ChevronLeft,
  Rocket,
  Zap
} from 'lucide-react';
import { toast } from '@/components/ui/toaster';

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
      const response = await applicationAPI.startAssessment(assessmentId!);
      const data = response.data.data;

      setAssessment({
        _id: assessmentId,
        title: data.jobTitle || 'Assessment',
        questions: data.questions,
        duration: data.duration
      });
      setApplicationId(data.applicationId);

      if (data.startedAt) {
        const startTime = new Date(data.startedAt).getTime();
        const now = new Date().getTime();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const remaining = (data.duration * 60) - elapsedSeconds;

        if (remaining > 0) {
          setTimeRemaining(remaining);
          setStarted(true);
        } else {
          toast.error('Time has expired for this assessment.');
          navigate('/candidate/applications');
        }
      } else {
        setTimeRemaining(data.duration * 60);
      }
    } catch (error: any) {
      console.error('Failed to load assessment:', error);
      toast.error('Failed to load assessment. Please try again.');
      navigate('/candidate/jobs');
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

  const formatPayload = (question: any, answer: any) => {
    if (question.type === 'objective') {
      return { selectedOption: question.options.findIndex((o: any) => o.text === answer) };
    } else if (question.type === 'coding') {
      return { code: answer, language: 'javascript' };
    } else {
      return { textAnswer: answer };
    }
  };

  const handleNext = async () => {
    const currentQ = assessment.questions[currentQuestionIndex];
    const currentAns = answers[currentQ._id];

    if (currentAns && applicationId) {
      try {
        await applicationAPI.submitAnswer(applicationId, {
          questionId: currentQ._id,
          type: currentQ.type === 'mcq' ? 'objective' : currentQ.type,
          answer: formatPayload(currentQ, currentAns),
          timeSpent: 0
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
      const currentQ = assessment.questions[currentQuestionIndex];
      const currentAns = answers[currentQ._id];
      if (currentAns) {
        await applicationAPI.submitAnswer(applicationId, {
          questionId: currentQ._id,
          type: currentQ.type === 'mcq' ? 'objective' : currentQ.type,
          answer: formatPayload(currentQ, currentAns)
        });
      }

      await applicationAPI.submitApplication(applicationId, {});
      toast.success('Assessment submitted successfully! Good luck!');
      navigate('/candidate/applications');
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      toast.error('Failed to submit assessment. Please check your connection.');
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Preparing your assessment...</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <Card className="max-w-md mx-auto mt-20 text-center p-8 border-slate-200">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Assessment Not Found</h2>
        <p className="text-slate-500 mb-6 text-sm">We couldn't find the assessment you're looking for. It might have been closed or moved.</p>
        <Button
          variant="secondary"
          className="w-full rounded-xl font-bold uppercase tracking-tight"
          onClick={() => navigate('/candidate/jobs')}
        >
          Back to Careers
        </Button>
      </Card>
    );
  }

  if (!started) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pt-8 pb-12">
        <Card className="p-8 border-slate-200 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

          <div className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-inner">
                <Rocket className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <Badge variant="info" className="mb-2 bg-blue-50 text-blue-700 border-blue-100 font-black text-[10px] uppercase tracking-widest px-3">Official Assessment</Badge>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{assessment.title}</h1>
                <p className="text-slate-500 mt-2 font-medium max-w-lg mx-auto">Ready to showcase your skills? Review the instructions carefully before launching your session.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-slate-100">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                <FileText className="w-5 h-5 text-slate-400 mb-2" />
                <p className="text-xl font-black text-slate-900 leading-tight">{assessment.questions?.length || 0}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Total Questions</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                <Timer className="w-5 h-5 text-slate-400 mb-2" />
                <p className="text-xl font-black text-slate-900 leading-tight">{assessment.duration}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Minutes Limit</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                <Zap className="w-5 h-5 text-slate-400 mb-2" />
                <p className="text-xl font-black text-slate-900 leading-tight">70%</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Target Score</p>
              </div>
            </div>

            <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 space-y-4">
              <div className="flex items-center gap-2 text-amber-700">
                <Info className="w-4 h-4" />
                <h3 className="font-black text-xs uppercase tracking-widest">Ground Rules & Instructions</h3>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                {[
                  'Assessments are timed and cannot be paused.',
                  'Avoid switching tabs or windows during session.',
                  'Answers are auto-saved upon navigation.',
                  'Ensure stable internet before starting.',
                  'Final submission is required before time ends.',
                  'AI proctoring is active for this session.'
                ].map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] font-bold text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full rounded-2xl font-black uppercase tracking-widest text-sm h-14 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
              onClick={handleStart}
            >
              Initialize Assessment
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-8 pb-20 px-4">
      {/* Timer & Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-4 z-20 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white shadow-xl shadow-slate-200/50">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progress Journey</span>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
              Question {currentQuestionIndex + 1} / {assessment.questions.length}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl font-black text-lg transition-colors ${timeRemaining < 300 ? 'bg-red-50 text-red-600 border border-red-100 animate-pulse' : 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
          }`}>
          <Timer className={`w-5 h-5 ${timeRemaining < 300 ? 'text-red-500' : 'text-blue-400'}`} />
          <span className="font-mono tabular-nums">{formatTime(timeRemaining)}</span>
        </div>
      </header>

      {/* Question Card */}
      <Card className="p-8 border-slate-200 shadow-sm min-h-[400px] flex flex-col">
        <div className="space-y-8 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <Badge variant="info" className="bg-slate-900 text-white rounded-lg border-0 font-black text-[9px] uppercase tracking-widest px-2.5 py-1">
                {currentQuestion.type} Focus
              </Badge>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {currentQuestion.question}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-slate-300" />
            </div>
          </div>

          <div className="space-y-4">
            {(currentQuestion.type === 'objective' || currentQuestion.type === 'mcq') && (
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option: any, idx: number) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${answers[currentQuestion._id] === option.text
                      ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-500/5'
                      : 'border-slate-100 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${answers[currentQuestion._id] === option.text ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                      {answers[currentQuestion._id] === option.text && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <input
                      type="radio"
                      name={`question-${currentQuestion._id}`}
                      value={option.text}
                      checked={answers[currentQuestion._id] === option.text}
                      onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                      className="hidden"
                    />
                    <span className={`text-[15px] font-bold ${answers[currentQuestion._id] === option.text ? 'text-blue-900' : 'text-slate-600'}`}>
                      {option.text}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'subjective' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type your detailed response</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{(answers[currentQuestion._id] || '').length} characters</span>
                </div>
                <textarea
                  value={answers[currentQuestion._id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                  placeholder="Explain your approach or solution in detail here..."
                  className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 min-h-[250px] font-medium text-slate-700 transition-all resize-none"
                />
              </div>
            )}

            {(currentQuestion.type === 'coding' || currentQuestion.type === 'programming') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Write clean functional code</span>
                  <Badge variant="info" className="font-black text-[9px] uppercase tracking-tighter">JavaScript / Python</Badge>
                </div>
                <div className="rounded-2xl border-2 border-slate-100 overflow-hidden bg-slate-900 shadow-2xl">
                  <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  </div>
                  <textarea
                    value={answers[currentQuestion._id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                    placeholder="// Write your code here..."
                    className="w-full p-6 bg-transparent text-emerald-400 focus:outline-none font-mono text-[13px] min-h-[350px] transition-all resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-100">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="rounded-xl font-black uppercase tracking-widest text-[10px] px-6 h-12 text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-3">
            {currentQuestionIndex === assessment.questions.length - 1 ? (
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={submitting}
                className="rounded-xl font-black uppercase tracking-widest text-[10px] px-8 h-12 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
              >
                <Send className="w-4 h-4 mr-2" />
                Finish & Submit
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleNext}
                className="rounded-xl font-black uppercase tracking-widest text-[10px] px-8 h-12 bg-slate-900 hover:bg-black shadow-lg shadow-slate-900/10"
              >
                Save & Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      <footer className="text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Candidate ID: {applicationId?.substring(0, 8).toUpperCase()}</p>
      </footer>
    </div>
  );
};
