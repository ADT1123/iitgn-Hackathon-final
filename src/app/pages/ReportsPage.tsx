import { useState, useEffect } from 'react';
import RecruiterLayout from '../components/RecruiterLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileCode,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle2,
  Loader2,
  Filter,
  RefreshCw
} from 'lucide-react';
import { jobAPI, applicationAPI } from '../services/api';

interface ReportsPageProps {
  navigate: (page: string) => void;
  onLogout: () => void;
}

export default function ReportsPage({ navigate, onLogout }: ReportsPageProps) {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState('all');
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    loadJobs();
    loadReports();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await jobAPI.getJobs();
      setJobs(response.data.data || []);
    } catch (error) {
      console.error('❌ Load jobs error:', error);
    }
  };

  const loadReports = () => {
    // Mock reports data
    const mockReports = [
      {
        id: '1',
        title: 'Senior Full Stack Developer - Complete Assessment Report',
        job: 'Senior Full Stack Developer',
        type: 'Complete',
        candidates: 142,
        date: '2026-02-06',
        status: 'Ready'
      },
      {
        id: '2',
        title: 'Frontend Developer - Skills Analysis',
        job: 'Frontend Developer',
        type: 'Skills',
        candidates: 89,
        date: '2026-02-05',
        status: 'Ready'
      },
      {
        id: '3',
        title: 'Backend Engineer - Code Quality Report',
        job: 'Backend Engineer',
        type: 'Coding',
        candidates: 67,
        date: '2026-02-04',
        status: 'Ready'
      }
    ];
    setReports(mockReports);
  };

  // ✅ Generate new report
  const generateReport = async (type: string) => {
    try {
      setLoading(true);
      console.log('📊 Generating report...', { type, job: selectedJob });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`${type} report generated successfully!`);
      loadReports();
    } catch (error) {
      console.error('❌ Generate report error:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Download report
  const downloadReport = async (reportId: string, format: string) => {
    try {
      setLoading(true);
      console.log('⬇️ Downloading report...', { reportId, format });
      
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`Report downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('❌ Download error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RecruiterLayout navigate={navigate} onLogout={onLogout} currentPage="reports">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
            <p className="text-slate-600 mt-1">Export candidate data and generate insights</p>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => generateReport('Complete')}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate New Report
              </>
            )}
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{reports.length}</div>
            <div className="text-sm text-slate-600">Total Reports</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">298</div>
            <div className="text-sm text-slate-600">Total Candidates</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Download className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">45</div>
            <div className="text-sm text-slate-600">Downloads This Month</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-amber-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">82%</div>
            <div className="text-sm text-slate-600">Avg Completion Rate</div>
          </div>
        </div>

        {/* Generate Reports Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Generate New Report</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[
              {
                type: 'Complete Assessment Report',
                icon: FileText,
                desc: 'Full candidate analysis with scores, rankings, and AI insights',
                color: 'indigo'
              },
              {
                type: 'Skills Breakdown',
                icon: TrendingUp,
                desc: 'Detailed skill-wise performance analysis',
                color: 'emerald'
              },
              {
                type: 'Code Quality Report',
                icon: FileCode,
                desc: 'Coding challenge results and plagiarism checks',
                color: 'purple'
              }
            ].map((report, i) => (
              <button
                key={i}
                onClick={() => generateReport(report.type)}
                className="bg-slate-50 hover:bg-slate-100 rounded-xl border-2 border-slate-200 hover:border-indigo-300 p-6 text-left transition-all"
              >
                <report.icon className={`w-10 h-10 text-${report.color}-600 mb-4`} />
                <h3 className="font-semibold text-slate-900 mb-2">{report.type}</h3>
                <p className="text-sm text-slate-600">{report.desc}</p>
              </button>
            ))}
          </div>

          {/* Job Filter */}
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Assessments</option>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Existing Reports */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Reports</h2>
          
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">{report.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(report.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {report.candidates} candidates
                      </span>
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadReport(report.id, 'pdf')}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadReport(report.id, 'csv')}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadReport(report.id, 'json')}
                  >
                    <FileCode className="w-4 h-4 mr-1" />
                    JSON
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3">Bulk Export</h2>
              <p className="text-white/90 mb-6">
                Export all candidate data from multiple assessments in one go
              </p>
              <div className="flex items-center gap-3">
                <Button className="bg-white text-indigo-600 hover:bg-slate-100">
                  <Download className="w-4 h-4 mr-2" />
                  Export All Data
                </Button>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Schedule Export
                </Button>
              </div>
            </div>
            <div className="w-32 h-32 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Download className="w-16 h-16 text-white/80" />
            </div>
          </div>
        </div>
      </div>
    </RecruiterLayout>
  );
}
