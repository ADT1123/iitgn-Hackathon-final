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
  Filter,
  ArrowRight
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest mb-2">
            <Briefcase className="w-3 h-3" />
            <span>Position Inventory</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Active Jobs</h1>
          <p className="text-slate-500 mt-1.5 text-xs font-bold uppercase tracking-tight opacity-70">Oversee {jobs.length} total openings across departments</p>
        </div>
        <Button onClick={() => navigate('/jobs/create')} className="bg-slate-900 hover:bg-black text-white rounded-xl h-12 px-8 font-black shadow-lg shadow-slate-200 text-xs uppercase tracking-widest">
          <Plus className="w-4 h-4 mr-2" />
          Create Position
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="FILTER BY POSITION OR KEYWORD..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-[10px] uppercase tracking-widest text-slate-900 outline-none"
          />
        </div>
        <Button variant="secondary" className="rounded-xl px-6 font-bold text-[10px] uppercase tracking-widest bg-white border-slate-200">
          <Filter className="w-3 h-3 mr-2" />
          Advanced
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
              className="cursor-pointer border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-100 transition-all group p-6"
            >
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center border border-slate-50 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <Badge
                    variant={
                      job.status === 'active' ? 'success' :
                        job.status === 'closed' ? 'danger' : 'default'
                    }
                    className="text-[9px] font-black uppercase tracking-widest"
                  >
                    {job.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-2">
                    {job.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium line-clamp-2 leading-relaxed italic">
                    {job.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {job.skills?.slice(0, 3).map((skill: string, idx: number) => (
                    <Badge key={idx} variant="info" className="text-[9px] bg-slate-100 text-slate-600 border-none font-bold">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-300" />
                    <span>{job.applicantsCount || 0} Pool</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600">
                    View <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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
