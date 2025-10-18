'use client';

import { useState, useCallback, FormEvent } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { systemAdminService } from '@/services/systemAdminService';
import { Iconify } from '@/components/iconify';

// ----------------------------------------------------------------------

export function SystemAdminLoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const returnUrl = searchParams.get('returnUrl') || '/system-admin';

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);

      try {
        const response = await systemAdminService.login({
          email,
          password,
        });

        login(response.accessToken, response.refreshToken, {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email || undefined,
          role: 'SYSTEM_ADMIN',
          userType: 'SYSTEM_ADMIN',
        });
        router.push(returnUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, login, router, returnUrl]
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          시스템 관리자 로그인
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          온새 시스템 관리 콘솔
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          name="email"
          label="이메일"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="system-admin@example.com"
          sx={{ mb: 3 }}
          required
          disabled={isLoading}
        />

        <TextField
          fullWidth
          name="password"
          label="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type={showPassword ? 'text' : 'password'}
          placeholder="비밀번호를 입력하세요"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 3 }}
          required
          disabled={isLoading}
        />

        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading && <CircularProgress size={20} />}
          sx={{ mb: 2 }}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            복지관 관리자이신가요?{' '}
            <Box
              component="span"
              onClick={() => router.push('/sign-in')}
              sx={{
                color: 'primary.main',
                cursor: 'pointer',
                textDecoration: 'underline',
                '&:hover': {
                  color: 'primary.dark',
                },
              }}
            >
              관리자 로그인
            </Box>
          </Typography>
        </Box>
      </Box>
    </>
  );
}
