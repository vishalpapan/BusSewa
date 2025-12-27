import axios from 'axios';

export const API_BASE_URL = 'http://127.0.0.1:8000';
const API_URL = 'http://127.0.0.1:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For session authentication
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
<<<<<<< HEAD
  update: (id, data) => api.patch(`/bookings/${id}/`, data),
=======
  update: (id, data) => api.put(`/bookings/${id}/`, data),
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
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