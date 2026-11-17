import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useSocket } from './SocketContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { emitUserOnline, emitUserOffline } = useSocket() || {};

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('mediq_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('mediq_auth_token'));
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [targetTabAfterLogin, setTargetTabAfterLogin] = useState(null);

  // Sync presence on mount or user change
  useEffect(() => {
    if (user && emitUserOnline) {
      emitUserOnline(user);
    }
  }, [user]);

  const loginWithCredentials = async (emailOrPhone, password, role = 'all') => {
    const data = await api.login({ email: emailOrPhone, password, role });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('mediq_auth_token', data.token);
    localStorage.setItem('mediq_user', JSON.stringify(data.user));

    if (emitUserOnline) {
      emitUserOnline(data.user);
    }

    return data.user;
  };

  const registerPatient = async (patientData) => {
    const data = await api.register({ ...patientData, role: 'patient' });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('mediq_auth_token', data.token);
    localStorage.setItem('mediq_user', JSON.stringify(data.user));

    if (emitUserOnline) {
      emitUserOnline(data.user);
    }

    return data.user;
  };

  // Preserved 1-Click Demo Logins for College Viva & Demonstrations
  const loginAsAdmin = () => {
    return loginWithCredentials('admin@mediq.health', 'adminpassword123', 'admin');
  };

  const loginAsReceptionist = () => {
    return loginWithCredentials('receptionist@clinic.com', 'password123', 'receptionist');
  };

  const loginAsDoctor = (doctorId = 'doc-1') => {
    const email = doctorId === 'doc-2' ? 'doctor.patel@clinic.com' :
                  doctorId === 'doc-3' ? 'doctor.ananya@clinic.com' : 'doctor.sharma@clinic.com';
    return loginWithCredentials(email, 'password123', 'doctor');
  };

  const loginAsPatient = () => {
    return loginWithCredentials('rohan.mehra@example.com', 'password123', 'patient');
  };

  const logout = () => {
    if (emitUserOffline) {
      emitUserOffline();
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('mediq_auth_token');
    localStorage.removeItem('mediq_user');
  };

  const openLoginModal = (targetTab = null) => {
    if (targetTab) setTargetTabAfterLogin(targetTab);
    setLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
    setTargetTabAfterLogin(null);
  };

  // RBAC Permission Checker
  const role = user?.role || 'patient';
  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';
  const isReceptionist = user?.role === 'receptionist';
  const isPatient = user?.role === 'patient';
  const isAuthenticated = Boolean(user);

  const canAccessTab = (tabId) => {
    // Admin has superuser access to every portal
    if (isAdmin) return true;

    switch (tabId) {
      case 'analytics':
        return isAdmin;
      case 'doctor':
        return isDoctor || isAdmin;
      case 'reception':
        return isReceptionist || isAdmin;
      case 'book':
      case 'track':
      case 'tv':
        return true; // accessible to patients and all staff
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      role,
      isAuthenticated,
      isAdmin,
      isDoctor,
      isReceptionist,
      isPatient,
      canAccessTab,
      loginWithCredentials,
      registerPatient,
      loginAsAdmin,
      loginAsReceptionist,
      loginAsDoctor,
      loginAsPatient,
      logout,
      loginModalOpen,
      openLoginModal,
      closeLoginModal,
      targetTabAfterLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
