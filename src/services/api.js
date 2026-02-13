import axios from 'axios';

let authToken = null;
let refreshHandler = null;

const isLikelyJwt = (token) => (
  typeof token === 'string'
  && token.split('.').length === 3
);

const buildAuthHeader = (token) => {
  if (!token) return null;
  return isLikelyJwt(token) ? `Bearer ${token}` : `Token ${token}`;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Ensure cookies and CSRF are sent for cross-site requests to Django
api.defaults.withCredentials = true;
api.defaults.xsrfCookieName = 'csrftoken';
api.defaults.xsrfHeaderName = 'X-CSRFTOKEN';

export const setAuthToken = (token) => {
  authToken = token || null;
  const authHeader = buildAuthHeader(token);
  if (authHeader) {
    api.defaults.headers.common['Authorization'] = authHeader;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const registerRefreshHandler = (fn) => {
  refreshHandler = fn;
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  const authHeader = buildAuthHeader(authToken);
  if (authHeader) {
    config.headers['Authorization'] = authHeader;
  }

  // Debugging: log auth presence for key endpoints in non-production
  try {
    if (process.env.NODE_ENV !== 'production') {
      const url = (config.url || '').toString();
      if (url.includes('/cart') || url.includes('/stores')) {
        // eslint-disable-next-line no-console
        console.debug('[api] Request:', config.method, config.url, 'Auth:', !!config.headers['Authorization']);
      }
    }
  } catch (e) {
    // ignore
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (!refreshHandler) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then((token) => {
          originalRequest.headers['Authorization'] = buildAuthHeader(token);
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshHandler();
        setAuthToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers['Authorization'] = buildAuthHeader(newToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
