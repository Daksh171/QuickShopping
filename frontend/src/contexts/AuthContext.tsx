import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import * as api from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMe()
      .then((res) => {
        if (res.success && res.data) setUser(res.data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loginFn = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    if (res.success && res.data) setUser(res.data.user);
  }, []);

  const signupFn = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.signup(name, email, password);
    if (res.success && res.data) setUser(res.data.user);
  }, []);

  const logoutFn = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login: loginFn, signup: signupFn, logout: logoutFn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
