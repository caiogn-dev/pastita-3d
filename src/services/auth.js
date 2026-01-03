import api from './api';

export const authService = {
  // Login usando a view obtain_auth_token que adicionamos
  async login(username, password) {
    const response = await api.post('/login/', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Registro de novo usuário
  async register(userData) {
    const response = await api.post('/users/register/', userData);
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
  }
};