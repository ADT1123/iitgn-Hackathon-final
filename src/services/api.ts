import axios from 'axios';

// Fix for import.meta.env
const getApiUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  }
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// Job APIs
export const jobAPI = {
  getJobs: () => api.get('/jobs'),
  getJobById: (id: string) => api.get(`/jobs/${id}`),
  createJob: (data: any) => api.post('/jobs', data),
  generateAssessment: (jobId: string) => api.post(`/jobs/${jobId}/generate-assessment`)
};

// Application APIs
export const applicationAPI = {
  startAssessment: (jobId: string) => api.post(`/applications/start/${jobId}`),
  submitAnswer: (applicationId: string, data: any) => 
    api.post(`/applications/${applicationId}/submit-answer`, data),
  submitAssessment: (applicationId: string) => 
    api.post(`/applications/${applicationId}/submit`),
  getApplications: () => api.get('/applications'),
  getApplicationById: (id: string) => api.get(`/applications/${id}`)
};

// Candidate APIs
export const candidateAPI = {
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/candidates/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getProfile: () => api.get('/candidates/profile')
};

// Leaderboard APIs
export const leaderboardAPI = {
  getLeaderboard: (jobId: string) => api.get(`/leaderboard/${jobId}`)
};

export default api;
