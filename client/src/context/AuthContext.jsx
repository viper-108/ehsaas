import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState('client'); // 'client' or 'therapist'
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' or 'signup'

  useEffect(() => {
    const token = localStorage.getItem('ehsaas_token');
    const savedUser = localStorage.getItem('ehsaas_user');
    const savedRole = localStorage.getItem('ehsaas_role');

    if (token && savedUser && savedRole) {
      setUser(JSON.parse(savedUser));
      setRole(savedRole);
    }
    setLoading(false);
  }, []);

  const loginTherapist = async (email, password) => {
    const { data } = await api.post('/therapists/login', { email, password });
    if (data.success) {
      localStorage.setItem('ehsaas_token', data.token);
      localStorage.setItem('ehsaas_user', JSON.stringify(data.therapist));
      localStorage.setItem('ehsaas_role', 'therapist');
      setUser(data.therapist);
      setRole('therapist');
      setShowAuthModal(false);
    }
    return data;
  };

  const registerTherapist = async (formData) => {
    const { data } = await api.post('/therapists/register', formData);
    if (data.success) {
      localStorage.setItem('ehsaas_token', data.token);
      localStorage.setItem('ehsaas_user', JSON.stringify(data.therapist));
      localStorage.setItem('ehsaas_role', 'therapist');
      setUser(data.therapist);
      setRole('therapist');
      setShowAuthModal(false);
    }
    return data;
  };

  const loginClient = async (email, password) => {
    const { data } = await api.post('/clients/login', { email, password });
    if (data.success) {
      localStorage.setItem('ehsaas_token', data.token);
      localStorage.setItem('ehsaas_user', JSON.stringify(data.client));
      localStorage.setItem('ehsaas_role', 'client');
      setUser(data.client);
      setRole('client');
      setShowAuthModal(false);
    }
    return data;
  };

  const registerClient = async (formData) => {
    const { data } = await api.post('/clients/register', formData);
    if (data.success) {
      localStorage.setItem('ehsaas_token', data.token);
      localStorage.setItem('ehsaas_user', JSON.stringify(data.client));
      localStorage.setItem('ehsaas_role', 'client');
      setUser(data.client);
      setRole('client');
      setShowAuthModal(false);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('ehsaas_token');
    localStorage.removeItem('ehsaas_user');
    localStorage.removeItem('ehsaas_role');
    setUser(null);
    setRole(null);
  };

  const openAuthModal = (type = 'client', mode = 'login') => {
    setAuthModalType(type);
    setAuthModalMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      loading,
      loginTherapist,
      registerTherapist,
      loginClient,
      registerClient,
      logout,
      showAuthModal,
      authModalType,
      authModalMode,
      setAuthModalType,
      setAuthModalMode,
      openAuthModal,
      closeAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};
