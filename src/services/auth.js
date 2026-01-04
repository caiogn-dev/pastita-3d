// src/services/auth.js
import api from './api';

export const login = async (username, password) => {
  // Django Token Auth padrão espera 'username' e 'password'
  const response = await api.post('/login/', { username, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    // Configura o token no header de todas as próximas requisições
    api.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
  }
  return response.data;
};

export const register = async (userData) => {
  // userData deve ter username, email, password, etc.
  const response = await api.post('/users/', userData);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
};

export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};