// src/services/auth.js
// Updated to work with unified backend (whatsapp_business)
import api, { fetchCsrfToken, setAuthToken } from './api';

// Auth API base - points to core auth endpoints
const AUTH_BASE = '/auth';

export const login = async (login, password) => {
  // Use the unified backend auth endpoint
  const response = await api.post(`${AUTH_BASE}/login/`, { 
    username: login, 
    password 
  });
  try {
    await fetchCsrfToken();
  } catch {
    // CSRF refresh failure should not block login
  }
  if (response.data?.token) {
    setAuthToken(response.data.token);
  }
  return response.data;
};

export const register = async (userData) => {
  // Registration endpoint
  const response = await api.post(`${AUTH_BASE}/register/`, userData);
  return response.data;
};

export const logout = async () => {
  try {
    await fetchCsrfToken();
    await api.post(`${AUTH_BASE}/logout/`);
  } catch {
    // Ignore logout errors to allow local state cleanup
  }
  setAuthToken(null);
};

export const isAuthenticated = () => {
  return false;
};

// Get current user profile
export const getProfile = async () => {
  const response = await api.get(`${AUTH_BASE}/me/`);
  return response.data;
};

// Update user profile
export const updateProfile = async (profileData) => {
  const response = await api.patch(`${AUTH_BASE}/me/`, profileData);
  return response.data;
};

// Change password
export const changePassword = async (oldPassword, newPassword) => {
  const response = await api.post(`${AUTH_BASE}/change-password/`, {
    old_password: oldPassword,
    new_password: newPassword
  });
  return response.data;
};
