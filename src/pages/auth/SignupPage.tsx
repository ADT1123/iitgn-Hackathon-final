// src/pages/auth/SignupPage.tsx - UPDATED WITH ROLE SELECTION
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authAPI } from '@/services/api';
import { UserPlus, AlertCircle, User, Users, Building2, Phone } from 'lucide-react';

interface SignupPageProps {
  onLogin?: (userData: any) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate'); // NEW: Role state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '', // NEW: Last name field
    email: '',
    phone: '', // NEW: Phone field
    password: '',
    company: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Required fields based on role
    const requiredFields = ['firstName', 'email', 'password'];
    if (role === 'recruiter') requiredFields.push('company');
    if (!formData.firstName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Send role to backend
      const signupData = {
        ...formData,
        role // NEW: Send role to backend
      };
      
      const response = await authAPI.register(signupData);
      
      // NEW: Auto-login after successful registration
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Role-based redirect
      navigate(user.role === 'candidate' ? '/candidate/dashboard' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
          <p className="text-slate-600">Get started with HireAI</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <form onSubmit={handleSignup} className="space-y-6">
            {/* NEW: Role Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    role === 'candidate'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-slate-900 text-sm">Candidate</h3>
                    <p className="text-xs text-slate-500">Apply to jobs</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('recruiter')}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    role === 'recruiter'
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-slate-900 text-sm">Recruiter</h3>
                    <p className="text-xs text-slate-500">Hire talent</p>
                  </div>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* NEW: Split first/last name */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name *"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                required
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
              />
            </div>

            <Input
              label="Email *"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@company.com"
              required
            />

            {/* NEW: Phone field */}
            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
            />

            {/* Company field - conditional styling */}
            <Input
              label={role === 'recruiter' ? "Company Name *" : "Company (Optional)"}
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder={role === 'recruiter' ? "Tech Corp" : "Your Company"}
              className={role === 'recruiter' ? "ring-1 ring-purple-200" : ""}
              required={role === 'recruiter'}
            />

            <Input
              label="Password *"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <Button type="submit" className="w-full" loading={loading}>
              <UserPlus className="w-4 h-4 mr-2" />
              {loading ? 'Creating...' : `Create ${role} Account`}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-slate-600 pt-4 border-t border-slate-200">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
