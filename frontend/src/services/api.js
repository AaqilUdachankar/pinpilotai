import axios from 'axios';

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
// Ensure API_BASE always resolves cleanly to the backend's /api prefix
const API_BASE = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/+$/, '')}/api`)
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

// Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pinpilot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('pinpilot_token');
        localStorage.removeItem('pinpilot_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  googleLogin: (payload) => api.post('/auth/google', payload),
  getMe: () => api.get('/auth/me'),
  getApiUsage: () => api.get('/auth/api-usage'),
  updateSettings: (data) => api.put('/auth/settings', data),
};

// Campaigns Endpoints
export const campaignAPI = {
  analyzeUrl: (url) => api.post('/campaigns/analyze', { url }),
  getNextSlot: (interval = 60) => api.get('/campaigns/next-slot', { params: { interval } }),
  createCampaign: (data) => api.post('/campaigns', data),
  getCampaigns: (params) => api.get('/campaigns', { params }),
  getCampaignById: (id) => api.get(`/campaigns/${id}`),
  deleteCampaign: (id) => api.delete(`/campaigns/${id}`),
  pauseCampaign: (id) => api.post(`/campaigns/${id}/pause`),
  resumeCampaign: (id) => api.post(`/campaigns/${id}/resume`),
};

// Pins Endpoints
export const pinAPI = {
  getPins: (params) => api.get('/pins', { params }),
  getPinById: (id) => api.get(`/pins/${id}`),
  getChecklist: (id) => api.get(`/pins/${id}/checklist`),
  exportCSV: (campaignId) =>
    api.get('/pins/export/csv', {
      params: { campaignId },
      responseType: 'blob',
    }),
  updatePin: (id, data) => api.put(`/pins/${id}`, data),
  deletePin: (id) => api.delete(`/pins/${id}`),
  regenerateImage: (id, customPrompt) => api.post(`/pins/${id}/regenerate-image`, { customPrompt }),
  regenerateContent: (id, instructions) => api.post(`/pins/${id}/regenerate-content`, { instructions }),
  reschedulePin: (id, scheduledAt) => api.post(`/pins/${id}/reschedule`, { scheduledAt }),
  publishNow: (id) => api.post(`/pins/${id}/publish`),
  syncMetrics: (id) => api.post(`/pins/${id}/sync-metrics`),
};

// Pinterest Endpoints
export const pinterestAPI = {
  getConnectUrl: () => api.get('/pinterest/connect'),
  getStatus: () => api.get('/pinterest/status'),
  getBoards: () => api.get('/pinterest/boards'),
  selectDefaultBoard: (boardId) => api.post('/pinterest/default-board', { boardId }),
  disconnect: () => api.post('/pinterest/disconnect'),
};

// Analytics Endpoints
export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getCampaignAnalytics: (campaignId) => api.get(`/analytics/campaigns/${campaignId}`),
  getTopPins: () => api.get('/analytics/top-pins'),
};

// Scheduler Endpoints
export const schedulerAPI = {
  getJobs: (params) => api.get('/scheduler/jobs', { params }),
  getHealth: () => api.get('/scheduler/health'),
  pauseCampaign: (campaignId) => api.post('/scheduler/pause', { campaignId }),
  resumeCampaign: (campaignId) => api.post('/scheduler/resume', { campaignId }),
};

export default api;
