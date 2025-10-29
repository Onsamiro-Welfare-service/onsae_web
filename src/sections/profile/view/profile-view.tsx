'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// ----------------------------------------------------------------------

export function ProfileView() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>사용자 정보를 불러올 수 없습니다.</Typography>
      </Box>
    );
  }

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return '시스템 관리자';
      case 'ADMIN':
        return '관리자';
      case 'USER':
        return '사용자';
      default:
        return role || '미지정';
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return 'error';
      case 'ADMIN':
        return 'warning';
      case 'USER':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          onClick={() => router.push('/dashboard')}
          sx={{
            bgcolor: 'white',
            '&:hover': { bgcolor: '#f5f5f5' },
            boxShadow: 1,
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            프로필
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            내 계정 정보
          </Typography>
        </Box>
      </Box>

      {/* 프로필 카드 */}
      <Card sx={{ p: 4 }}>
        <Stack spacing={4}>
          {/* 아바타 및 기본 정보 */}
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar
              sx={{
                width: 120,
                height: 120,
                fontSize: 48,
                bgcolor: 'primary.main',
              }}
            >
              {user.name?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {user.name || '이름 없음'}
                </Typography>
                <Chip
                  label={getRoleLabel(user.role || user.userType)}
                  color={getRoleColor(user.role || user.userType)}
                  size="small"
                />
              </Stack>
              {user.email && (
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              )}
              {user.code && (
                <Typography variant="body2" color="text.secondary">
                  사원번호: {user.code}
                </Typography>
              )}
            </Box>
          </Stack>

          <Divider />

          {/* 상세 정보 */}
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              계정 정보
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  사용자 ID
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {user.id}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  이름
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {user.name || '-'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  이메일
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {user.email || '-'}
                </Typography>
              </Box>

              {user.code && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    사원번호
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {user.code}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="caption" color="text.secondary">
                  역할
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {getRoleLabel(user.role || user.userType)}
                </Typography>
              </Box>
            </Stack>
          </Stack>

          {user.institutionId && (
            <>
              <Divider />
              <Stack spacing={3}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  소속 정보
                </Typography>

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      복지관 ID
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {user.institutionId}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      복지관명
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {user.institutionName || '-'}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </>
          )}
        </Stack>
      </Card>
    </Box>
  );
}

