import axios from 'axios';

// API base URL - uses Vite env or defaults to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies for CSRF
});

// Helper to get CSRF token from cookie
const getCsrfTokenFromCookie = () => {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
};

// Fetch CSRF token from server (call this on app init)
export const fetchCsrfToken = async () => {
  try {
    const response = await api.get('/csrf/');
    return response.data.csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

// Request interceptor - adds auth token and CSRF token to all requests
api.interceptors.request.use(
  (config) => {
    // Add CSRF token for non-GET requests (POST, PUT, PATCH, DELETE)
    if (config.method !== 'get') {
      const csrfToken = getCsrfTokenFromCookie();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - clear token and redirect to login
    if (error.response?.status === 401 && !error.config?.skipAuthRedirect) {
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Handle 429 Rate Limiting
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded. Please wait before making more requests.');
      // The error will be propagated to the caller for UI handling
    }
    
    // Handle 403 CSRF errors - refresh token and retry
    if (error.response?.status === 403) {
      const errorDetail = error.response?.data?.detail || '';
      if (errorDetail.toLowerCase().includes('csrf')) {
        console.warn('CSRF token expired, refreshing...');
        // Refresh CSRF token for next request
        fetchCsrfToken();
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error - please check your connection');
    }
    
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
