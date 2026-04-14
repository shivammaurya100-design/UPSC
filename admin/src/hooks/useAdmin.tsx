import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AdminState } from '../types/admin';
import { verifyAdminSecret } from '../lib/adminApi';

const AdminContext = createContext<AdminState | null>(null);

const STORAGE_KEY = 'upsc_admin_secret';

export function AdminProvider({ children }: { children: ReactNode }) {
  const [secret, setSecret] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setSecret(saved);
  }, []);

  const login = async (input: string): Promise<boolean> => {
    const valid = await verifyAdminSecret(input);
    if (valid) {
      setSecret(input);
      localStorage.setItem(STORAGE_KEY, input);
      return true;
    }
    return false;
  };

  const logout = () => {
    setSecret(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AdminContext.Provider value={{ secret, isAuthenticated: !!secret, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminState {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
