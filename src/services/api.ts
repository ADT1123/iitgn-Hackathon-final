import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';

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

// Auth API
export const authAPI = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

// Job API
export const jobAPI = {
  getJobs: (params?: any) => api.get('/jobs', { params }),
  getJobById: (id: string) => api.get(`/jobs/${id}`),
  createJob: (jobData: any) => api.post('/jobs', jobData),
  updateJob: (id: string, jobData: any) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id: string) => api.delete(`/jobs/${id}`),
  parseJD: (jdText: string) => api.post('/jobs/parse-jd', { jdText }),
  getStats: () => api.get('/jobs/stats'),
};


// Application API (UPDATED)
export const applicationAPI = {
  getApplications: (params?: any) => api.get('/applications', { params }),
  getApplicationById: (id: string) => api.get(`/applications/${id}`),
  submitApplication: (applicationId: string, answers: any[]) => 
    api.post('/applications/submit', { applicationId, answers }),
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

// Analytics API
export const analyticsAPI = {
  getJobAnalytics: (jobId: string) => api.get(`/analytics/jobs/${jobId}`),
  getLeaderboard: (jobId: string) => api.get(`/leaderboard/${jobId}`),
  exportData: (jobId: string, format: string) => 
    api.get(`/analytics/export/${jobId}`, { 
      params: { format },
      responseType: 'blob' 
    }),
};

// Settings API
export const settingsAPI = {
  updateProfile: (data: any) => api.put('/auth/profile', data),
  updatePassword: (data: any) => api.put('/auth/password', data),
  updateCompany: (data: any) => api.put('/auth/company', data),
};

// Add to existing api.ts

// Resume API (NEW)
export const resumeAPI = {
  uploadAndScreen: (jobId: string, file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobId', jobId);
    return api.post('/resumes/screen', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  bulkScreenResumes: (jobId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('resumes', file));
    formData.append('jobId', jobId);
    return api.post('/resumes/bulk-screen', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  getEligibilityReport: (applicationId: string) => 
    api.get(`/resumes/${applicationId}/eligibility-report`),
  
  checkSkillMismatch: (applicationId: string) => 
    api.post(`/resumes/${applicationId}/check-mismatch`),
};


// Add to existing api.ts

// Public Assessment API (no auth required)
export const publicAssessmentAPI = {
  getByLink: (link: string) => 
    axios.get(`${API_BASE_URL}/assessments/public/${link}`),
  
  submit: (link: string, data: any) => 
    axios.post(`${API_BASE_URL}/assessments/public/${link}/submit`, data),
};

// Assessment API
export const assessmentAPI = {
  getAssessments: (params?: any) => api.get('/assessments', { params }),
  getAssessmentById: (id: string) => api.get(`/assessments/${id}`),
  generateQuestions: (jobId: string, config: any) => 
    api.post('/assessments/generate', { jobId, ...config }),
  updateAssessment: (id: string, data: any) => api.put(`/assessments/${id}`, data),
  deleteAssessment: (id: string) => api.delete(`/assessments/${id}`),
  toggleLinkStatus: (id: string) => api.patch(`/assessments/${id}/toggle-link`),
};


export default api;
