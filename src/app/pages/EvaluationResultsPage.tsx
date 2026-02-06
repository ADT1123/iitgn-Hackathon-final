import { useState } from 'react';
import RecruiterLayout from '../components/RecruiterLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Trophy,
  Users,
  BarChart3,
  ChevronDown
} from 'lucide-react';

interface EvaluationResultsPageProps {
  navigate: (page: string) => void;
  onLogout: () => void;
}

interface Candidate {
  id: number;
  name: string;
  email: string;
  score: number;
  rank: number;
  percentile: number;
  status: 'Qualified' | 'Flagged' | 'Pending';
  resumeMismatch: boolean;
  completedAt: string;
  skills: {
    name: string;
    score: number;
  }[];
}

export default function EvaluationResultsPage({ navigate, onLogout }: EvaluationResultsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'qualified' | 'flagged' | 'pending'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'leaderboard'>('table');

  const candidates: Candidate[] = [
    {
      id: 1,
      name: 'Sarah Chen',
      email: 'sarah.chen@email.com',
      score: 94,
      rank: 1,
      percentile: 98,
      status: 'Qualified',
      resumeMismatch: false,
      completedAt: '2026-02-05',
      skills: [
        { name: 'React', score: 96 },
        { name: 'Node.js', score: 92 },
        { name: 'JavaScript', score: 95 }
      ]
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      email: 'michael.r@email.com',
      score: 89,
      rank: 2,
      percentile: 92,
      status: 'Qualified',
      resumeMismatch: false,
      completedAt: '2026-02-04',
      skills: [
        { name: 'React', score: 88 },
        { name: 'Node.js', score: 91 },
        { name: 'JavaScript', score: 87 }
      ]
    },
    {
      id: 3,
      name: 'Emily Watson',
      email: 'emily.w@email.com',
      score: 85,
      rank: 3,
      percentile: 87,
      status: 'Qualified',
      resumeMismatch: false,
      completedAt: '2026-02-05',
      skills: [
        { name: 'React', score: 84 },
        { name: 'Node.js', score: 87 },
        { name: 'JavaScript', score: 83 }
      ]
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.kim@email.com',
      score: 78,
      rank: 4,
      percentile: 75,
      status: 'Flagged',
      resumeMismatch: true,
      completedAt: '2026-02-03',
      skills: [
        { name: 'React', score: 75 },
        { name: 'Node.js', score: 82 },
        { name: 'JavaScript', score: 76 }
      ]
    },
    {
      id: 5,
      name: 'Jessica Thompson',
      email: 'jessica.t@email.com',
      score: 82,
      rank: 5,
      percentile: 81,
      status: 'Qualified',
      resumeMismatch: false,
      completedAt: '2026-02-04',
      skills: [
        { name: 'React', score: 80 },
        { name: 'Node.js', score: 85 },
        { name: 'JavaScript', score: 81 }
      ]
    },
    {
      id: 6,
      name: 'Alex Morgan',
      email: 'alex.m@email.com',
      score: 72,
      rank: 6,
      percentile: 68,
      status: 'Pending',
      resumeMismatch: false,
      completedAt: '2026-02-05',
      skills: [
        { name: 'React', score: 70 },
        { name: 'Node.js', score: 74 },
        { name: 'JavaScript', score: 72 }
      ]
    },
  ];

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || candidate.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Qualified':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Flagged':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <RecruiterLayout navigate={navigate} onLogout={onLogout} currentPage="evaluation-results">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Candidate Evaluation</h1>
            <p className="text-slate-600 mt-1">Review and rank candidates based on assessment performance</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{candidates.length}</div>
            <div className="text-sm text-slate-600">Total Candidates</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {candidates.filter(c => c.status === 'Qualified').length}
            </div>
            <div className="text-sm text-slate-600">Qualified</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {candidates.filter(c => c.status === 'Flagged').length}
            </div>
            <div className="text-sm text-slate-600">Flagged</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length)}
            </div>
            <div className="text-sm text-slate-600">Avg Score</div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('qualified')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'qualified'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Qualified
              </button>
              <button
                onClick={() => setFilterStatus('flagged')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'flagged'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Flagged
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('leaderboard')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'leaderboard'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Leaderboard
              </button>
            </div>
          </div>
        </div>

        {/* Results Table */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Candidate</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Score</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Percentile</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Flags</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getRankBadge(candidate.rank)}</span>
                          {candidate.rank <= 3 && (
                            <Trophy className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-900">{candidate.name}</div>
                          <div className="text-sm text-slate-500">{candidate.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="text-xl font-bold text-slate-900">{candidate.score}</div>
                          <div className="text-sm text-slate-500">/100</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                          <span className="font-medium text-slate-900">{candidate.percentile}th</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(candidate.status)}>
                          {candidate.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {candidate.resumeMismatch && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Resume Mismatch
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('candidate-analytics')}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Leaderboard View */}
        {viewMode === 'leaderboard' && (
          <div className="space-y-4">
            {filteredCandidates.map((candidate, index) => (
              <div
                key={candidate.id}
                className={`bg-white rounded-xl border-2 p-6 transition-all cursor-pointer hover:shadow-md ${
                  index === 0
                    ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-white'
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
                onClick={() => navigate('candidate-analytics')}
              >
                <div className="flex items-center gap-6">
                  {/* Rank Badge */}
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold ${
                    index === 0
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
                      : index === 1
                      ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white'
                      : index === 2
                      ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {candidate.rank}
                  </div>

                  {/* Candidate Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{candidate.name}</h3>
                        <p className="text-sm text-slate-600">{candidate.email}</p>
                      </div>
                      <Badge className={getStatusColor(candidate.status)}>
                        {candidate.status}
                      </Badge>
                    </div>

                    {/* Skills */}
                    <div className="flex items-center gap-4 mt-3">
                      {candidate.skills.map((skill) => (
                        <div key={skill.name} className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-600">{skill.name}:</span>
                          <span className="text-xs font-bold text-indigo-600">{skill.score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Score Circle */}
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full border-4 border-indigo-600 flex items-center justify-center mb-2">
                      <div className="text-2xl font-bold text-indigo-600">{candidate.score}</div>
                    </div>
                    <div className="text-xs text-slate-600">Score</div>
                  </div>

                  {/* Percentile */}
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                      <div className="text-xl font-bold text-emerald-600">{candidate.percentile}th</div>
                    </div>
                    <div className="text-xs text-slate-600">Percentile</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RecruiterLayout>
  );
}
