import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { login as authLogin, logout as authLogout } from '../services/auth';
import api from '../services/api';

const AuthContext = createContext();
const PROFILE_CACHE_KEY = 'pastita_profile_cache_v1';
const PROFILE_CACHE_TTL_MS = 5 * 60 * 1000;
let profileFetchPromise = null;
let profileFetchToken = null;

const readProfileCache = () => {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeProfileCache = (token, data) => {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({
      token,
      ts: Date.now(),
      data
    }));
  } catch {
    // ignore cache write errors
  }
};

const clearProfileCache = () => {
  try {
    localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch {
    // ignore cache clear errors
  }
};

const isProfileCacheValid = (cache, token) => {
  if (!cache || cache.token !== token || !cache.ts) {
    return false;
  }
  return Date.now() - cache.ts < PROFILE_CACHE_TTL_MS;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const initRef = useRef(false);

  const fetchProfile = useCallback(async ({ force = false } = {}) => {
    const token = localStorage.getItem('token');
    if (!token) {
      clearProfileCache();
      setProfile(null);
      return null;
    }

    const cached = readProfileCache();
    if (!force && isProfileCacheValid(cached, token)) {
      setProfile(cached.data);
      return cached.data;
    }

    if (profileFetchPromise && profileFetchToken === token) {
      return profileFetchPromise;
    }

    profileFetchToken = token;
    profileFetchPromise = (async () => {
      try {
        const response = await api.get('/users/profile/');
        if (localStorage.getItem('token') !== token) {
          return null;
        }
        setProfile(response.data);
        writeProfileCache(token, response.data);
        return response.data;
      } catch (error) {
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
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common.Authorization = `Token ${token}`;
        setUser({ token });
        await fetchProfile();
      } else {
        clearProfileCache();
        setProfile(null);
      }
      setLoading(false);
    };
    initAuth();
  }, [fetchProfile]);

  const signIn = async (login, password) => {
    try {
      const data = await authLogin(login, password);
      setUser(data);
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
    authLogout();
    clearProfileCache();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (data) => {
    try {
      const response = await api.patch('/users/profile/', data);
      setProfile(response.data);
      const token = localStorage.getItem('token');
      if (token) {
        writeProfileCache(token, response.data);
      }
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
      isAuthenticated: Boolean(user),
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
