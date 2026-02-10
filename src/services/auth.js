// src/services/auth.js
import api, { registerRefreshHandler, setAuthToken } from './api';
import { 
  setTokens, 
  getAccessToken, 
  getRefreshToken, 
  clearTokens as clearStorageTokens, 
  setUser as setStorageUser, 
  getUser as getStorageUser 
} from './tokenStorage';

const AUTH_BASE = '/auth';

// Re-export storage functions for compatibility
export { getAccessToken, getRefreshToken };
export const getUser = getStorageUser;
export const setUser = setStorageUser;
export const clearTokens = clearStorageTokens; // Exportação nomeada correta

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
    // Importante: Usamos uma instancia limpa do axios ou garantimos que essa rota
    // não entre em loop se der 401. A api.post normal deve funcionar.
    const response = await api.post(`${AUTH_BASE}/token/refresh/`, {
      refresh: refresh
    });
    const { access } = response.data;
    // Atualiza apenas o access token se o refresh não mudou
    localStorage.setItem('pastita_access_token', access); 
    setAuthToken(access);
    return access;
  } catch (error) {
    clearTokens();
    throw error;
  }
};

// INJEÇÃO DE DEPENDÊNCIA: Registra a função de refresh na API
// Isso fecha o ciclo de forma segura
registerRefreshHandler(refreshAccessToken);

// ============================================
// TRADITIONAL LOGIN
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