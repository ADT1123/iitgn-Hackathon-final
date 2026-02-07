import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      group: 'OVERVIEW',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics' },
      ]
    },
    {
      group: 'RECRUITMENT',
      items: [
        { icon: Briefcase, label: 'Jobs', path: '/jobs' },
        { icon: Users, label: 'Candidates', path: '/candidates' },
      ]
    },
    {
      group: 'AI TOOLS',
      items: [
        { icon: Sparkles, label: 'Resume Screening', path: '/resume-screening', highlighted: true },
        { icon: FileText, label: 'Assessments', path: '/assessments' },
      ]
    },
    {
      group: 'SYSTEM',
      items: [
        { icon: Settings, label: 'Settings', path: '/settings' },
      ]
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 h-screen flex flex-col fixed left-0 top-0 z-20 shadow-xl">
      {/* Logo */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">HireAI</h1>
          <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">Recruiter Pro</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-2 space-y-8 overflow-y-auto custom-scrollbar">
        {menuItems.map((group) => (
          <div key={group.group} className="space-y-2">
            <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-4">
              {group.group}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${isActive(item.path)
                      ? 'bg-blue-600/10 text-blue-400 font-semibold'
                      : 'hover:bg-slate-800 hover:text-white'
                    } ${item.highlighted ? 'relative' : ''}`}
                >
                  <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'
                    }`} />
                  <span className="text-sm">{item.label}</span>
                  {isActive(item.path) && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                  )}
                  {item.highlighted && !isActive(item.path) && (
                    <span className="ml-auto flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 bg-slate-800/50 mt-auto border-t border-slate-800/50">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
