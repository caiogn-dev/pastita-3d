// src/services/auth.js
// Updated to work with unified backend (whatsapp_business)
import api, { fetchCsrfToken, setAuthToken } from './api';

// Auth API base - points to core auth endpoints
const AUTH_BASE = '/auth';

// ============================================
// TRADITIONAL LOGIN (Email/Password)
// ============================================

export const login = async (login, password) => {
  // Use the unified backend auth endpoint
  const response = await api.post(`${AUTH_BASE}/login/`, { 
    email: login, 
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

// ============================================
// WHATSAPP OTP AUTHENTICATION
// ============================================

/**
 * Send OTP code via WhatsApp
 * @param {string} phoneNumber - Phone number with country code (e.g., +5511999999999)
 * @param {string} whatsappAccountId - UUID of the WhatsApp Business Account
 * @returns {Promise<{success: boolean, message: string, expires_in_minutes?: number}>}
 */
export const sendWhatsAppCode = async (phoneNumber, whatsappAccountId) => {
  const response = await api.post(`${AUTH_BASE}/whatsapp/send/`, {
    phone_number: phoneNumber,
    whatsapp_account_id: whatsappAccountId,
  });
  return response.data;
};

/**
 * Verify OTP code received via WhatsApp
 * @param {string} phoneNumber - Phone number with country code
 * @param {string} code - 6-digit OTP code
 * @returns {Promise<{valid: boolean, user?: object, message: string}>}
 */
export const verifyWhatsAppCode = async (phoneNumber, code) => {
  const response = await api.post(`${AUTH_BASE}/whatsapp/verify/`, {
    phone_number: phoneNumber,
    code: code,
  });
  return response.data;
};

/**
 * Resend OTP code via WhatsApp
 * @param {string} phoneNumber - Phone number with country code
 * @param {string} whatsappAccountId - UUID of the WhatsApp Business Account
 * @returns {Promise<{success: boolean, message: string}>}
 */
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
