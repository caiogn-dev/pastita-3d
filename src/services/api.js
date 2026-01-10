import axios from 'axios';

// API base URLs
// NEXT_PUBLIC_API_URL should point to the ecommerce API base (e.g., http://localhost:8000/api/v1/ecommerce)
// For backward compatibility, if it doesn't include /ecommerce, we add it
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const API_BASE_URL = rawApiUrl.endsWith('/ecommerce') ? rawApiUrl : `${rawApiUrl}/ecommerce`;
const API_ROOT = rawApiUrl.endsWith('/ecommerce') ? rawApiUrl.replace(/\/ecommerce$/, '') : rawApiUrl;

// WebSocket URL for real-time notifications
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

let authTokenMemory = null;
const AUTH_COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'auth_token';

// Create axios instance for ecommerce endpoints
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Create axios instance for core endpoints (auth, csrf, etc.)
const coreApi = axios.create({
  baseURL: API_ROOT,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add auth interceptor to coreApi
coreApi.interceptors.request.use(
  (config) => {
    if (authTokenMemory && !config.headers.Authorization) {
      config.headers.Authorization = `Token ${authTokenMemory}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let csrfTokenCache = null;
let csrfRefreshPromise = null;

// Helper to get CSRF token from cookie
const getCsrfTokenFromCookie = () => {
  if (typeof document === 'undefined') {
    return csrfTokenCache;
  }
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return csrfTokenCache;
};

// Fetch CSRF token from server (call this on app init)
// Uses coreApi because CSRF endpoint is at /api/v1/csrf/ not /api/v1/ecommerce/csrf/
export const fetchCsrfToken = async () => {
  try {
    const response = await coreApi.get('/csrf/');
    csrfTokenCache = response.data.csrfToken;
    return response.data.csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

const refreshCsrfToken = () => {
  if (!csrfRefreshPromise) {
    csrfRefreshPromise = fetchCsrfToken().finally(() => {
      csrfRefreshPromise = null;
    });
  }
  return csrfRefreshPromise;
};

export const setAuthToken = (token) => {
  authTokenMemory = token || null;
};

const getAuthTokenFromCookie = () => {
  if (typeof document === 'undefined') {
    return null;
  }
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === AUTH_COOKIE_NAME) {
      return cookieValue || null;
    }
  }
  return null;
};

// Bootstrap auth token from HttpOnly cookie (if present)
if (typeof document !== 'undefined' && !authTokenMemory) {
  const cookieToken = getAuthTokenFromCookie();
  if (cookieToken) {
    authTokenMemory = cookieToken;
  }
}

// Request interceptor - adds auth token and CSRF token to all requests
api.interceptors.request.use(
  (config) => {
    if (authTokenMemory && !config.headers.Authorization) {
      config.headers.Authorization = `Token ${authTokenMemory}`;
    }

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
    // Handle 401 Unauthorized - do not force redirect (avoid logout loops)
    // Caller can decide whether to show login modal.
    
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
        if (!error.config?._retry) {
          const retryConfig = { ...error.config, _retry: true };
          return refreshCsrfToken()
            .then((token) => {
              if (token) {
                retryConfig.headers = retryConfig.headers || {};
                retryConfig.headers['X-CSRFToken'] = token;
              }
              return api.request(retryConfig);
            })
            .catch((refreshError) => Promise.reject(refreshError));
        }
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
export { api, coreApi, API_BASE_URL, API_ROOT, WS_BASE_URL };
