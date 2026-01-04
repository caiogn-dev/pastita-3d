import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as authLogin, logout as authLogout } from '../services/auth';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from API
  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get('/users/profile/');
      setProfile(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Token ${token}`;
        setUser({ token });
        // Fetch full profile data
        await fetchProfile();
      }
      setLoading(false);
    };
    initAuth();
  }, [fetchProfile]);

  const signIn = async (username, password) => {
    try {
      const data = await authLogin(username, password);
      setUser(data);
      // Fetch profile after successful login
      const profileData = await fetchProfile();
      return { success: true, profile: profileData };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.non_field_errors?.[0] || 
               error.response?.data?.detail ||
               'Usuário ou senha inválidos' 
      };
    }
  };

  const signOut = () => {
    authLogout();
    setUser(null);
    setProfile(null);
  };

  // Update profile data (used after checkout to save address)
  const updateProfile = async (profileData) => {
    try {
      const response = await api.patch('/users/profile/', profileData);
      setProfile(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Erro ao atualizar perfil' 
      };
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    return await fetchProfile();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile,
      signIn, 
      signOut, 
      updateProfile,
      refreshProfile,
      loading, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);