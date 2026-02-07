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
  Loader2
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
    if (selectedIds.length === 0) {
      alert('Please select candidates');
      return;
    }

    const status = action === 'shortlist' ? 'shortlisted' : 'rejected';
    
    try {
      await applicationAPI.bulkUpdate(selectedIds, status);
      alert(`${selectedIds.length} candidates ${status}`);
      setSelectedIds([]);
      loadApplications();
    } catch (error) {
      console.error('Bulk action failed:', error);
      alert('Failed to update candidates');
    }
  };

  const filteredApplications = applications.filter(app =>
    app.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.candidateEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Candidates</h1>
            <p className="text-slate-600 mt-1">Review and manage applications</p>
          </div>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">
                {selectedIds.length} candidate{selectedIds.length > 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleBulkAction('shortlist')}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Shortlist
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleBulkAction('reject')}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Candidates Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <Card className="text-center py-12">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No candidates found</p>
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(filteredApplications.map(a => a._id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                        checked={selectedIds.length === filteredApplications.length}
                        className="w-4 h-4"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                      Job
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
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
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{app.candidateName}</p>
                          <p className="text-sm text-slate-500">{app.candidateEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {app.job?.title || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">{app.totalScore}%</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-900">#{app.rank || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            app.status === 'completed' ? 'success' :
                            app.status === 'shortlisted' ? 'info' :
                            app.status === 'rejected' ? 'danger' : 'default'
                          }
                        >
                          {app.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/candidates/${app._id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};
