import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AdminState, AdminUser } from '../types/admin';
import { adminLogin, adminMe } from '../lib/adminApi';

const AdminContext = createContext<AdminState | null>(null);

const TOKEN_KEY = 'upsc_admin_token';
const ADMIN_KEY = 'upsc_admin_user';

export function AdminProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedAdmin = localStorage.getItem(ADMIN_KEY);
    if (savedToken) {
      setToken(savedToken);
      if (savedAdmin) {
        try { setAdmin(JSON.parse(savedAdmin)); } catch { /* ignore */ }
      }
      // Verify token is still valid
      adminMe(savedToken).then((res) => {
        if (!res.success) {
          setToken(null);
          setAdmin(null);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(ADMIN_KEY);
        } else {
          setAdmin(res.admin!);
          localStorage.setItem(ADMIN_KEY, JSON.stringify(res.admin));
        }
      });
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const res = await adminLogin(email, password);
    if (res.success && res.token && res.admin) {
      setToken(res.token);
      setAdmin(res.admin);
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(ADMIN_KEY, JSON.stringify(res.admin));
      return true;
    }
    return false;
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  };

  return (
    <AdminContext.Provider value={{ token, admin, isAuthenticated: !!token, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminState {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
