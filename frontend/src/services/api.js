import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login') && 
          !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
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

  // Machines (Hierarchical/Embedded)
  getMachines: () => api.get('/machines'),
  getMachine: (id) => api.get(`/machines/${id}`),
  createMachine: (data) => api.post('/machines', data),
  updateMachine: (id, data) => api.put(`/machines/${id}`, data),
  deleteMachine: (id) => api.delete(`/machines/${id}`),

  // Plants
  getPlants: () => api.get('/plants'),

  // Dummy Machine Requests to prevent errors
  getMachineRequests: () => Promise.resolve({ success: true, data: [] }),
  approveMachineRequest: (id) => Promise.resolve({ success: true }),
  rejectMachineRequest: (id, data) => Promise.resolve({ success: true })
};

export default apiService;
