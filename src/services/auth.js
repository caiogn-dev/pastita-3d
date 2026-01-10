// src/services/auth.js
// Authentication service using core API endpoints
import { coreApi, fetchCsrfToken, setAuthToken } from './api';

// Auth token memory (shared with main api)
let authTokenMemory = null;

// Sync token with main api
const syncToken = (token) => {
  authTokenMemory = token;
  setAuthToken(token);
};

export const login = async (login, password) => {
  const response = await coreApi.post('/auth/login/', { 
    email: login, 
    password 
  });
  try {
    await fetchCsrfToken();
  } catch {
    // CSRF refresh failure should not block login
  }
  if (response.data?.token) {
    syncToken(response.data.token);
  }
  return response.data;
};

export const register = async (userData) => {
  const response = await coreApi.post('/auth/register/', userData);
  if (response.data?.token) {
    syncToken(response.data.token);
  }
  return response.data;
};

export const logout = async () => {
  try {
    await fetchCsrfToken();
    await coreApi.post('/auth/logout/');
  } catch {
    // Ignore logout errors to allow local state cleanup
  }
  syncToken(null);
};

export const isAuthenticated = () => {
  return Boolean(authTokenMemory);
};

// Get current user profile (extended fields)
export const getProfile = async () => {
  const response = await coreApi.get('/users/profile/');
  return response.data;
};

// Update user profile (extended fields)
export const updateProfile = async (profileData) => {
  const response = await coreApi.patch('/users/profile/', profileData);
  return response.data;
};

// Change password
export const changePassword = async (oldPassword, newPassword) => {
  const response = await coreApi.post('/auth/change-password/', {
    old_password: oldPassword,
    new_password: newPassword
  });
  return response.data;
};

// Export for use in other modules
export { authTokenMemory };
