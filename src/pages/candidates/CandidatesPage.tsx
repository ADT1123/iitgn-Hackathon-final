// src/pages/candidates/CandidatesPage.tsx
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { applicationAPI, candidatesAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  MoreVertical,
  ChevronDown,
  User,
  Mail,
  Briefcase,
  Trophy,
  ArrowUpRight,
  ShieldCheck,
  Trash2,
  Edit,
  UserPlus,
  Zap,
  Star
} from 'lucide-react';
import { toast } from '@/components/ui/toaster';

export const CandidatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await applicationAPI.getApplications(params);
      setApplications(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
      toast.error('❌ Failed to synchronize talent pool.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('🗑️ Are you sure you want to delete this candidate? This will also remove their associated user account.')) return;

    try {
      await candidatesAPI.deleteCandidate(id);
      toast.success('👤 Candidate record removed successfully.');
      loadApplications();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('❌ Failed to delete candidate record.');
    }
  };

  const handleBulkAction = async (action: 'shortlist' | 'reject') => {
    if (selectedIds.length === 0) return;

    const status = action === 'shortlist' ? 'shortlisted' : 'rejected';

    try {
      await applicationAPI.bulkUpdate(selectedIds, status);
      setSelectedIds([]);
      toast.success(`✅ Updated ${selectedIds.length} candidates status.`);
      loadApplications();
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error('❌ Bulk update failed.');
    }
  };

  const filteredApplications = applications.filter(app =>
    (app.candidateName || app.candidate?.name || 'Unknown')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.candidateEmail || app.candidate?.email || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-widest mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Human Capital Pool 🌐</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Talent Management</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Review assessment results and orchestrate your hiring pipeline with AI insights. 🚀</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="rounded-xl border-slate-200 font-bold text-xs uppercase tracking-widest px-5 h-10 shadow-sm hover:bg-slate-50">
            <Download className="w-3.5 h-3.5 mr-2" />
            Export Data 📊
          </Button>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-1 w-full gap-4 max-w-3xl">
          <div className="flex-1 relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search talent by name, email or role... 🔍"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-[13px] outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold placeholder:text-slate-300"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all min-w-[170px]"
            >
              <option value="all">📁 All Phases</option>
              <option value="completed">✅ Completed</option>
              <option value="shortlisted">⭐ Shortlisted</option>
              <option value="rejected">❌ Rejected</option>
              <option value="in-progress">⏳ Active Session</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 bg-blue-50/50 p-2 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-right-4">
            <span className="px-3 text-[10px] font-black text-blue-700 uppercase tracking-widest">{selectedIds.length} Selected 🏹</span>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                className="bg-slate-900 hover:bg-black text-white rounded-xl px-4 h-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10"
                onClick={() => handleBulkAction('shortlist')}
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                Shortlist ⭐
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-100 hover:bg-red-50 rounded-xl px-4 h-8 text-[10px] font-black uppercase tracking-widest"
                onClick={() => handleBulkAction('reject')}
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                Reject ❌
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Candidates Content */}
      <Card className="overflow-hidden p-0 border-slate-200 shadow-xl shadow-slate-200/40 rounded-3xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="relative">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Synchronizing Talent Pool... ⏳</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-32 border-dashed border-2 m-4 rounded-2xl border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
              <Search className="w-8 h-8 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Results Found 🕵️‍♂️</h3>
            <p className="text-slate-400 max-w-xs mx-auto mt-2 text-sm font-medium">Try refining your search or filters to discover potential talent for your roles.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-5 w-12 text-center">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(filteredApplications.map(a => a._id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                        checked={selectedIds.length === filteredApplications.length && filteredApplications.length > 0}
                        className="w-4.5 h-4.5 rounded-lg border-slate-300 text-blue-600 focus:ring-0 cursor-pointer transition-all"
                      />
                    </div>
                  </th>
                  <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-widest text-[9px]">Candidate Identity 👤</th>
                  <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-widest text-[9px]">Target Role 🎯</th>
                  <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-widest text-[9px] text-center">AI Performance 📊</th>
                  <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-widest text-[9px]">Trust Score 🛡️</th>
                  <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-widest text-[9px] text-right">Phase 🏁</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/50 transition-all group cursor-pointer" onClick={() => navigate(`/candidates/${app._id}`)}>
                    <td className="px-6 py-6" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(app._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds([...selectedIds, app._id]);
                            } else {
                              setSelectedIds(selectedIds.filter(id => id !== app._id));
                            }
                          }}
                          className="w-4.5 h-4.5 rounded-lg border-slate-300 text-blue-600 focus:ring-0 cursor-pointer transition-all"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-6 font-bold">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center font-black text-slate-500 text-xs border border-white shadow-sm shrink-0">
                          {(app.candidateName || app.candidate?.name || 'U').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate">{app.candidateName || app.candidate?.name || 'Unknown Candidate'}</p>
                          <div className="flex items-center gap-1.5 text-slate-400 mt-1 font-bold">
                            <Mail className="w-3 h-3" />
                            <span className="text-[10px] truncate">{app.candidateEmail || app.candidate?.email || 'no-email'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-50/50 flex items-center justify-center shrink-0 border border-blue-100/50">
                          <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <span className="font-black text-slate-700 uppercase tracking-tighter text-xs truncate max-w-[150px]">{app.job?.title || 'General Pool'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="inline-flex items-center px-4 py-1 rounded-xl bg-slate-900 text-white font-black text-[11px] shadow-lg shadow-slate-900/10 tracking-widest">
                          {app.totalScore || 0}%
                        </span>
                        <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          <Zap className="w-2.5 h-2.5 text-amber-500 fill-current" />
                          Rank #{app.rank || '—'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <div key={s} className={`w-1.5 h-4 rounded-full ${s <= (app.integrityScore / 20 || 4) ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
                          ))}
                        </div>
                        <ShieldCheck className="w-4 h-4 text-blue-500/20" />
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                        <StatusBadge status={app.status} />
                        <div className="flex items-center gap-1 ml-4 py-1 px-1 bg-slate-50 rounded-xl border border-slate-100">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-8 h-8 p-0 rounded-lg hover:bg-white text-slate-400 hover:text-blue-600 transition-all font-black"
                            onClick={() => navigate(`/candidates/profile/${app.candidate?._id || app.candidateId || app._id}`)}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-8 h-8 p-0 rounded-lg hover:bg-white text-slate-400 hover:text-red-600 transition-all font-black"
                            onClick={(e) => handleDelete(e, app.candidate?._id || app.candidateId || app._id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Talent Synchronization Active</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="h-8 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-xl hover:bg-white border-transparent hover:border-slate-200">Previous</Button>
            <div className="flex items-center gap-1">
              <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-900 text-white text-xs font-black">1</span>
              <span className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white text-slate-400 text-xs font-black cursor-pointer transition-all">2</span>
            </div>
            <Button variant="ghost" className="h-8 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-xl hover:bg-white border-transparent hover:border-slate-200">Next Phase</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    shortlisted: 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-[0_4px_12px_rgba(16,185,129,0.1)]',
    rejected: 'bg-red-50 text-red-700 border-red-100',
    completed: 'bg-blue-600 text-white border-blue-700 shadow-[0_4px_12px_rgba(37,99,235,0.2)]',
    flagged: 'bg-amber-50 text-amber-700 border-amber-100',
    'in-progress': 'bg-slate-100 text-slate-600 border-slate-200 animate-pulse',
  };

  const icons: any = {
    shortlisted: '⭐',
    rejected: '❌',
    completed: '✅',
    flagged: '⚠️',
    'in-progress': '⏳',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${styles[status?.toLowerCase()] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
      <span>{icons[status?.toLowerCase()] || '🔹'}</span>
      {status}
    </span>
  );
};
