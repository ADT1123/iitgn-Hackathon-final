import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Settings,
  LogOut,
  Sparkles,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    {
      group: 'General',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics' },
      ]
    },
    {
      group: 'Recruitment',
      items: [
        { icon: Briefcase, label: 'Jobs', path: '/jobs' },
        { icon: Users, label: 'Candidates', path: '/candidates' },
      ]
    },
    {
      group: 'Tools',
      items: [
        { icon: Sparkles, label: 'AI Screening', path: '/resume-screening' },
        { icon: FileText, label: 'Assessments', path: '/assessments' },
      ]
    },
    {
      group: 'Account',
      items: [
        { icon: Settings, label: 'Settings', path: '/settings' },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">HireAI</h1>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Recruiter Portal</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto custom-scrollbar">
        {menuItems.map((group) => (
          <div key={group.group}>
            <h3 className="px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {group.group}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive(item.path)
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive(item.path) ? 'text-blue-600' : 'text-slate-400'
                    }`} />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
