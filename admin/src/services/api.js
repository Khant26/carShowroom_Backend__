import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Service Methods
export const apiService = {
  // Auth APIs
  auth: {
    login: (credentials) => api.post('/auth/admin/login', credentials),
    getProfile: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/change-password', data),
  },

  // Banner APIs
  banners: {
    getAll: (params = {}) => api.get('/banners', { params }),
    getById: (id) => api.get(`/banners/${id}`),
    create: (data) => api.post('/banners', data),
    update: (id, data) => api.put(`/banners/${id}`, data),
    delete: (id) => api.delete(`/banners/${id}`),
    updateStatus: (id, isActive) => api.patch(`/banners/${id}/status`, { isActive }),
    reorder: (orderedIds) => api.patch('/banners/reorder', { orderedIds }),
  },

  // Brand APIs
  brands: {
    getAll: (params = {}) => api.get('/brands', { params }),
    getById: (id) => api.get(`/brands/${id}`),
    getByName: (name) => api.get(`/brands/name/${name}`),
    create: (data) => api.post('/brands', data),
    update: (id, data) => api.put(`/brands/${id}`, data),
    delete: (id) => api.delete(`/brands/${id}`),
    updateStatus: (id, isActive) => api.patch(`/brands/${id}/status`, { isActive }),
    updateCarCount: (id) => api.patch(`/brands/${id}/update-car-count`),
  },

  // Car APIs
  cars: {
    getAll: (params = {}) => api.get('/cars', { params }),
    getById: (id) => api.get(`/cars/${id}`),
    getFeatured: () => api.get('/cars/featured/list'),
    getStats: () => api.get('/cars/stats/overview'),
    create: (data) => api.post('/cars', data),
    update: (id, data) => api.put(`/cars/${id}`, data),
    delete: (id) => api.delete(`/cars/${id}`),
    updateStatus: (id, isAvailable) => api.patch(`/cars/${id}/status`, { isAvailable }),
    toggleFeatured: (id, isFeatured) => api.patch(`/cars/${id}/featured`, { isFeatured }),
  },

  // Rental APIs
  rentals: {
    getAll: (params = {}) => api.get('/rentals', { params }),
    getById: (id) => api.get(`/rentals/${id}`),
    getStats: () => api.get('/rentals/stats/overview'),
    create: (data) => api.post('/rentals', data),
    update: (id, data) => api.put(`/rentals/${id}`, data),
    delete: (id) => api.delete(`/rentals/${id}`),
    updateStatus: (id, status) => api.patch(`/rentals/${id}/status`, { status }),
  },

  // System APIs
  health: () => api.get('/health'),

  // Upload APIs
  upload: {
    single: (file, type = 'cars') => {
      const formData = new FormData();
      formData.append('image', file);
      return api.post(`/upload/single?type=${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    multiple: (files, type = 'cars') => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      return api.post(`/upload/multiple?type=${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    delete: (filename, type = 'cars') => {
      if (type === 'cars') {
        // Backward compatibility
        return api.delete(`/upload/${filename}`);
      }
      return api.delete(`/upload/${type}/${filename}`);
    },
    getInfo: (filename, type = 'cars') => {
      if (type === 'cars') {
        // Backward compatibility
        return api.get(`/upload/info/${filename}`);
      }
      return api.get(`/upload/info/${type}/${filename}`);
    },
  },
};

export default api;