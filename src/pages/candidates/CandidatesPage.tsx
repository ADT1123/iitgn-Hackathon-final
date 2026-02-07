import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { applicationAPI } from '@/services/api';
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
  ShieldCheck
} from 'lucide-react';

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
      setApplications(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: 'shortlist' | 'reject') => {
    if (selectedIds.length === 0) return;

    const status = action === 'shortlist' ? 'shortlisted' : 'rejected';

    try {
      await applicationAPI.bulkUpdate(selectedIds, status);
      setSelectedIds([]);
      loadApplications();
    } catch (error) {
      console.error('Bulk action failed:', error);
      alert('Failed to update candidates');
    }
  };

  const filteredApplications = applications.filter(app =>
    app.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.candidateEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-medium text-sm mb-1">
            <Users className="w-4 h-4" />
            <span>Talent Pool</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Candidates</h1>
          <p className="text-slate-500 mt-1 text-sm">Review assessment results and manage your hiring pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
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
              placeholder="Search by name, email or job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all min-w-[160px]"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 bg-blue-50/50 p-1.5 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
            <span className="px-3 text-xs font-black text-blue-700 uppercase tracking-widest">{selectedIds.length} Selected</span>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4"
                onClick={() => handleBulkAction('shortlist')}
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                Shortlist
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-100 hover:bg-red-50 rounded-lg px-4"
                onClick={() => handleBulkAction('reject')}
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                Reject
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Candidates Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Synchronizing Pool...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <Card className="text-center py-20 border-dashed border-2">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Candidates Found</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-1">Refine your search or filters to see more results.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0 border-slate-200">
          <div className="overflow-x-auto text-[13px]">
            <table className="w-full text-left bg-white">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 w-12">
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
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                  </th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Candidate Profile</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Job Applied For</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px] text-center">Score / Rank</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Integrity</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px] text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/80 transition-all group cursor-pointer" onClick={() => navigate(`/candidates/${app._id}`)}>
                    <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
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
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 text-xs border border-slate-200">
                          {app.candidateName?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{app.candidateName}</p>
                          <div className="flex items-center gap-1.5 text-slate-500 mt-1 font-medium">
                            <Mail className="w-3 h-3" />
                            <span className="text-[11px]">{app.candidateEmail}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-700 whitespace-nowrap">{app.job?.title || 'Unknown Role'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-black text-xs min-w-[45px] justify-center">
                          {app.totalScore}%
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Rank #{app.rank || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <div key={star} className={`w-1 h-3 rounded-full ${star <= (app.integrityScore / 20 || 4) ? 'bg-blue-500' : 'bg-slate-100'}`}></div>
                          ))}
                        </div>
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500/50" />
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <StatusBadge status={app.status} />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-900 group/btn"
                        >
                          <MoreVertical className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing {filteredApplications.length} potential talent</p>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className="px-2 py-1 rounded bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">1</span>
              <span className="px-2 py-1 cursor-pointer hover:text-blue-600 transition-colors">2</span>
              <span className="px-2 py-1 cursor-pointer hover:text-blue-600 transition-colors">3</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    shortlisted: 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-4 ring-emerald-500/5',
    rejected: 'bg-red-50 text-red-700 border-red-100 ring-4 ring-red-500/5',
    completed: 'bg-blue-50 text-blue-700 border-blue-100 ring-4 ring-blue-500/5',
    flagged: 'bg-amber-50 text-amber-700 border-amber-100 ring-4 ring-amber-500/5',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${styles[status?.toLowerCase()] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
      {status}
    </span>
  );
};
