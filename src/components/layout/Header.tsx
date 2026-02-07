import React from 'react';
import { Search, Bell, User, ChevronDown } from 'lucide-react';

interface HeaderProps {
  user: {
    name: string;
    role: string;
    email: string;
    company?: string;
  };
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-64 z-10 transition-all duration-300">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search candidates, jobs, or reports..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-sm placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-6">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
          </button>

          <div className="h-8 w-px bg-slate-200"></div>

          <button className="flex items-center gap-3 p-1 pl-2 hover:bg-slate-50 rounded-lg transition-colors group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 leading-none">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight mt-1">
                {user.company || 'Recruiter'}
              </p>
            </div>
            <div className="w-9 h-9 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 group-hover:bg-white transition-colors">
              <User className="w-5 h-5" />
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
};
