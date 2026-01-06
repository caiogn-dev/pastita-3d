// src/services/auth.js
import api, { fetchCsrfToken, setAuthToken, clearAuthToken } from './api';

export const login = async (login, password) => {
  const response = await api.post('/login/', { login, password });
  if (response.data?.token) {
    setAuthToken(response.data.token);
  }
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/users/register/', userData);
  return response.data;
};

export const logout = async () => {
  try {
    await fetchCsrfToken();
    await api.post('/users/logout/');
  } catch {
    // Ignore logout errors to allow local state cleanup
  } finally {
    clearAuthToken();
  }
};

export const isAuthenticated = () => {
  return false;
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
