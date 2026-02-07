// src/pages/auth/LoginPage.tsx - UPDATED WITH ROLE SWITCHER
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authAPI } from '@/services/api';
import { LogIn, AlertCircle, User, Users } from 'lucide-react';

interface LoginPageProps {
  onLogin?: (userData: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate'); // NEW: Role state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      // Send role to backend for filtering
      const response = await authAPI.login({ 
        email, 
        password,
        role // NEW: Send role to backend
      });
      
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Role-based redirect (NEW)
      navigate(user.role === 'candidate' ? '/candidate/dashboard' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">HireAI</h1>
          <p className="text-slate-600">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* NEW: Role Switcher */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Login as
              </label>
              <div className="flex bg-slate-100 rounded-lg p-1 border-2 border-slate-200">
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    role === 'candidate'
                      ? 'bg-white shadow-sm border-2 border-blue-300 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setRole('recruiter')}
                  className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    role === 'recruiter'
                      ? 'bg-white shadow-sm border-2 border-purple-300 text-purple-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Recruiter
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {role === 'candidate' ? 'Apply to jobs and take assessments' : 'Manage jobs and screen candidates'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Button type="submit" className="w-full" loading={loading}>
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? 'Signing in...' : `Sign In as ${role}`}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-slate-600 pt-4 border-t border-slate-200">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
