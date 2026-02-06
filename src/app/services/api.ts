import axios, { AxiosInstance, AxiosError } from 'axios';

// Fix for import.meta.env
const getApiUrl = (): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';
  }
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // ✅ ADDED: 30 second timeout
});

// ✅ Request Interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🔵 API Request:', config.method?.toUpperCase(), config.url); // ✅ Debug log
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ✅ Response Interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status); // ✅ Debug log
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ Response Error:', error.response?.data || error.message);
    
    // ✅ Handle 401 Unauthorized - Auto logout
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/'; // Redirect to login
    }
    
    // ✅ Handle 403 Forbidden
    if (error.response?.status === 403) {
      alert('Access denied. Please check your permissions.');
    }
    
    // ✅ Handle 500 Server Error
    if (error.response?.status === 500) {
      alert('Server error. Please try again later.');
    }
    
    // ✅ Handle Network Error
    if (error.message === 'Network Error') {
      alert('Cannot connect to server. Please check if backend is running.');
    }
    
    return Promise.reject(error);
  }
);

// ========================================
// 🔐 AUTH APIs
// ========================================
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'), // ✅ ADDED
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }), // ✅ ADDED
  resetPassword: (token: string, password: string) => 
    api.post('/auth/reset-password', { token, password }) // ✅ ADDED
};

// ========================================
// 📄 JOB APIs
// ========================================
export const jobAPI = {
  getJobs: (params?: { page?: number; limit?: number; status?: string }) => 
    api.get('/jobs', { params }), // ✅ ADDED: Query params
  getJobById: (id: string) => api.get(`/jobs/${id}`),
  createJob: (data: any) => api.post('/jobs', data),
  updateJob: (jobId: string, data: any) => api.put(`/jobs/${jobId}`, data),
  deleteJob: (jobId: string) => api.delete(`/jobs/${jobId}`), // ✅ ADDED
  generateAssessment: (jobId: string) => api.post(`/jobs/${jobId}/generate-assessment`),
  publishAssessment: (jobId: string) => api.post(`/jobs/${jobId}/publish`), // ✅ ADDED
  getJobStats: (jobId: string) => api.get(`/jobs/${jobId}/stats`) // ✅ ADDED
};

// ========================================
// ❓ QUESTION APIs
// ========================================
export const questionAPI = {
  getQuestions: (jobId: string) => api.get(`/jobs/${jobId}/questions`),
  addQuestion: (jobId: string, data: any) => api.post(`/jobs/${jobId}/questions`, data),
  updateQuestion: (jobId: string, questionId: string, data: any) => 
    api.put(`/jobs/${jobId}/questions/${questionId}`, data),
  deleteQuestion: (jobId: string, questionId: string) => 
    api.delete(`/jobs/${jobId}/questions/${questionId}`),
  regenerateQuestions: (jobId: string, skill?: string) => 
    api.post(`/jobs/${jobId}/questions/regenerate`, { skill })
};

// ========================================
// 📝 APPLICATION APIs
// ========================================
export const applicationAPI = {
  startAssessment: (jobId: string) => api.post(`/applications/start/${jobId}`),
  submitAnswer: (applicationId: string, data: any) => 
    api.post(`/applications/${applicationId}/submit-answer`, data),
  submitAssessment: (applicationId: string) => 
    api.post(`/applications/${applicationId}/submit`),
  getApplications: (params?: { jobId?: string; status?: string; page?: number }) => 
    api.get('/applications', { params }), // ✅ ADDED: Query params
  getApplicationById: (id: string) => api.get(`/applications/${id}`),
  updateStatus: (applicationId: string, status: string) => 
    api.put(`/applications/${applicationId}/status`, { status }), // ✅ ADDED
  getAnalytics: (applicationId: string) => 
    api.get(`/applications/${applicationId}/analytics`), // ✅ ADDED
  downloadReport: (applicationId: string, format: 'pdf' | 'csv' | 'json') =>
    api.get(`/applications/${applicationId}/report`, {
      params: { format },
      responseType: 'blob'
    }) // ✅ ADDED
};

// ========================================
// 👤 CANDIDATE APIs
// ========================================
export const candidateAPI = {
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/candidates/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getProfile: () => api.get('/candidates/profile'),
  updateProfile: (data: any) => api.put('/candidates/profile', data) // ✅ ADDED
};

// ========================================
// 📊 LEADERBOARD APIs
// ========================================
export const leaderboardAPI = {
  getLeaderboard: (jobId: string, params?: { limit?: number }) => 
    api.get(`/leaderboard/${jobId}`, { params })
};

// ========================================
// 📈 ANALYTICS APIs (New)
// ========================================
export const analyticsAPI = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getHiringTrends: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/analytics/trends', { params }),
  generateReport: (data: {
    jobId?: string;
    type: 'complete' | 'skills' | 'coding';
    format: 'pdf' | 'csv' | 'json';
  }) => api.post('/analytics/reports/generate', data),
  getReports: (params?: { page?: number; limit?: number }) =>
    api.get('/analytics/reports', { params }),
  downloadReport: (reportId: string) =>
    api.get(`/analytics/reports/${reportId}/download`, {
      responseType: 'blob'
    })
};

// ========================================
// ⚙️ SETTINGS APIs (New)
// ========================================
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateProfile: (data: any) => api.put('/settings/profile', data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/settings/password', data),
  updateAssessmentSettings: (data: any) => api.put('/settings/assessment', data),
  updateNotifications: (data: any) => api.put('/settings/notifications', data),
  getTeamMembers: () => api.get('/settings/team'),
  inviteTeamMember: (data: { email: string; role: string }) =>
    api.post('/settings/team/invite', data),
  removeTeamMember: (userId: string) => api.delete(`/settings/team/${userId}`)
};

// ========================================
// 🔒 PROCTORING APIs (New)
// ========================================
export const proctoringAPI = {
  trackActivity: (data: {
    applicationId: string;
    eventType: 'tab_switch' | 'copy' | 'paste' | 'screenshot';
    timestamp: string;
  }) => api.post('/proctoring/track', data),
  getLogs: (applicationId: string) => api.get(`/proctoring/${applicationId}/logs`),
  checkPlagiarism: (data: { code: string; language: string }) =>
    api.post('/proctoring/plagiarism', data)
};

// ========================================
// 💻 CODE EXECUTION APIs (New)
// ========================================
export const codeExecutionAPI = {
  executeCode: (data: {
    code: string;
    language: string;
    testCases?: any[];
    timeLimit?: number;
  }) => api.post('/code/execute', data),
  validateCode: (data: { code: string; language: string; questionId: string }) =>
    api.post('/code/validate', data),
  getSupportedLanguages: () => api.get('/code/languages')
};

// ========================================
// 🔔 NOTIFICATION APIs (New)
// ========================================
export const notificationAPI = {
  getNotifications: (params?: { page?: number; limit?: number }) =>
    api.get('/notifications', { params }),
  markAsRead: (notificationId: string) =>
    api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (notificationId: string) =>
    api.delete(`/notifications/${notificationId}`)
};

// ========================================
// 🛠️ UTILITY FUNCTIONS
// ========================================

// ✅ File Upload Helper
export const uploadFile = async (file: File, endpoint: string) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// ✅ Download File Helper
export const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await api.get(url, { responseType: 'blob' });
    const blob = new Blob([response.data]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('❌ Download error:', error);
    throw error;
  }
};

// ========================================
// 🎯 EXPORT DEFAULT
// ========================================
export default api;

// ✅ Also export API instance for direct use
export { api };
