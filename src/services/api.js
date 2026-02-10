import axios from 'axios';
// O SEGREDO ESTÁ AQUI: Importar do tokenStorage, JAMAIS do auth
import { getAccessToken, getAuthTokenMemory, setAuthTokenMemory, clearTokens } from './tokenStorage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
export const DEFAULT_STORE_SLUG = process.env.NEXT_PUBLIC_STORE_SLUG || 'pastita';
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Carrega o token da memória ao iniciar (seguro no client-side)
if (typeof window !== 'undefined') {
  const token = getAccessToken();
  if (token) {
    setAuthTokenMemory(token);
  }
}

// ============================================================
// O TRUQUE PARA QUEBRAR O CICLO:
// A gente cria um "placeholder" para a função de refresh
// e deixa o auth.js preencher ele depois.
// ============================================================
let refreshHandler = null;

export const registerRefreshHandler = (fn) => {
  refreshHandler = fn;
};

// Fetch CSRF token
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

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getAuthTokenMemory() || getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
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
        if (!refreshHandler) {
            // Se o auth.js não registrou o handler, não tem milagre.
            throw new Error('Refresh handler not registered');
        }
        
        // Chama a função que veio do auth.js SEM importar o auth.js
        const newToken = await refreshHandler();
        
        isRefreshing = false;
        onRefreshed(newToken);
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        clearTokens();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded. Please wait before making more requests.');
    }

    return Promise.reject(error);
  }
);

// Mantém compatibilidade com quem chamava setAuthToken antes
export const setAuthToken = setAuthTokenMemory;

export default api;
export { API_BASE_URL, WS_BASE_URL };