// src/services/auth.js
// Updated to work with unified backend (whatsapp_business) - JWT Support
import api, { setAuthToken } from './api';

const AUTH_BASE = '/auth';

// ============================================
// JWT TOKEN MANAGEMENT
// ============================================

const TOKEN_KEY = 'pastita_access_token';
const REFRESH_KEY = 'pastita_refresh_token';
const USER_KEY = 'pastita_user';

export const setTokens = (access, refresh) => {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  setAuthToken(access);
};

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  setAuthToken(null);
};

export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

// ============================================
// TOKEN REFRESH
// ============================================

export const refreshAccessToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) {
    clearTokens();
    throw new Error('No refresh token');
  }
  
  try {
    const response = await api.post(`${AUTH_BASE}/token/refresh/`, {
      refresh: refresh
    });
    const { access } = response.data;
    localStorage.setItem(TOKEN_KEY, access);
    setAuthToken(access);
    return access;
  } catch (error) {
    clearTokens();
    throw error;
  }
};

// ============================================
// TRADITIONAL LOGIN (Email/Password)
// ============================================

export const login = async (login, password) => {
  const response = await api.post(`${AUTH_BASE}/token/`, { 
    username: login, 
    password 
  });
  
  const { access, refresh } = response.data;
  setTokens(access, refresh);
  
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post(`${AUTH_BASE}/register/`, userData);
  return response.data;
};

export const logout = () => {
  clearTokens();
  return Promise.resolve();
};

export const isAuthenticated = () => {
  return !!getAccessToken();
};

// ============================================
// WHATSAPP OTP AUTHENTICATION
// ============================================

export const sendWhatsAppCode = async (phoneNumber, whatsappAccountId) => {
  const response = await api.post(`${AUTH_BASE}/whatsapp/send/`, {
    phone_number: phoneNumber,
    whatsapp_account_id: whatsappAccountId,
  });
  return response.data;
};

export const verifyWhatsAppCode = async (phoneNumber, code) => {
  const response = await api.post(`${AUTH_BASE}/whatsapp/verify/`, {
    phone_number: phoneNumber,
    code: code,
  });
  
  // Save tokens if verification successful
  if (response.data.valid && response.data.tokens) {
    const { access, refresh } = response.data.tokens;
    setTokens(access, refresh);
    setUser(response.data.user);
  }
  
  return response.data;
};

export const resendWhatsAppCode = async (phoneNumber, whatsappAccountId) => {
  const response = await api.post(`${AUTH_BASE}/whatsapp/resend/`, {
    phone_number: phoneNumber,
    whatsapp_account_id: whatsappAccountId,
  });
  return response.data;
};

// ============================================
// PROFILE MANAGEMENT
// ============================================

export const getProfile = async () => {
  const response = await api.get(`${AUTH_BASE}/me/`);
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.patch(`${AUTH_BASE}/me/`, profileData);
  return response.data;
};

export const changePassword = async (oldPassword, newPassword) => {
  const response = await api.post(`${AUTH_BASE}/change-password/`, {
    old_password: oldPassword,
    new_password: newPassword
  });
  return response.data;
};
