import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { jobAPI, assessmentAPI, analyticsAPI } from '@/services/api';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Users,
  BarChart3,
  Loader2,
  Calendar,
  Briefcase,
  MapPin,
  Target,
  Clock,
  ChevronRight,
  Plus,
  Award
} from 'lucide-react';

const StatsCard = ({ label, value, sub, icon: Icon, color }: any) => {
  const colors: any = {
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    indigo: 'text-indigo-600 bg-indigo-50'
  };

  return (
    <Card className="border-slate-100 group hover:border-blue-200 transition-all hover:shadow-lg hover:shadow-blue-500/5">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{sub}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

const ActionButton = ({ icon: Icon, label, color, onClick }: any) => {
  const colors: any = {
    blue: 'text-blue-600 group-hover:bg-blue-50',
    indigo: 'text-indigo-600 group-hover:bg-indigo-50',
    purple: 'text-purple-600 group-hover:bg-purple-50'
  };

  return (
    <button
      className="w-full flex items-center justify-between group p-3 rounded-xl transition-all border border-transparent hover:border-slate-100"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-lg transition-colors ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">{label}</span>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
    </button>
  );
};

const ShieldCheck = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const JobDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobRes, analyticsRes] = await Promise.all([
        jobAPI.getJobById(id!),
        analyticsAPI.getJobAnalytics(id!).catch(() => ({ data: { data: null } }))
      ]);

      setJob(jobRes.data.data || jobRes.data);
      setAnalytics(analyticsRes.data.data || analyticsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssessment = async () => {
    navigate(`/assessments/new?jobId=${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 font-bold uppercase tracking-widest">Job post not found</p>
        <Button variant="ghost" onClick={() => navigate('/jobs')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Breadcrumb & Top Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/jobs')}
          className="group flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors"
        >
          <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-blue-100 group-hover:bg-blue-50">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Back to Listings</span>
        </button>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="rounded-lg">
            <Edit className="w-4 h-4 mr-2" />
            Edit Position
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg text-red-600 hover:bg-red-50 border-red-100">
            <Trash2 className="w-4 h-4 mr-2" />
            Archive
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant={job.status === 'active' ? 'success' : 'default'} className="uppercase tracking-widest text-[10px] py-0.5 px-3">
              {job.status}
            </Badge>
            <span className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Posted {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-slate-600">
              <Briefcase className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-bold">{job.department || 'Engineering'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold">{job.location || 'Remote'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-bold">{job.type || 'Full-time'}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate(`/candidates?jobId=${id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-6 h-auto"
          >
            <Users className="w-5 h-5 mr-2.5" />
            <div className="text-left">
              <p className="text-xs font-bold opacity-80 uppercase tracking-tighter">View Pool</p>
              <p className="text-lg font-black leading-none">{analytics?.totalCandidates || 0} Candidates</p>
            </div>
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          label="Avg. Performance"
          value={`${analytics?.avgScore || 0}%`}
          sub="Skill Proficiency"
          icon={Target}
          color="blue"
        />
        <StatsCard
          label="Qualified Ratio"
          value={`${analytics?.passRate || 0}%`}
          sub={`${analytics?.qualifiedCount || 0} Recommended`}
          icon={Award}
          color="emerald"
        />
        <StatsCard
          label="Assessment Status"
          value={job.assessmentId ? 'Active' : 'Missing'}
          sub={job.assessmentId ? 'V1.4 Live' : 'AI Generation Required'}
          icon={FileText}
          color={job.assessmentId ? 'indigo' : 'amber'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <Card className="border-slate-100">
            <h2 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
              Position Overview
            </h2>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium">
              {job.description}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Core Competencies</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills?.map((skill: string, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    {skill}
                  </span>
                ))}
                <button className="px-3 py-1.5 border border-dashed border-slate-200 text-slate-400 rounded-lg text-xs font-bold hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center gap-2">
                  <Plus className="w-3 h-3" />
                  Add Skill
                </button>
              </div>
            </div>
          </Card>

          {/* Recent Applicants Preview */}
          <Card className="border-slate-100" padding="none">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Recent Applications</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate(`/candidates?jobId=${id}`)} className="text-blue-600 font-bold text-xs uppercase tracking-widest">
                View All <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
            <div className="px-6 py-4 flex flex-col gap-4">
              {analytics?.recentActivity?.slice(0, 3).map((act: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-[10px]">
                      {act.candidateName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 capitalize">{act.candidateName}</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Applied {new Date(act.completedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-emerald-600">{act.score}%</span>
                    <Badge variant="info" className="text-[9px] py-0 px-2 uppercase tracking-widest">{act.status}</Badge>
                  </div>
                </div>
              )) || (
                  <p className="text-center py-6 text-slate-400 text-xs font-bold uppercase italic tracking-widest">No recent submissions</p>
                )}
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Assessment Management Card */}
          <Card className={`relative overflow-hidden border-2 transition-all ${job.assessmentId ? 'border-blue-100 bg-blue-50/20' : 'border-dashed border-amber-200 bg-amber-50/20'}`}>
            {job.assessmentId && (
              <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-blue-500/10 rounded-full blur-2xl"></div>
            )}

            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${job.assessmentId ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'}`}>
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase">Assessment</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">AI Generated Flow</p>
              </div>
            </div>

            {job.assessmentId ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500">Stability Rank</span>
                  <span className="text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    94% Accurate
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[94%] shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
                </div>
                <Button
                  onClick={() => navigate(`/assessments/${job.assessmentId}`)}
                  className="w-full bg-white text-blue-600 hover:bg-slate-50 border border-blue-100 font-black rounded-lg text-xs"
                >
                  Configure Assessment
                </Button>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-xs text-amber-700 font-bold leading-relaxed px-2">No skill verification flow exists for this position yet.</p>
                <Button onClick={handleCreateAssessment} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black rounded-lg text-xs">
                  Build with AI Magic
                </Button>
              </div>
            )}
          </Card>

          {/* Action Bar */}
          <Card className="border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Pipeline Actions</h3>
            <div className="space-y-3">
              <ActionButton icon={Users} label="View Applications" color="blue" onClick={() => navigate(`/candidates?jobId=${id}`)} />
              <ActionButton icon={BarChart3} label="Deep Analytics" color="indigo" onClick={() => navigate(`/analytics?jobId=${id}`)} />
              <ActionButton icon={FileText} label="Assessment Summary" color="purple" onClick={() => navigate(`/assessments/${job.assessmentId}`)} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
