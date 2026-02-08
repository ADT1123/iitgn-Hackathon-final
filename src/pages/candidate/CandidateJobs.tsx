// src/pages/candidate/CandidateJobs.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { jobsAPI, applicationAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Clock,
  Search,
  CheckCircle,
  ArrowRight,
  Filter
} from 'lucide-react';

export const CandidateJobs: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobsAPI.getJobs();
      setJobs(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const response = await applicationAPI.getApplications();
      setMyApplications(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
    }
  };

  const hasApplied = (jobId: string) => {
    return myApplications.some((app: any) => app.job?._id === jobId || app.job === jobId);
  };

  const handleApply = (job: any) => {
    const assessmentId = job.assessment?._id || job.assessment;
    if (assessmentId) {
      // Direct navigation to assessment
      navigate(`/candidate/assessment/${assessmentId}`);
    } else {
      // Fallback for jobs without assessment (should generally have one)
      alert('This job does not have an active assessment configured yet. Please check back later.');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation = locationFilter === 'all' || job.location === locationFilter;
    const matchesType = typeFilter === 'all' || job.type === typeFilter;

    return matchesSearch && matchesLocation && matchesType;
  });

  const uniqueLocations = Array.from(new Set(jobs.map(j => j.location).filter(Boolean)));
  const uniqueTypes = Array.from(new Set(jobs.map(j => j.type).filter(Boolean)));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Browse Open Roles</h1>
        <p className="text-slate-600 mt-1">Find and apply for positions that match your skills.</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm sticky top-20 z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, department, or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
            >
              <option value="all">All Locations</option>
              {uniqueLocations.map((loc: any) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
            >
              <option value="all">All Employment Types</option>
              {uniqueTypes.map((type: any) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No jobs found</h3>
          <p className="text-slate-500">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job: any) => {
            const applied = hasApplied(job._id);

            return (
              <div
                key={job._id}
                className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start md:items-center"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                    {applied && <Badge variant="success" className="text-xs">Applied</Badge>}
                    <Badge variant="secondary" className="text-xs">{job.type}</Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {job.location}
                    </span>
                    {job.salaryRange && (
                      <span className="flex items-center gap-1">
                        <span className="font-medium text-slate-900">{job.salaryRange}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills?.slice(0, 5).map((skill: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col items-end gap-3 min-w-[150px]">
                  <Button
                    variant={applied ? "secondary" : "primary"}
                    className="w-full"
                    onClick={() => applied ? navigate('/candidate/applications') : handleApply(job)}
                    disabled={applied}
                  >
                    {applied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Status
                      </>
                    ) : (
                      <>
                        Take Assessment
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-slate-400 text-center">
                    {applied ? 'Application submitted' : 'Approx. 60 mins'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
