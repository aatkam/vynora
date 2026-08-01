import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    const token = localStorage.getItem('vynora_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem('vynora_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
    const logoutListener = () => setUser(null);
    window.addEventListener('vynora:logout', logoutListener);
    return () => window.removeEventListener('vynora:logout', logoutListener);
  }, []);

  function authenticate(data) {
    localStorage.setItem('vynora_token', data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('vynora_token');
    setUser(null);
  }

  const value = useMemo(() => ({ user, setUser, loading, authenticate, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
