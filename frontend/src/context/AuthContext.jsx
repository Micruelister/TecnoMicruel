// =================================================================
// FILE: frontend/src/context/AuthContext.jsx
// =================================================================
import { createContext, useState, useContext, useMemo, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return null;
    }
  });

  useEffect(() => {
    console.log("AUTH_CONTEXT: User state changed to:", user);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email, password) => {
    const response = await axiosInstance.post('/api/login', { email, password });
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/api/logout');
    } catch (error) {
      console.error("Server logout failed, but logging out client-side.", error);
    } finally {
      setUser(null);
    }
  };
  const updateUser = (newUserData) => {
    setUser(newUserData);
  };
  const value = useMemo(() => ({ user, login, logout, updateUser }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 