'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuthToken,
  setAuthToken,
  setRefreshToken,
  setUserInfo,
  getUserInfo,
  clearAuth,
  isAuthenticated as checkAuth,
} from '@/utils/auth';

interface User {
  id: number;
  name: string;
  email?: string;
  code?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 초기 로드 시 저장된 사용자 정보 확인
  useEffect(() => {
    const initAuth = () => {
      if (checkAuth()) {
        const userInfo = getUserInfo();
        if (userInfo) {
          setUser(userInfo);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback((token: string, refreshToken: string, userData: User) => {
    setAuthToken(token);
    setRefreshToken(refreshToken);
    setUserInfo(userData);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    router.push('/sign-in');
  }, [router]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
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
