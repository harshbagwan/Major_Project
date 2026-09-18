import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('apollo_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('apollo_auth_token'));

  const loginWithCredentials = async (email, password) => {
    const data = await api.login({ email, password });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('apollo_auth_token', data.token);
    localStorage.setItem('apollo_user', JSON.stringify(data.user));
    return data.user;
  };

  const loginAsReceptionist = () => {
    return loginWithCredentials('receptionist@clinic.com', 'password123');
  };

  const loginAsDoctor = (doctorId = 'doc-1') => {
    const email = doctorId === 'doc-2' ? 'doctor.patel@clinic.com' :
                  doctorId === 'doc-3' ? 'doctor.ananya@clinic.com' : 'doctor.sharma@clinic.com';
    return loginWithCredentials(email, 'password123');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('apollo_auth_token');
    localStorage.removeItem('apollo_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loginWithCredentials,
      loginAsReceptionist,
      loginAsDoctor,
      logout,
      isAuthenticated: !!user,
      isReceptionist: user?.role === 'receptionist',
      isDoctor: user?.role === 'doctor'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
