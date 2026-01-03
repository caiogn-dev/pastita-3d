import axios from 'axios';

const api = axios.create({
  // URL da sua API no Railway
  baseURL: 'https://web-production-3e83a.up.railway.app/api',
});

// Injeta o Token em todas as requisições se ele existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;