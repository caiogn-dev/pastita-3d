import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as authLogin, logout as authLogout, isAuthenticated } from '../services/auth';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ao carregar a página, verifica se já tem token
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
      setUser({ token }); // Aqui poderíamos buscar os dados do perfil na API
    }
    setLoading(false);
  }, []);

  const signIn = async (username, password) => {
    try {
      const data = await authLogin(username, password);
      setUser(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.non_field_errors?.[0] || 'Erro ao logar' };
    }
  };

  const signOut = () => {
    authLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);