'use client';

import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function SystemAdminPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <Box sx={{ p: 3 }}>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            시스템 관리자 대시보드
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            안녕하세요, {user?.name}님
          </Typography>
        </Box>
        <Button variant="outlined" onClick={logout}>
          로그아웃
        </Button>
      </Box>

      {/* 메뉴 카드 */}
      <Stack spacing={3}>
        <Card
          sx={{
            p: 4,
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: '#f5f5f5',
              transform: 'translateY(-2px)',
              boxShadow: 3,
            },
          }}
          onClick={() => router.push('/system-admin/admins')}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            복지관 관리자 인증 관리
          </Typography>
          <Typography variant="body2" color="text.secondary">
            복지관 관리자 계정 승인 및 상태 관리
          </Typography>
        </Card>

        <Card
          sx={{
            p: 4,
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: '#f5f5f5',
              transform: 'translateY(-2px)',
              boxShadow: 3,
            },
          }}
          onClick={() => router.push('/system-admin/institutions')}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            복지관 관리
          </Typography>
          <Typography variant="body2" color="text.secondary">
            복지관 등록, 수정 및 관리
          </Typography>
        </Card>
      </Stack>
    </Box>
  );
}
