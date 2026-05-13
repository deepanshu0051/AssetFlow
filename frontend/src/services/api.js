import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for consistent error handling and session management
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const storedUser = localStorage.getItem('user');
      let role = null;
      try {
        if (storedUser) {
          const user = JSON.parse(storedUser);
          role = user?.role;
        }
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (!window.location.pathname.startsWith('/admin/login') && 
          !window.location.pathname.startsWith('/register') &&
          !window.location.pathname.startsWith('/superadmin/login')) {
        window.location.href = role === 'superadmin' ? '/superadmin/login' : '/admin/login';
      }
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

const apiService = {
  // Auth
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (data) => api.post('/auth/forgotpassword', data),
  resetPassword: (token, data) => api.put(`/auth/resetpassword/${token}`, data),
  getUsers: () => api.get('/auth/users'),
  sendOTP: (data) => api.post('/auth/send-otp', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),

  // Machines (Hierarchical/Embedded)
  getMachines: (params) => api.get('/machines', { params }),
  getMachine: (id) => api.get(`/machines/${id}`),
  createMachine: (data) => api.post('/machines', data),
  updateMachine: (id, data) => api.put(`/machines/${id}`, data),
  deleteMachine: (id) => api.delete(`/machines/${id}`),

  // Plants
  getPlants: () => api.get('/plants'),

  // Machine Requests
  getMachineRequests: () => api.get('/machine-requests'),
  createMachineRequest: (data) => api.post('/machine-requests', data),
  approveMachineRequest: (id) => api.post(`/machine-requests/${id}/approve`),
  rejectMachineRequest: (id, data) => api.post(`/machine-requests/${id}/reject`, data),

  // Notifications
  getNotifications: () => api.get('/notifications'),
  markNotificationRead: (id) => api.put(`/notifications/${id}/read`),

  // Dashboard Stats
  getDashboardStats: () => api.get('/dashboard/stats')
};

export default apiService;
