import RecruiterLayout from '../components/RecruiterLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Download,
  FileDown,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  BarChart3,
  Settings
} from 'lucide-react';

interface ReportsPageProps {
  navigate: (page: string) => void;
  onLogout: () => void;
}

export default function ReportsPage({ navigate, onLogout }: ReportsPageProps) {
  const reports = [
    {
      id: 1,
      name: 'Senior Full Stack Developer - Complete Assessment Report',
      type: 'Assessment Report',
      generatedDate: '2026-02-05',
      candidates: 24,
      status: 'Ready',
      format: 'PDF'
    },
    {
      id: 2,
      name: 'Backend Developer - Candidate Rankings',
      type: 'Rankings Report',
      generatedDate: '2026-02-03',
      candidates: 31,
      status: 'Ready',
      format: 'CSV'
    },
    {
      id: 3,
      name: 'DevOps Engineer - Skill Analysis',
      type: 'Analytics Report',
      generatedDate: '2026-02-01',
      candidates: 15,
      status: 'Ready',
      format: 'PDF'
    },
    {
      id: 4,
      name: 'Full Stack Engineer - February Batch',
      type: 'Assessment Report',
      generatedDate: '2026-02-04',
      candidates: 18,
      status: 'Ready',
      format: 'XLSX'
    },
  ];

  const quickExports = [
    {
      title: 'All Candidates Data',
      description: 'Export complete candidate list with scores',
      icon: Users,
      format: 'CSV',
      color: 'indigo'
    },
    {
      title: 'Qualified Candidates',
      description: 'Export only qualified candidates above threshold',
      icon: CheckCircle2,
      format: 'PDF',
      color: 'emerald'
    },
    {
      title: 'Skill Distribution',
      description: 'Export skill-wise performance metrics',
      icon: BarChart3,
      format: 'XLSX',
      color: 'purple'
    },
    {
      title: 'Assessment Summary',
      description: 'Export high-level assessment statistics',
      icon: FileText,
      format: 'PDF',
      color: 'amber'
    },
  ];

  const atsIntegrations = [
    {
      name: 'Greenhouse',
      logo: '🏢',
      status: 'Connected',
      lastSync: '2 hours ago'
    },
    {
      name: 'Lever',
      logo: '⚙️',
      status: 'Not Connected',
      lastSync: null
    },
    {
      name: 'Workday',
      logo: '💼',
      status: 'Connected',
      lastSync: '1 day ago'
    },
    {
      name: 'BambooHR',
      logo: '🎋',
      status: 'Not Connected',
      lastSync: null
    },
  ];

  return (
    <RecruiterLayout navigate={navigate} onLogout={onLogout} currentPage="reports">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reports & Exports</h1>
            <p className="text-slate-600 mt-1">Generate and download assessment reports</p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <FileDown className="w-4 h-4 mr-2" />
            Generate New Report
          </Button>
        </div>

        {/* Quick Export Cards */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Exports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickExports.map((item) => {
              const Icon = item.icon;
              const colorClasses = {
                indigo: 'bg-indigo-100 text-indigo-600',
                emerald: 'bg-emerald-100 text-emerald-600',
                purple: 'bg-purple-100 text-purple-600',
                amber: 'bg-amber-100 text-amber-600'
              }[item.color];

              return (
                <button
                  key={item.title}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-sm transition-all text-left"
                >
                  <div className={`w-12 h-12 ${colorClasses} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-600 mb-3">{item.description}</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      <Download className="w-3 h-3 mr-1" />
                      Export {item.format}
                    </Button>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generated Reports */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Generated Reports</h2>
            <p className="text-sm text-slate-600 mt-1">Download previously generated reports</p>
          </div>
          <div className="divide-y divide-slate-200">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 mb-1">{report.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {report.generatedDate}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {report.candidates} candidates
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {report.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {report.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download {report.format}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ATS Integrations */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">ATS Integrations</h2>
                <p className="text-sm text-slate-600 mt-1">Sync assessment data with your applicant tracking system</p>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Manage Integrations
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {atsIntegrations.map((integration) => (
              <div
                key={integration.name}
                className="border border-slate-200 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-2xl">
                    {integration.logo}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{integration.name}</h3>
                    {integration.status === 'Connected' ? (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span>Last sync: {integration.lastSync}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                        <span>Not connected</span>
                      </div>
                    )}
                  </div>
                </div>
                {integration.status === 'Connected' ? (
                  <Button size="sm" variant="outline">
                    Sync Now
                  </Button>
                ) : (
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    Connect
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Custom Export</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Assessment</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option>Senior Full Stack Developer</option>
                <option>Backend Developer</option>
                <option>DevOps Engineer</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Format</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option>PDF</option>
                <option>CSV</option>
                <option>XLSX</option>
                <option>JSON</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Include</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option>All Candidates</option>
                <option>Qualified Only</option>
                <option>Top 10</option>
                <option>Flagged Only</option>
              </select>
            </div>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Download className="w-4 h-4 mr-2" />
            Generate Custom Report
          </Button>
        </div>

        {/* Schedule Reports */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-2">Scheduled Reports</h3>
              <p className="text-sm text-slate-600 mb-4">
                Set up automatic report generation and delivery to your email or integrated systems
              </p>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configure Schedule
              </Button>
            </div>
          </div>
        </div>
      </div>
    </RecruiterLayout>
  );
}
