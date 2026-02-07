// src/App.tsx - FIXED VERSION (Remove user/onLogout props)
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate
} from 'react-router-dom';
import { Toaster } from './components/ui/toaster.tsx'; // Capital T

// ===== YOUR EXISTING PAGES =====
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ResumeScreeningPage } from './pages/resume/ResumeScreeningPage';
import { JobsPage } from './pages/jobs/JobsPage';
import { CreateJobPage } from './pages/jobs/CreateJobPage';
import { JobDetailsPage } from './pages/jobs/JobDetailsPage';
import { AssessmentsPage } from './pages/assessments/AssessmentsPage';
import { CreateAssessmentPage } from './pages/assessments/CreateAssessmentPage';
import { AssessmentDetailsPage } from './pages/assessments/AssessmentDetailsPage';
import { CandidatesPage } from './pages/candidates/CandidatesPage';
import { CandidateDetailsPage } from './pages/candidates/CandidateDetailsPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { TakeAssessmentPage } from './pages/public/TakeAssessmentPage';

// ===== NEW CANDIDATE PAGES =====
import { CandidateDashboard } from './pages/candidate/CandidateDashboard';
import { CandidateJobs } from './pages/candidate/CandidateJobs';
import { CandidateAssessment } from './pages/candidate/CandidateAssessment';
import { CandidateApplications } from './pages/candidate/CandidateApplications';
import { CandidateProfile } from './pages/candidate/CandidateProfile';

// ===== LAYOUT =====
import { MainLayout } from './components/layout/MainLayout';
import { CandidateLayout } from './components/layout/CandidateLayout';
import { authAPI } from './services/api';

// ===== PROTECTED ROUTE COMPONENT =====
const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: string }> = ({
  children,
  role
}) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role) {
    const parsedUser = JSON.parse(user);
    if (parsedUser.role !== role) {
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

// ===== MAIN APP CONTENT =====
function AppContent() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setLoading(false);

      // Verify token
      authAPI.me()
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData: any) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
    setUser(userData.user);

    if (userData.user.role === 'candidate') {
      navigate('/candidate/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route
          path="/login"
          element={
            !user ? (
              <LoginPage onLogin={handleLogin} />
            ) : (
              <Navigate to={user.role === 'candidate' ? '/candidate/dashboard' : '/dashboard'} replace />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !user ? (
              <SignupPage onLogin={handleLogin} />
            ) : (
              <Navigate to={user.role === 'candidate' ? '/candidate/dashboard' : '/dashboard'} replace />
            )
          }
        />
        <Route path="/take-assessment/:link" element={<TakeAssessmentPage />} />

        {/* CANDIDATE ROUTES - ✅ REMOVED user/onLogout props */}
        <Route
          path="/candidate/dashboard"
          element={
            <ProtectedRoute role="candidate">
              <CandidateLayout>
                <CandidateDashboard />
              </CandidateLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/jobs"
          element={
            <ProtectedRoute role="candidate">
              <CandidateLayout>
                <CandidateJobs />
              </CandidateLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/assessment/:assessmentId"
          element={
            <ProtectedRoute role="candidate">
              <CandidateLayout>
                <CandidateAssessment />
              </CandidateLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/applications"
          element={
            <ProtectedRoute role="candidate">
              <CandidateLayout>
                <CandidateApplications />
              </CandidateLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/profile"
          element={
            <ProtectedRoute role="candidate">
              <CandidateLayout>
                <CandidateProfile />
              </CandidateLayout>
            </ProtectedRoute>
          }
        />

        {/* RECRUITER ROUTES - ✅ REMOVED user/onLogout props */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="recruiter">
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume-screening"
          element={
            <ProtectedRoute role="recruiter">
              <MainLayout>
                <ResumeScreeningPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute role="recruiter">
              <MainLayout>
                <JobsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/create"
          element={
            <ProtectedRoute role="recruiter">
              <MainLayout>
                <CreateJobPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <ProtectedRoute role="recruiter">
              <MainLayout>
                <JobDetailsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments"
          element={
            <ProtectedRoute role="recruiter">
              <MainLayout>
                <AssessmentsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments/create"
          element={
            <ProtectedRoute role="recruiter">
              <MainLayout>
                <CreateAssessmentPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments/:id"
          element={
            <ProtectedRoute role="recruiter">
              <MainLayout>
                <AssessmentDetailsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidates"
          element={
            <ProtectedRoute role="recruiter">
              <MainLayout>
                <CandidatesPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidates/:id"
          element={
            <ProtectedRoute role="recruiter">
              <MainLayout>
                <CandidateDetailsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute role="recruiter">
              <MainLayout>
                <AnalyticsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute role="recruiter">
              <MainLayout>
                <SettingsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* DEFAULT ROUTES */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

// ===== MAIN APP COMPONENT =====
function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AppContent />
    </Router>
  );
}

export default App;
