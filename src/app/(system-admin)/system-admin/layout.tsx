'use client';

import { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function SystemAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // 로딩이 끝난 후 체크
    if (!isLoading) {
      // 로그인하지 않았으면 로그인 페이지로
      if (!user) {
        router.replace('/system-admin-login');
        return;
      }

      // 시스템 관리자가 아니면 일반 대시보드로
      if (user.userType !== 'SYSTEM_ADMIN') {
        router.replace('/dashboard');
        return;
      }
    }
  }, [user, isLoading, router]);

  // 로딩 중이거나 인증되지 않은 경우 로딩 표시
  if (isLoading || !user || user.userType !== 'SYSTEM_ADMIN') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: '#f5f5f5',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
      }}
    >
      {children}
    </Box>
  );
}
