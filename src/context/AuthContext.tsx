'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  AuthState,
  SessionUser,
  LoginCredentials,
  RegisterCredentials,
} from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
  });

  // 检查初始登录状态
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setAuthState({ user: data.user, isLoading: false });
      } else {
        setAuthState({ user: null, isLoading: false });
      }
    } catch (error) {
      console.error('[Auth] Check auth error:', error);
      setAuthState({ user: null, isLoading: false });
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthState({ user: data.user, isLoading: false });
        return { success: true };
      } else {
        return { success: false, error: data.error || '登录失败' };
      }
    } catch (error) {
      console.error('[Auth] Login error:', error);
      return { success: false, error: '网络错误，请稍后再试' };
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthState({ user: data.user, isLoading: false });
        return { success: true };
      } else {
        return { success: false, error: data.error || '注册失败' };
      }
    } catch (error) {
      console.error('[Auth] Register error:', error);
      return { success: false, error: '网络错误，请稍后再试' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      setAuthState({ user: null, isLoading: false });
    }
  }, []);

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
