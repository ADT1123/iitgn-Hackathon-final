/// <reference types="vite/client" />
import axios, { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// AUTH
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
};

// JOBS
export const jobAPI = {
  getJobs: (params?: any) => api.get('/jobs', { params }),
  getJobById: (id: string) => api.get(`/jobs/${id}`),
  createJob: (data: any) => api.post('/jobs', data),
  updateJob: (id: string, data: any) => api.put(`/jobs/${id}`, data),
  deleteJob: (id: string) => api.delete(`/jobs/${id}`),
  parseJD: (jd: string) => api.post('/jobs/parse', { jd }),
};

// ASSESSMENTS
export const assessmentAPI = {
  getAssessments: (params?: any) => api.get('/assessments', { params }),
  getAssessmentById: (id: string) => api.get(`/assessments/${id}`),
  createAssessment: (data: any) => api.post('/assessments', data),
  generateQuestions: (jobId: string, config: any) => api.post(`/assessments/${jobId}/generate`, config),
  publishAssessment: (id: string) => api.post(`/assessments/${id}/publish`),
};

// APPLICATIONS
export const applicationAPI = {
  getApplications: (params?: any) => api.get('/applications', { params }),
  getApplicationById: (id: string) => api.get(`/applications/${id}`),
  updateStatus: (id: string, status: string) => api.put(`/applications/${id}/status`, { status }),
  bulkUpdate: (ids: string[], status: string) => api.post('/applications/bulk-update', { ids, status }),
  getAnalytics: (id: string) => api.get(`/applications/${id}/analytics`),
  downloadReport: (id: string, format: string) => 
    api.get(`/applications/${id}/report`, { params: { format }, responseType: 'blob' }),
};

// ANALYTICS
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getJobAnalytics: (jobId: string) => api.get(`/analytics/jobs/${jobId}`),
  getLeaderboard: (jobId: string) => api.get(`/analytics/jobs/${jobId}/leaderboard`),
  exportData: (jobId: string, format: string) => 
    api.get(`/analytics/jobs/${jobId}/export`, { params: { format }, responseType: 'blob' }),
};

export default api;
