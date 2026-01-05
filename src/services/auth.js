// src/services/auth.js
import api from './api';

export const login = async (login, password) => {
  const response = await api.post('/login/', { login, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    api.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
  }
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/users/register/', userData);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
};

export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Get current user profile
export const getProfile = async () => {
  const response = await api.get('/users/profile/');
  return response.data;
};

// Update user profile
export const updateProfile = async (profileData) => {
  const response = await api.patch('/users/profile/', profileData);
  return response.data;
};
