import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { login as authLogin, logout as authLogout } from '../services/auth';
import api from '../services/api';

const AuthContext = createContext();
const PROFILE_CACHE_TTL_MS = 5 * 60 * 1000;
let profileFetchPromise = null;
let profileCache = null;
let profileCacheTs = 0;

const readProfileCache = () => {
  if (!profileCache || !profileCacheTs) {
    return null;
  }
  if (Date.now() - profileCacheTs > PROFILE_CACHE_TTL_MS) {
    profileCache = null;
    profileCacheTs = 0;
    return null;
  }
  return profileCache;
};

const writeProfileCache = (data) => {
  profileCache = data;
  profileCacheTs = Date.now();
};

const clearProfileCache = () => {
  profileCache = null;
  profileCacheTs = 0;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const initRef = useRef(false);

  const fetchProfile = useCallback(async ({ force = false } = {}) => {
    const cached = readProfileCache();
    if (!force && cached) {
      setProfile(cached);
      setUser(cached);
      return cached;
    }

    if (profileFetchPromise) {
      return profileFetchPromise;
    }

    profileFetchPromise = (async () => {
      try {
        const response = await api.get('/users/profile/', { skipAuthRedirect: true });
        setProfile(response.data);
        setUser(response.data);
        writeProfileCache(response.data);
        return response.data;
      } catch (error) {
        if (error.response?.status === 401) {
          clearProfileCache();
          setUser(null);
          setProfile(null);
          return null;
        }
        console.error('Error fetching profile:', error);
        return null;
      } finally {
        profileFetchPromise = null;
      }
    })();

    return profileFetchPromise;
  }, []);

  useEffect(() => {
    if (initRef.current) {
      return;
    }
    initRef.current = true;

    const initAuth = async () => {
      await fetchProfile();
      setLoading(false);
    };
    initAuth();
  }, [fetchProfile]);

  const signIn = async (login, password) => {
    try {
      const data = await authLogin(login, password);
      const loginUser = data?.user || null;
      setUser(loginUser);
      const profileData = await fetchProfile({ force: true });
      return { success: true, profile: profileData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.non_field_errors?.[0]
          || error.response?.data?.detail
          || 'E-mail, celular ou senha invalidos'
      };
    }
  };

  const signOut = () => {
    authLogout().catch(() => {});
    clearProfileCache();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (data) => {
    try {
      const response = await api.patch('/users/profile/', data);
      setProfile(response.data);
      writeProfileCache(response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAuthenticated: Boolean(user || profile),
      signIn,
      signOut,
      updateProfile,
      fetchProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
