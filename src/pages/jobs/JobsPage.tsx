import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { jobAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Briefcase,
  MapPin,
  Users,
  Calendar,
  Loader2,
  Search,
  Filter
} from 'lucide-react';

export const JobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getJobs();
      setJobs(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
          <p className="text-slate-600 mt-1">Manage job postings and requirements</p>
        </div>
        <Button onClick={() => navigate('/jobs/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Job
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button variant="secondary">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card className="text-center py-12">
          <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No jobs found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <Card
              key={job._id}
              onClick={() => navigate(`/jobs/${job._id}`)}
              className="cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <Badge
                    variant={
                      job.status === 'active' ? 'success' :
                        job.status === 'closed' ? 'danger' : 'default'
                    }
                  >
                    {job.status}
                  </Badge>
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-1">
                    {job.title}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {job.description}
                  </p>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                  {job.skills?.slice(0, 3).map((skill: string, idx: number) => (
                    <Badge key={idx} variant="info">
                      {skill}
                    </Badge>
                  ))}
                  {job.skills?.length > 3 && (
                    <Badge variant="default">+{job.skills.length - 3}</Badge>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{job.applicantsCount || 0} applicants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>

  );
};
