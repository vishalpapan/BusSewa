import axios from 'axios';

// Use relative API URL for production deployment
export const API_BASE_URL = '/api';
const API_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For session authentication
});

// Add interceptor to include CSRF token
api.interceptors.request.use((config) => {
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };
  const token = getCookie('csrftoken');
  if (token) {
    config.headers['X-CSRFToken'] = token;
  }
  return config;
});

// Passenger API calls
export const passengerAPI = {
  getAll: () => api.get('/passengers/'),
  create: (data) => {
    // Handle FormData for file uploads
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    return api.post('/passengers/', data, config);
  },
  getById: (id) => api.get(`/passengers/${id}/`),
  update: (id, data) => api.put(`/passengers/${id}/`, data),
  delete: (id) => api.delete(`/passengers/${id}/`),
  search: (query) => api.get(`/passengers/?search=${query}`),
};

// Booking API calls
export const bookingAPI = {
  getAll: () => api.get('/bookings/'),
  create: (data) => api.post('/bookings/', data),
  getById: (id) => api.get(`/bookings/${id}/`),
  update: (id, data) => api.patch(`/bookings/${id}/`, data),
  delete: (id) => api.delete(`/bookings/${id}/`),
};

// Pickup Point API calls
export const pickupPointAPI = {
  getAll: () => api.get('/pickup-points/'),
  create: (data) => api.post('/pickup-points/', data),
  getById: (id) => api.get(`/pickup-points/${id}/`),
  update: (id, data) => api.put(`/pickup-points/${id}/`, data),
  delete: (id) => api.delete(`/pickup-points/${id}/`),
};

// Payment API calls
export const paymentAPI = {
  getAll: () => api.get('/payments/'),
  create: (data) => api.post('/payments/', data),
};

// Bus API calls
export const busAPI = {
  getAll: () => api.get('/buses/'),
  create: (data) => api.post('/buses/', data),
  getById: (id) => api.get(`/buses/${id}/`),
  update: (id, data) => api.put(`/buses/${id}/`, data),
  delete: (id) => api.delete(`/buses/${id}/`),
};

// Volunteer API calls
export const volunteerAPI = {
  getAll: () => api.get('/volunteers/'),
  create: (data) => api.post('/volunteers/', data),
};

export default api;