import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, pinterestAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pinpilot_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('pinpilot_token'));
  const [loading, setLoading] = useState(true);
  const [pinterestAccount, setPinterestAccount] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('pinpilot_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data?.success) {
            setUser(res.data.user);
            localStorage.setItem('pinpilot_user', JSON.stringify(res.data.user));
            if (res.data.user.pinterestAccount) {
              setPinterestAccount(res.data.user.pinterestAccount);
            }
          }
        } catch (err) {
          console.error('Auth verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data?.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('pinpilot_token', res.data.token);
      localStorage.setItem('pinpilot_user', JSON.stringify(res.data.user));
      if (res.data.user.pinterestAccount) {
        setPinterestAccount(res.data.user.pinterestAccount);
      }
      return res.data;
    }
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    if (res.data?.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('pinpilot_token', res.data.token);
      localStorage.setItem('pinpilot_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  const googleSignIn = async (googlePayload) => {
    const res = await authAPI.googleLogin(googlePayload);
    if (res.data?.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('pinpilot_token', res.data.token);
      localStorage.setItem('pinpilot_user', JSON.stringify(res.data.user));
      if (res.data.user.pinterestAccount) {
        setPinterestAccount(res.data.user.pinterestAccount);
      }
      return res.data;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setPinterestAccount(null);
    localStorage.removeItem('pinpilot_token');
    localStorage.removeItem('pinpilot_user');
  };

  const refreshPinterestStatus = async () => {
    try {
      const res = await pinterestAPI.getStatus();
      if (res.data?.success && res.data.connected) {
        setPinterestAccount(res.data.account);
      } else {
        setPinterestAccount(null);
      }
    } catch (err) {
      console.error('Error refreshing Pinterest status:', err);
    }
  };

  const updateUserSettings = async (data) => {
    const res = await authAPI.updateSettings(data);
    if (res.data?.success) {
      setUser(res.data.user);
      localStorage.setItem('pinpilot_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        pinterestAccount,
        login,
        register,
        googleSignIn,
        logout,
        refreshPinterestStatus,
        updateUserSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
