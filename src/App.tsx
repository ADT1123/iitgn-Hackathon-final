import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';


import { AssessmentDetailsPage } from './pages/assessments/AssessmentDetailsPage';
import { TakeAssessmentPage } from './pages/public/TakeAssessmentPage';

// Dashboard
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ResumeScreeningPage } from './pages/resume/ResumeScreeningPage';
// Jobs
import { JobsPage } from './pages/jobs/JobsPage';
import { CreateJobPage } from './pages/jobs/CreateJobPage';
import { JobDetailsPage } from './pages/jobs/JobDetailsPage';

// Assessments
import { AssessmentsPage } from './pages/assessments/AssessmentsPage';
import { CreateAssessmentPage } from './pages/assessments/CreateAssessmentPage';

// Candidates
import { CandidatesPage } from './pages/candidates/CandidatesPage';
import { CandidateDetailsPage } from './pages/candidates/CandidateDetailsPage';

// Analytics
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';

// Settings
import { SettingsPage } from './pages/settings/SettingsPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Jobs */}
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <JobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments/:id"
          element={
            <ProtectedRoute>
              <AssessmentDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/take-assessment/:link"
          element={<TakeAssessmentPage />}
        />

        <Route
          path="/resume-screening"
          element={
            <ProtectedRoute>
              <ResumeScreeningPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/create"
          element={
            <ProtectedRoute>
              <CreateJobPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <ProtectedRoute>
              <JobDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Assessments */}
        <Route
          path="/assessments"
          element={
            <ProtectedRoute>
              <AssessmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments/create"
          element={
            <ProtectedRoute>
              <CreateAssessmentPage />
            </ProtectedRoute>
          }
        />

        {/* Candidates */}
        <Route
          path="/candidates"
          element={
            <ProtectedRoute>
              <CandidatesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidates/:id"
          element={
            <ProtectedRoute>
              <CandidateDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Analytics */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
