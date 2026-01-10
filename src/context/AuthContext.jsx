import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { login as authLogin, logout as authLogout, getProfile as authGetProfile, updateProfile as authUpdateProfile } from '../services/auth';

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
        // Use auth service which points to correct endpoint
        const data = await authGetProfile();
        setProfile(data);
        setUser(data);
        writeProfileCache(data);
        return data;
      } catch (error) {
        if (error.response?.status === 401) {
          clearProfileCache();
          setUser(null);
          setProfile(null);
          return null;
        }
        // Silently fail for other errors - user will see login prompt
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
          || 'E-mail, celular ou senha inválidos'
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
    // Use auth service which points to correct endpoint
    const updatedData = await authUpdateProfile(data);
    setProfile(updatedData);
    writeProfileCache(updatedData);
    return updatedData;
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
