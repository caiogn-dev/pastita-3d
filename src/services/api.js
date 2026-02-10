import axios from 'axios';
import { getAccessToken, getRefreshToken, clearTokens, refreshAccessToken } from './auth';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Default store slug (Pastita)
export const DEFAULT_STORE_SLUG = process.env.NEXT_PUBLIC_STORE_SLUG || 'pastita';

// WebSocket URL for real-time notifications
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

let authTokenMemory = null;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Load token from localStorage on init
const loadToken = () => {
  const token = getAccessToken();
  if (token) {
    authTokenMemory = token;
  }
};
loadToken();

export const setAuthToken = (token) => {
  authTokenMemory = token || null;
};

// Fetch CSRF token (for non-JWT endpoints if needed)
export const fetchCsrfToken = async () => {
  try {
    const response = await api.get('/csrf/');
    return response.data.csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Request interceptor - adds JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = authTokenMemory || getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handles token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for token refresh
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        onRefreshed(newToken);
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        clearTokens();
        // Redirect to login or show modal
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle 429 Rate Limiting
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded. Please wait before making more requests.');
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error - please check your connection');
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL, WS_BASE_URL };
