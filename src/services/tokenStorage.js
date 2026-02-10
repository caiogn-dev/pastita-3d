// src/services/tokenStorage.js

const TOKEN_KEY = 'pastita_access_token';
const REFRESH_KEY = 'pastita_refresh_token';
const USER_KEY = 'pastita_user';

let authTokenMemory = null;

export const setAuthTokenMemory = (token) => {
  authTokenMemory = token || null;
};

export const getAuthTokenMemory = () => authTokenMemory;

export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_KEY);
  }
  return null;
};

export const setTokens = (access, refresh) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    setAuthTokenMemory(access);
  }
};

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthTokenMemory(null);
  }
};

export const setUser = (user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const getUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }
  return null;
};