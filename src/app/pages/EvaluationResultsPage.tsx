import { useState, useEffect } from 'react';
import RecruiterLayout from '../components/RecruiterLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Search,
  Filter,
  Download,
  TrendingUp,
  Award,
  Users,
  Target,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Loader2
} from 'lucide-react';

interface EvaluationResultsPageProps {
  navigate: (page: string) => void;
  onLogout: () => void;
}

export default function EvaluationResultsPage({ navigate, onLogout }: EvaluationResultsPageProps) {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('score');

  // ✅ Load candidates
  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with real API
      const mockCandidates = [
        {
          id: '1',
          name: 'Sarah Chen',
          email: 'sarah.chen@email.com',
          score: 94,
          rank: 1,
          percentile: 98,
          status: 'qualified',
          completedAt: '2026-02-05',
          resumeMismatch: false,
          skills: { React: 96, 'Node.js': 92, JavaScript: 95 }
        },
        {
          id: '2',
          name: 'Michael Rodriguez',
          email: 'michael.r@email.com',
          score: 89,
          rank: 2,
          percentile: 95,
          status: 'qualified',
          completedAt: '2026-02-05',
          resumeMismatch: false,
          skills: { React: 90, 'Node.js': 88, JavaScript: 89 }
        },
        {
          id: '3',
          name: 'Priya Sharma',
          email: 'priya.s@email.com',
          score: 85,
          rank: 3,
          percentile: 90,
          status: 'qualified',
          completedAt: '2026-02-06',
          resumeMismatch: false,
          skills: { React: 88, 'Node.js': 82, JavaScript: 85 }
        },
        {
          id: '4',
          name: 'David Kim',
          email: 'david.kim@email.com',
          score: 72,
          rank: 4,
          percentile: 78,
          status: 'review',
          completedAt: '2026-02-06',
          resumeMismatch: true,
          skills: { React: 75, 'Node.js': 70, JavaScript: 71 }
        },
        {
          id: '5',
          name: 'Emma Watson',
          email: 'emma.w@email.com',
          score: 58,
          rank: 5,
          percentile: 45,
          status: 'rejected',
          completedAt: '2026-02-06',
          resumeMismatch: true,
          skills: { React: 60, 'Node.js': 55, JavaScript: 59 }
        }
      ];
      
      setCandidates(mockCandidates);
      console.log('✅ Candidates loaded');
    } catch (error) {
      console.error('❌ Load candidates error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'qualified':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'review':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredCandidates = candidates
    .filter(c => filterStatus === 'all' || c.status === filterStatus)
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const stats = {
    total: candidates.length,
    qualified: candidates.filter(c => c.status === 'qualified').length,
    avgScore: Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length)
  };

  if (loading) {
    return (
      <RecruiterLayout navigate={navigate} onLogout={onLogout} currentPage="evaluation-results">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading results...</p>
          </div>
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout navigate={navigate} onLogout={onLogout} currentPage="evaluation-results">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Candidate Leaderboard</h1>
            <p className="text-slate-600 mt-1">Ranked by overall performance</p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.total}</div>
            <div className="text-sm text-slate-600">Total Candidates</div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.qualified}</div>
            <div className="text-sm text-slate-600">Qualified</div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.avgScore}%</div>
            <div className="text-sm text-slate-600">Average Score</div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-amber-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {candidates[0]?.score || 0}%
            </div>
            <div className="text-sm text-slate-600">Top Score</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="qualified">Qualified</option>
              <option value="review">Under Review</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-slate-900">Rank</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-900">Candidate</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-900">Score</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-900">Percentile</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-900">Status</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-900">Flags</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCandidates.map((candidate, i) => (
                  <tr key={candidate.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          candidate.rank === 1 ? 'bg-amber-100 text-amber-700' :
                          candidate.rank === 2 ? 'bg-slate-200 text-slate-700' :
                          candidate.rank === 3 ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {candidate.rank}
                        </div>
                        {candidate.rank <= 3 && <Award className="w-4 h-4 text-amber-500" />}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-slate-900">{candidate.name}</div>
                        <div className="text-sm text-slate-600">{candidate.email}</div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-slate-900">{candidate.score}</div>
                        <div className="flex-1">
                          <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                              style={{ width: `${candidate.score}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                        {candidate.percentile}th
                      </Badge>
                    </td>
                    
                    <td className="p-4">
                      <Badge className={getStatusColor(candidate.status)}>
                        {candidate.status === 'qualified' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {candidate.status === 'review' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {candidate.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                        {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                      </Badge>
                    </td>
                    
                    <td className="p-4">
                      {candidate.resumeMismatch && (
                        <Badge className="bg-red-100 text-red-700 border-red-200">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Resume Mismatch
                        </Badge>
                      )}
                    </td>
                    
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('candidate-analytics')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RecruiterLayout>
  );
}
