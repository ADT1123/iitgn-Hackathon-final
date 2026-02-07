import React from 'react';
import { Bell, Search, User, ChevronDown } from 'lucide-react';

interface HeaderProps {
  user: any;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 fixed top-0 right-0 left-64 z-10 transition-all duration-300">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="group relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search jobs, candidates, or reports..."
              className="w-full pl-12 pr-4 py-2.5 bg-slate-100/50 border-transparent border focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 rounded-2xl transition-all duration-200 outline-none text-sm placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button className="relative p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
          </div>

          <div className="flex items-center gap-3 pl-6 border-l border-slate-200 group cursor-pointer">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-tighter">{user?.company || 'Recruiter'}</p>
            </div>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 overflow-hidden">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm">
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
