// src/services/api.ts - Enhanced with all 20 feature APIs
import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== AUTH API =====
export const authAPI = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  updatePassword: (data: any) => api.put('/auth/password', data),
  me: () => api.get('/auth/me'),
};

// ===== JOB API =====
export const jobsAPI = {
  getJobs: (params?: any) => api.get('/jobs', { params }),
  getJobById: (id: string) => api.get(`/jobs/${id}`),
  createJob: (jobData: any) => api.post('/jobs', jobData),
  updateJob: (id: string, jobData: any) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id: string) => api.delete(`/jobs/${id}`),
  parseJD: (jdText: string) => api.post('/jobs/parse-jd', { jdText }),
  getStats: () => api.get('/jobs/stats'),
};

export const jobAPI = jobsAPI;

// ===== APPLICATION API =====
export const applicationAPI = {
  getApplications: (params?: any) => api.get('/applications', { params }),
  getMyApplications: () => api.get('/applications/my-applications'),
  getApplicationById: (id: string) => api.get(`/applications/${id}`),

  // New methods for assessment flow
  startAssessment: (jobId: string) => api.post(`/applications/start/${jobId}`),
  submitAnswer: (applicationId: string, data: any) => api.post(`/applications/${applicationId}/answer`, data),

  submitApplication: (applicationId: string, data: any) => api.post(`/applications/${applicationId}/submit`, data),

  updateStatus: (id: string, status: string) =>
    api.patch(`/applications/${id}/status`, { status }),
  bulkUpdate: (ids: string[], status: string) =>
    api.post('/applications/bulk-update', { ids, status }),
  getAnalytics: (id: string) => api.get(`/applications/${id}/analytics`),
  downloadReport: (id: string, format: string) =>
    api.get(`/applications/${id}/report`, {
      params: { format },
      responseType: 'blob'
    }),
};

// ===== ASSESSMENT API =====
export const assessmentAPI = {
  getAssessments: (params?: any) => api.get('/assessments', { params }),
  getAssessmentById: (id: string) => api.get(`/assessments/${id}`),
  generateQuestions: (jobId: string, config: any) =>
    api.post('/assessments/generate', { jobId, ...config }),
  updateAssessment: (id: string, data: any) => api.put(`/assessments/${id}`, data),
  deleteAssessment: (id: string) => api.delete(`/assessments/${id}`),
  toggleLinkStatus: (id: string) => api.patch(`/assessments/${id}/toggle-link`),
  createAssessment: (data: any) => api.post('/assessments', data),
};

// ===== PUBLIC ASSESSMENT API =====
export const publicAssessmentAPI = {
  getByLink: (link: string) =>
    axios.get(`${API_BASE_URL}/assessments/public/${link}`),
  submit: (link: string, data: any) =>
    axios.post(`${API_BASE_URL}/assessments/public/${link}/submit`, data),
};

// Resume API
export const resumeAPI = {
  uploadAndScreen: (jobId: string, file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobId', jobId);
    return api.post(`/jobs/${jobId}/screen`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  bulkScreenResumes: (jobId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('resumes', file));
    return api.post(`/jobs/${jobId}/bulk-screen`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  screenResume: (formData: FormData) => api.post('/resume/screen', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getEligibilityReport: (applicationId: string) =>
    api.get(`/resumes/${applicationId}/eligibility-report`),
  checkSkillMismatch: (applicationId: string) =>
    api.post(`/resumes/${applicationId}/check-mismatch`),
};

// ===== ANALYTICS API (FEATURE 13, 14, 15, 18) =====
export const analyticsAPI = {
  getOverview: (timeRange = 'week') => api.get(`/analytics/overview?range=${timeRange}`),
  getJobPerformance: (jobId: string) => api.get(`/analytics/jobs/${jobId}`),
  getCandidateFunnel: () => api.get('/analytics/funnel'),
  getDiversityStats: () => api.get('/analytics/diversity'),

  // Dashboard
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getJobAnalytics: (jobId: string) => api.get(`/analytics/jobs/${jobId}`),

  // Leaderboard (FEATURE 14)
  getLeaderboard: (jobId: string, options?: { limit?: number; includeDetails?: boolean }) =>
    api.get(`/leaderboard/${jobId}`, { params: options }),

  // Skill Gap (FEATURE 15)
  getSkillGapAnalysis: (jobId: string) => api.get(`/analytics/jobs/${jobId}/skill-gap`),
  getCandidateSkillGap: (applicationId: string) =>
    api.get(`/analytics/candidates/${applicationId}/skill-gap`),

  // Section Breakdown (FEATURE 18)
  getSectionBreakdown: (applicationId: string) =>
    api.get(`/analytics/candidates/${applicationId}/sections`),

  // Reports (FEATURE 11)
  generateCandidateReport: (applicationId: string, format: string = 'json') =>
    api.get(`/analytics/candidates/${applicationId}/report`, {
      params: { format },
      responseType: format === 'pdf' ? 'blob' : 'json'
    }),
  generateBulkReport: (jobId: string) => api.get(`/analytics/jobs/${jobId}/bulk-report`),

  // Export (FEATURE 12)
  exportData: (jobId: string, format: string) =>
    api.get(`/analytics/export/${jobId}`, {
      params: { format },
      responseType: 'blob'
    }),
  exportForATS: (jobId: string, atsFormat: string = 'generic') =>
    api.get(`/analytics/export/${jobId}/ats`, { params: { atsFormat } }),
};

// ===== PROCTORING API (FEATURE 6, 9, 10) =====
export const proctoringAPI = {
  // Anti-Bot (FEATURE 9)
  analyzeSubmission: (applicationId: string) =>
    api.get(`/proctoring/analysis/${applicationId}`),
  getBulkIntegrityAnalysis: (jobId: string) =>
    api.get(`/proctoring/bulk-analysis/${jobId}`),

  // Activity Tracking (FEATURE 10)
  trackActivity: (applicationId: string, activity: {
    activityType: string;
    questionId?: string;
    details?: string;
    severity?: string;
  }) => api.post(`/proctoring/activity/${applicationId}`, activity),
  getTimeAnalysis: (applicationId: string) =>
    api.get(`/proctoring/time-analysis/${applicationId}`),
  getProctoringReport: (applicationId: string) =>
    api.get(`/proctoring/report/${applicationId}`),

  // Plagiarism (FEATURE 6)
  checkCodePlagiarism: (data: {
    code: string;
    language: string;
    questionId: string;
    applicationId: string;
  }) => api.post('/proctoring/plagiarism/check', data),
  batchCheckPlagiarism: (submissions: any[]) =>
    api.post('/proctoring/plagiarism/batch', { submissions }),

  // Integrity
  getCandidateIntegrity: (applicationId: string) =>
    api.get(`/proctoring/integrity/${applicationId}`),
};

// ===== CANDIDATES API =====
export const candidatesAPI = {
  getCandidates: (params?: any) => api.get('/candidates', { params }),
  getCandidateById: (id: string) => api.get(`/candidates/${id}`),
  updateCandidateStatus: (id: string, status: string) =>
    api.patch(`/candidates/${id}/status`, { status }),
};

// ===== SETTINGS API =====
export const settingsAPI = {
  updateProfile: (data: any) => api.put('/auth/profile', data),
  updatePassword: (data: any) => api.put('/auth/password', data),
  updateCompany: (data: any) => api.put('/auth/company', data),
};

export default api;
export { api };
