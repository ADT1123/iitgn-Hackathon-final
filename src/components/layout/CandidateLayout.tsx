
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, FileText, User, LogOut, LayoutDashboard } from 'lucide-react';

interface CandidateLayoutProps {
    children: React.ReactNode;
}

export const CandidateLayout: React.FC<CandidateLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/candidate/dashboard' },
        { label: 'Jobs', icon: Briefcase, path: '/candidate/jobs' },
        { label: 'Applications', icon: FileText, path: '/candidate/applications' },
        { label: 'Profile', icon: User, path: '/candidate/profile' },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-slate-900">HireAI</h1>
                            <span className="ml-2 text-xs text-slate-500 hidden sm:block">Candidate Portal</span>
                        </div>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex space-x-8">
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${window.location.pathname === item.path
                                            ? 'border-blue-500 text-slate-900'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    <item.icon className="w-4 h-4 mr-2" />
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        {/* User Menu */}
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-right hidden sm:block">
                                <p className="font-medium text-slate-900">{user.name || 'Candidate'}</p>
                                <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
};
