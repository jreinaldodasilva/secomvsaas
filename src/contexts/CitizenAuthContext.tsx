import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CitizenUser } from '@vsaas/types';
import { citizenAuthService } from '@/services/api';

interface CitizenAuthContextValue {
  citizen: CitizenUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshCitizen: () => Promise<void>;
}

const CitizenAuthContext = createContext<CitizenAuthContextValue | null>(null);

export function CitizenAuthProvider({ children, skip = false }: { children: React.ReactNode; skip?: boolean }) {
  const [citizen, setCitizen] = useState<CitizenUser | null>(null);
  const [isLoading, setIsLoading] = useState(!skip);
  const navigate = useNavigate();

  const refreshCitizen = useCallback(async () => {
    try {
      const res = await citizenAuthService.me();
      setCitizen(res.data);
    } catch {
      setCitizen(null);
    }
  }, []);

  useEffect(() => {
    if (skip) return;
    refreshCitizen().finally(() => setIsLoading(false));
  }, [skip, refreshCitizen]);

  useEffect(() => {
    if (skip) return;
    const handleExpired = async () => {
      await citizenAuthService.logout().catch(() => {});
      setCitizen(null);
      navigate('/portal/login', { state: { reason: 'session_expired' } });
    };
    window.addEventListener('auth:session-expired', handleExpired);
    return () => window.removeEventListener('auth:session-expired', handleExpired);
  }, [skip, navigate]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await citizenAuthService.login({ email, password });
    setCitizen(res.data.user);
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string }) => {
    const res = await citizenAuthService.register(data);
    setCitizen(res.data.user);
  }, []);

  const logout = useCallback(async () => {
    await citizenAuthService.logout().catch(() => {});
    setCitizen(null);
  }, []);

  return (
    <CitizenAuthContext.Provider value={{ citizen, isLoading, isAuthenticated: !!citizen, login, register, logout, refreshCitizen }}>
      {children}
    </CitizenAuthContext.Provider>
  );
}

export function useCitizenAuth(): CitizenAuthContextValue {
  const ctx = useContext(CitizenAuthContext);
  if (!ctx) throw new Error('useCitizenAuth must be used within CitizenAuthProvider');
  return ctx;
}
