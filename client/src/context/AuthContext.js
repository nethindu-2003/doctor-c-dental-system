import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in when app starts
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser(decoded);
        }
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    const res = await api.post('/login', { email, password, role });
    sessionStorage.setItem('token', res.data.token);
    setUser(jwtDecode(res.data.token));
    return res.data;
  };

  const register = async (userData) => {
    return await api.post('/register', userData);
  };

  const logout = () => {
    // 1. Remove the token from storage
    sessionStorage.removeItem('token');
    
    // 2. Clear the user state in React
    setUser(null);
    
    // 3. (Optional but recommended) Hard reload to clear any memory states
    window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};