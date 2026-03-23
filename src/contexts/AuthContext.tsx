import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@vsaas/types';
import { authService } from '@/services/api';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; companyName: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
export { AuthContext };

export function AuthProvider({ children, skip = false }: { children: React.ReactNode; skip?: boolean }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(!skip);
  const navigate = useNavigate();

  const refreshUser = useCallback(async () => {
    try {
      const res = await authService.me();
      setUser(res.data);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (skip) return;
    refreshUser().finally(() => setIsLoading(false));
  }, [skip, refreshUser]);

  useEffect(() => {
    if (skip) return;
    const handleExpired = async () => {
      await authService.logout().catch(() => {});
      setUser(null);
      navigate('/login', { state: { reason: 'session_expired' } });
    };
    window.addEventListener('auth:session-expired', handleExpired);
    return () => window.removeEventListener('auth:session-expired', handleExpired);
  }, [skip, navigate]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    setUser(res.data.user);
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string; companyName: string }) => {
    const res = await authService.register(data);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout().catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
