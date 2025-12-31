import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
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

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Trips
export const tripsAPI = {
  getAll: () => api.get('/trips'),
  getOne: (id) => api.get(`/trips/${id}`),
  create: (data) => api.post('/trips', data),
  update: (id, data) => api.put(`/trips/${id}`, data),
  delete: (id) => api.delete(`/trips/${id}`),
};

// Itineraries
export const itinerariesAPI = {
  getAll: (tripId) => api.get(`/trips/${tripId}/itineraries`),
  create: (tripId, data) => api.post(`/trips/${tripId}/itineraries`, data),
  update: (tripId, id, data) => api.put(`/trips/${tripId}/itineraries/${id}`, data),
  delete: (tripId, id) => api.delete(`/trips/${tripId}/itineraries/${id}`),
};

// Expenses
export const expensesAPI = {
  getAll: (tripId) => api.get(`/trips/${tripId}/expenses`),
  create: (tripId, data) => api.post(`/trips/${tripId}/expenses`, data),
  update: (tripId, id, data) => api.put(`/trips/${tripId}/expenses/${id}`, data),
  delete: (tripId, id) => api.delete(`/trips/${tripId}/expenses/${id}`),
};

// Report
export const reportAPI = {
  validate: (tripId) => api.get(`/trips/${tripId}/report/validate`),
  generate: (tripId, format) => {
    return api.get(`/trips/${tripId}/report?format=${format}`, {
      responseType: 'blob',
    });
  },
};

export default api;
