// src/pages/candidate/CandidateJobs.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { jobsAPI, applicationAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  Building2, 
  Clock, 
  DollarSign,
  Search,
  Filter,
  Loader2,
  CheckCircle,
  ArrowRight
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
    if (job.assessment) {
      navigate(`/candidate/assessment/${job.assessment}`);
    } else {
      alert('No assessment linked to this job');
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
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Browse Jobs</h1>
        <p className="text-slate-600">Find your dream job and apply now</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs, skills, departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Locations</option>
            {uniqueLocations.map((loc: any) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {uniqueTypes.map((type: any) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <Card className="text-center py-12">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No jobs found matching your criteria</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map((job: any) => {
            const applied = hasApplied(job._id);
            
            return (
              <Card 
                key={job._id}
                className="hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-200"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {job.title}
                        </h3>
                        <p className="text-sm text-slate-600">{job.department}</p>
                      </div>
                    </div>
                    {applied && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Applied
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {job.description || 'No description available'}
                  </p>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>{job.type || 'Full-time'}</span>
                    </div>
                    {job.experienceLevel && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Building2 className="w-4 h-4" />
                        <span>{job.experienceLevel}</span>
                      </div>
                    )}
                    {job.salaryRange && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <DollarSign className="w-4 h-4" />
                        <span>{job.salaryRange}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {job.requiredSkills && job.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.slice(0, 4).map((skill: string, idx: number) => (
                        <Badge key={idx} variant="info">
                          {skill}
                        </Badge>
                      ))}
                      {job.requiredSkills.length > 4 && (
                        <Badge variant="default">
                          +{job.requiredSkills.length - 4} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    variant={applied ? "secondary" : "primary"}
                    className="w-full"
                    onClick={() => applied ? navigate('/candidate/applications') : handleApply(job)}
                    disabled={applied}
                  >
                    {applied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Already Applied
                      </>
                    ) : (
                      <>
                        Apply Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
