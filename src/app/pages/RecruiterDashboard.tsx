import RecruiterLayout from '../components/RecruiterLayout';
import { Button } from '../components/ui/button';
import {
  Users,
  CheckCircle2,
  ClipboardCheck,
  TrendingUp,
  Upload,
  Plus,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RecruiterDashboardProps {
  navigate: (page: string) => void;
  onLogout: () => void;
}

export default function RecruiterDashboard({ navigate, onLogout }: RecruiterDashboardProps) {
  // Mock data
  const applicantTrendData = [
    { month: 'Jan', applicants: 45, qualified: 28 },
    { month: 'Feb', applicants: 52, qualified: 35 },
    { month: 'Mar', applicants: 61, qualified: 42 },
    { month: 'Apr', applicants: 58, qualified: 38 },
    { month: 'May', applicants: 73, qualified: 51 },
    { month: 'Jun', applicants: 82, qualified: 59 },
  ];

  const skillDistribution = [
    { skill: 'JavaScript', count: 45 },
    { skill: 'Python', count: 38 },
    { skill: 'React', count: 32 },
    { skill: 'Node.js', count: 28 },
    { skill: 'SQL', count: 25 },
  ];

  const completionData = [
    { name: 'Completed', value: 78, color: '#10B981' },
    { name: 'In Progress', value: 15, color: '#F59E0B' },
    { name: 'Abandoned', value: 7, color: '#EF4444' },
  ];

  const recentAssessments = [
    { id: 1, title: 'Senior Frontend Developer', candidates: 24, qualified: 12, status: 'Active' },
    { id: 2, title: 'Full Stack Engineer', candidates: 18, qualified: 9, status: 'Active' },
    { id: 3, title: 'Backend Developer', candidates: 31, qualified: 15, status: 'Completed' },
    { id: 4, title: 'DevOps Engineer', candidates: 15, qualified: 7, status: 'Active' },
  ];

  return (
    <RecruiterLayout navigate={navigate} onLogout={onLogout} currentPage="dashboard">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome back! Here's your hiring overview</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('job-upload')}>
              <Upload className="w-4 h-4 mr-2" />
              Upload JD
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate('assessment-builder')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Assessment
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Applicants */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
                12%
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">342</div>
            <div className="text-sm text-slate-600">Total Applicants</div>
          </div>

          {/* Qualified Candidates */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
                8%
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">189</div>
            <div className="text-sm text-slate-600">Qualified Candidates</div>
          </div>

          {/* Active Assessments */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex items-center gap-1 text-slate-600 text-sm font-medium">
                —
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">12</div>
            <div className="text-sm text-slate-600">Active Assessments</div>
          </div>

          {/* Avg Completion Rate */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                <ArrowDownRight className="w-4 h-4" />
                3%
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">78%</div>
            <div className="text-sm text-slate-600">Avg Completion Rate</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applicants vs Qualified */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Applicants vs Qualified</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={applicantTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="applicants" stroke="#4F46E5" strokeWidth={2} name="Applicants" />
                <Line type="monotone" dataKey="qualified" stroke="#10B981" strokeWidth={2} name="Qualified" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Completion Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Assessment Completion</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={250}>
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {completionData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{item.name}</div>
                      <div className="text-sm text-slate-600">{item.value}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Skill Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Skills in Demand</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="skill" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#4F46E5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Assessments */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Assessments</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('assessment-builder')}>
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-indigo-200 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => navigate('evaluation-results')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{assessment.title}</div>
                    <div className="text-sm text-slate-600">
                      {assessment.candidates} candidates · {assessment.qualified} qualified
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      assessment.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {assessment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('job-upload')}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-sm transition-all text-left"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-indigo-600" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">Upload Job Description</h4>
            <p className="text-sm text-slate-600">Let AI parse requirements and generate assessments</p>
          </button>

          <button
            onClick={() => navigate('evaluation-results')}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:border-emerald-300 hover:shadow-sm transition-all text-left"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">Review Candidates</h4>
            <p className="text-sm text-slate-600">View rankings, scores, and detailed analytics</p>
          </button>

          <button
            onClick={() => navigate('reports')}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:border-amber-300 hover:shadow-sm transition-all text-left"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">Generate Reports</h4>
            <p className="text-sm text-slate-600">Export data and integrate with your ATS</p>
          </button>
        </div>
      </div>
    </RecruiterLayout>
  );
}
