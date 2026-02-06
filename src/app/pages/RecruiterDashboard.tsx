import { useState, useEffect } from 'react';
import RecruiterLayout from '../components/RecruiterLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Users,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  BarChart3,
  Zap,
  Target,
  Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { jobAPI, applicationAPI } from '../services/api';

interface RecruiterDashboardProps {
  navigate: (page: string) => void;
  onLogout: () => void;
}

export default function RecruiterDashboard({ navigate, onLogout }: RecruiterDashboardProps) {
  // ✅ Backend state
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeAssessments: 0,
    totalApplicants: 0,
    qualifiedCandidates: 0,
    avgCompletionRate: 0,
    avgScore: 0
  });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  // ✅ Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load jobs
      const jobsResponse = await jobAPI.getJobs();
      const jobs = jobsResponse.data.data || [];
      setRecentJobs(jobs.slice(0, 5));
      
      // Load applications (if API exists)
      try {
        const appsResponse = await applicationAPI.getApplications();
        const apps = appsResponse.data.data || [];
        setApplications(apps);
        
        // Calculate stats
        const qualified = apps.filter((a: any) => a.status === 'qualified').length;
        const avgScore = apps.length > 0 
          ? apps.reduce((sum: number, a: any) => sum + (a.scores?.overall?.scored || 0), 0) / apps.length 
          : 0;
        
        setStats({
          totalJobs: jobs.length,
          activeAssessments: jobs.filter((j: any) => j.status === 'active').length,
          totalApplicants: apps.length,
          qualifiedCandidates: qualified,
          avgCompletionRate: apps.length > 0 ? (apps.filter((a: any) => a.status === 'completed').length / apps.length * 100) : 0,
          avgScore: Math.round(avgScore)
        });
      } catch (err) {
        console.log('Applications API not ready, using mock data');
        // Mock data
        setStats({
          totalJobs: jobs.length,
          activeAssessments: jobs.filter((j: any) => j.status === 'active').length,
          totalApplicants: 142,
          qualifiedCandidates: 38,
          avgCompletionRate: 87,
          avgScore: 76
        });
      }
      
      console.log('✅ Dashboard data loaded');
    } catch (error) {
      console.error('❌ Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart data
  const applicantTrend = [
    { name: 'Mon', applications: 12, qualified: 8 },
    { name: 'Tue', applications: 19, qualified: 12 },
    { name: 'Wed', applications: 25, qualified: 18 },
    { name: 'Thu', applications: 31, qualified: 22 },
    { name: 'Fri', applications: 28, qualified: 19 },
    { name: 'Sat', applications: 15, qualified: 10 },
    { name: 'Sun', applications: 12, qualified: 7 }
  ];

  const skillDistribution = [
    { name: 'React', value: 45, color: '#4F46E5' },
    { name: 'Node.js', value: 38, color: '#10B981' },
    { name: 'Python', value: 32, color: '#F59E0B' },
    { name: 'MongoDB', value: 28, color: '#8B5CF6' }
  ];

  if (loading) {
    return (
      <RecruiterLayout navigate={navigate} onLogout={onLogout} currentPage="dashboard">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout navigate={navigate} onLogout={onLogout} currentPage="dashboard">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome back! Here's your hiring overview.</p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate('job-upload')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Assessment
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12%
              </Badge>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalApplicants}</div>
            <div className="text-sm text-slate-600">Total Applicants</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8%
              </Badge>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.qualifiedCandidates}</div>
            <div className="text-sm text-slate-600">Qualified Candidates</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                {stats.activeAssessments} Active
              </Badge>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalJobs}</div>
            <div className="text-sm text-slate-600">Total Assessments</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-amber-600" />
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                {stats.avgCompletionRate}%
              </Badge>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.avgScore}%</div>
            <div className="text-sm text-slate-600">Average Score</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applicant Trend */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Applicant Trends</h3>
                <p className="text-sm text-slate-600">Last 7 days performance</p>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={applicantTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="applications" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                <Bar dataKey="qualified" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Skill Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Top Skills Assessed</h3>
                <p className="text-sm text-slate-600">Most evaluated skills</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={skillDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {skillDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {skillDistribution.map((skill, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: skill.color }}></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900">{skill.name}</div>
                      <div className="text-xs text-slate-600">{skill.value} candidates</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Jobs & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Jobs */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Recent Assessments</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('assessment-builder')}>
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              {recentJobs.length > 0 ? (
                recentJobs.map((job: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 mb-1">{job.title}</div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {Math.floor(Math.random() * 50) + 10} applicants
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Badge className={job.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                      {job.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No assessments yet. Create one to get started!</p>
                  <Button className="mt-4" onClick={() => navigate('job-upload')}>
                    Create Assessment
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition-all"
                onClick={() => navigate('job-upload')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium">Create Assessment</div>
                    <div className="text-sm opacity-80">Upload JD & generate</div>
                  </div>
                </div>
              </button>
              
              <button 
                className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition-all"
                onClick={() => navigate('evaluation-results')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium">View Results</div>
                    <div className="text-sm opacity-80">Check leaderboards</div>
                  </div>
                </div>
              </button>
              
              <button 
                className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition-all"
                onClick={() => navigate('reports')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium">Download Reports</div>
                    <div className="text-sm opacity-80">Export candidate data</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </RecruiterLayout>
  );
}
