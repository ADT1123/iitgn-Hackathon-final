import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RecruiterDashboard from './pages/RecruiterDashboard';
import JobUploadPage from './pages/JobUploadPage';
import AssessmentBuilderPage from './pages/AssessmentBuilderPage';
import CandidateAssessmentPage from './pages/CandidateAssessmentPage';
import EvaluationResultsPage from './pages/EvaluationResultsPage';
import CandidateAnalyticsPage from './pages/CandidateAnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

export type UserRole = 'recruiter' | 'candidate' | null;

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
    if (role === 'recruiter') {
      navigate('dashboard');
    } else {
      navigate('candidate-assessment');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setIsAuthenticated(false);
    navigate('landing');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage navigate={navigate} />;
      case 'login':
        return <LoginPage navigate={navigate} onLogin={handleLogin} />;
      case 'signup':
        return <SignupPage navigate={navigate} onLogin={handleLogin} />;
      case 'dashboard':
        return <RecruiterDashboard navigate={navigate} onLogout={handleLogout} />;
      case 'job-upload':
        return <JobUploadPage navigate={navigate} onLogout={handleLogout} />;
      case 'assessment-builder':
        return <AssessmentBuilderPage navigate={navigate} onLogout={handleLogout} />;
      case 'candidate-assessment':
        return <CandidateAssessmentPage navigate={navigate} onLogout={handleLogout} userRole={userRole} />;
      case 'evaluation-results':
        return <EvaluationResultsPage navigate={navigate} onLogout={handleLogout} />;
      case 'candidate-analytics':
        return <CandidateAnalyticsPage navigate={navigate} onLogout={handleLogout} />;
      case 'reports':
        return <ReportsPage navigate={navigate} onLogout={handleLogout} />;
      case 'settings':
        return <SettingsPage navigate={navigate} onLogout={handleLogout} />;
      default:
        return <LandingPage navigate={navigate} />;
    }
  };

  return (
    <div className="size-full bg-slate-50">
      {renderPage()}
    </div>
  );
}
