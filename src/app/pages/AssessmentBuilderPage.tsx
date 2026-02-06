import { useState } from 'react';
import RecruiterLayout from '../components/RecruiterLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Slider } from '../components/ui/slider';
import { Badge } from '../components/ui/badge';
import {
  Settings,
  Play,
  Save,
  Edit2,
  Trash2,
  Plus,
  Code,
  FileText,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface AssessmentBuilderPageProps {
  navigate: (page: string) => void;
  onLogout: () => void;
}

interface Question {
  id: number;
  type: 'objective' | 'subjective' | 'coding';
  text: string;
  skill: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export default function AssessmentBuilderPage({ navigate, onLogout }: AssessmentBuilderPageProps) {
  const [assessmentTitle, setAssessmentTitle] = useState('Senior Full Stack Developer Assessment');
  const [duration, setDuration] = useState(90);
  const [objectiveWeight, setObjectiveWeight] = useState([40]);
  const [subjectiveWeight, setSubjectiveWeight] = useState([30]);
  const [codingWeight, setCodingWeight] = useState([30]);

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      type: 'objective',
      text: 'What is the primary purpose of React hooks?',
      skill: 'React',
      difficulty: 'Medium'
    },
    {
      id: 2,
      type: 'objective',
      text: 'Which of the following is NOT a valid HTTP method?',
      skill: 'REST APIs',
      difficulty: 'Easy'
    },
    {
      id: 3,
      type: 'subjective',
      text: 'Explain the difference between authentication and authorization in web applications.',
      skill: 'Security',
      difficulty: 'Medium'
    },
    {
      id: 4,
      type: 'coding',
      text: 'Implement a function to debounce API calls in JavaScript.',
      skill: 'JavaScript',
      difficulty: 'Hard'
    },
    {
      id: 5,
      type: 'objective',
      text: 'What is the time complexity of searching in a balanced binary search tree?',
      skill: 'Data Structures',
      difficulty: 'Medium'
    },
    {
      id: 6,
      type: 'coding',
      text: 'Create a REST API endpoint to handle user authentication.',
      skill: 'Node.js',
      difficulty: 'Hard'
    },
    {
      id: 7,
      type: 'subjective',
      text: 'Describe your approach to optimizing database queries in a production environment.',
      skill: 'MongoDB',
      difficulty: 'Hard'
    },
    {
      id: 8,
      type: 'objective',
      text: 'Which design pattern is most suitable for managing global state in React?',
      skill: 'React',
      difficulty: 'Medium'
    },
  ]);

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'objective':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'subjective':
        return <MessageSquare className="w-4 h-4" />;
      case 'coding':
        return <Code className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-emerald-100 text-emerald-700';
      case 'Medium':
        return 'bg-amber-100 text-amber-700';
      case 'Hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const objectiveQuestions = questions.filter(q => q.type === 'objective');
  const subjectiveQuestions = questions.filter(q => q.type === 'subjective');
  const codingQuestions = questions.filter(q => q.type === 'coding');

  return (
    <RecruiterLayout navigate={navigate} onLogout={onLogout} currentPage="assessment-builder">
      <div className="flex h-full">
        {/* Left Panel - Configuration */}
        <div className="w-80 bg-white border-r border-slate-200 p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Assessment Settings</h2>

          {/* Assessment Title */}
          <div className="mb-6">
            <label className="text-sm font-medium text-slate-700 mb-2 block">Assessment Title</label>
            <Input
              value={assessmentTitle}
              onChange={(e) => setAssessmentTitle(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Duration */}
          <div className="mb-6">
            <label className="text-sm font-medium text-slate-700 mb-2 block">Duration (minutes)</label>
            <div className="flex items-center gap-3">
              <Slider
                value={[duration]}
                onValueChange={(value) => setDuration(value[0])}
                min={30}
                max={180}
                step={15}
                className="flex-1"
              />
              <span className="text-sm font-medium text-slate-900 w-12 text-right">{duration}m</span>
            </div>
          </div>

          {/* Section Weights */}
          <div className="space-y-6 mb-6">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Section Weightage
            </h3>

            {/* Objective */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Objective</label>
                <span className="text-sm font-semibold text-indigo-600">{objectiveWeight[0]}%</span>
              </div>
              <Slider
                value={objectiveWeight}
                onValueChange={setObjectiveWeight}
                max={100}
                step={5}
                className="mb-1"
              />
              <p className="text-xs text-slate-500">{objectiveQuestions.length} questions</p>
            </div>

            {/* Subjective */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Subjective</label>
                <span className="text-sm font-semibold text-emerald-600">{subjectiveWeight[0]}%</span>
              </div>
              <Slider
                value={subjectiveWeight}
                onValueChange={setSubjectiveWeight}
                max={100}
                step={5}
                className="mb-1"
              />
              <p className="text-xs text-slate-500">{subjectiveQuestions.length} questions</p>
            </div>

            {/* Coding */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Coding</label>
                <span className="text-sm font-semibold text-purple-600">{codingWeight[0]}%</span>
              </div>
              <Slider
                value={codingWeight}
                onValueChange={setCodingWeight}
                max={100}
                step={5}
                className="mb-1"
              />
              <p className="text-xs text-slate-500">{codingQuestions.length} questions</p>
            </div>

            {/* Total Validation */}
            {objectiveWeight[0] + subjectiveWeight[0] + codingWeight[0] !== 100 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Total weightage should equal 100%
                </p>
              </div>
            )}
          </div>

          {/* Difficulty Distribution */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Difficulty Distribution</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Easy</span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {questions.filter(q => q.difficulty === 'Easy').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Medium</span>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {questions.filter(q => q.difficulty === 'Medium').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Hard</span>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {questions.filter(q => q.difficulty === 'Hard').length}
                </Badge>
              </div>
            </div>
          </div>

          {/* Anti-Cheat Settings */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Anti-Cheat Settings</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                Track time per question
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                Disable copy/paste
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                Randomize questions
              </label>
            </div>
          </div>
        </div>

        {/* Main Panel - Questions */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-slate-900">Assessment Questions</h1>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                  <Button variant="outline" size="sm">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate More
                  </Button>
                </div>
              </div>
              <p className="text-slate-600">Total: {questions.length} questions • {duration} minutes</p>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="bg-white rounded-lg border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Question Number */}
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-semibold text-slate-700 flex-shrink-0">
                      {index + 1}
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              question.type === 'objective'
                                ? 'bg-indigo-100 text-indigo-600'
                                : question.type === 'subjective'
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-purple-100 text-purple-600'
                            }`}
                          >
                            {getQuestionIcon(question.type)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-900 font-medium mb-2">{question.text}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {question.skill}
                            </Badge>
                            <Badge className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                              {question.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {question.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{duration} minutes</span>
          </div>
          <div className="w-px h-4 bg-slate-300"></div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>{questions.length} questions</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button variant="outline" onClick={() => navigate('candidate-assessment')}>
            <Play className="w-4 h-4 mr-2" />
            Preview as Candidate
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Publish Assessment
          </Button>
        </div>
      </div>
    </RecruiterLayout>
  );
}
