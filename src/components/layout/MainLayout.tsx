import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // Mock user for header
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "Recruiter", "role": "admin", "company": "HireAI"}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar onLogout={handleLogout} />

      <div className="flex-1 ml-64 flex flex-col min-h-screen transition-all duration-300">
        <Header user={user} />

        <main className="flex-1 p-8 pt-24 max-w-6xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};
