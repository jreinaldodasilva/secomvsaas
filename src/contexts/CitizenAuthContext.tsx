import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { citizenAuthService, CitizenUser } from '@/services/api/citizenAuthService';

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

export function CitizenAuthProvider({ children }: { children: React.ReactNode }) {
  const [citizen, setCitizen] = useState<CitizenUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCitizen = useCallback(async () => {
    try {
      const res = await citizenAuthService.me();
      setCitizen(res.data);
    } catch {
      setCitizen(null);
    }
  }, []);

  useEffect(() => {
    refreshCitizen().finally(() => setIsLoading(false));
  }, [refreshCitizen]);

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
