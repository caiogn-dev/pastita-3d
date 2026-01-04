import axios from 'axios';

const api = axios.create({
  // Verifique se essa URL está correta e sem / final extra
  baseURL: 'https://web-production-3e83a.up.railway.app/api',
});

// Injeta o Token em todas as requisições se ele existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Mudei para Bearer, que é o padrão para JWT/DRF moderno.
    // Se der erro 401, mude de volta para `Token ${token}`
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;