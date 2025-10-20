'use client';

import { useState, useCallback, FormEvent, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { institutionService, type Institution } from '@/services/institutionService';
import { Iconify } from '@/components/iconify';

// ----------------------------------------------------------------------

type LoginType = 'admin' | 'user';

export function SignInView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  const [loginType, setLoginType] = useState<LoginType>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 기관 목록
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(true);

  // 관리자 로그인 폼 데이터
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [institutionId, setInstitutionId] = useState('');

  // 사용자 로그인 폼 데이터
  const [userLoginCode, setUserLoginCode] = useState('');

  // 기관 목록 조회
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const data = await institutionService.getInstitutions();
        setInstitutions(data);
        // 기관이 하나라도 있으면 첫 번째 기관을 기본값으로 설정
        if (data.length > 0) {
          setInstitutionId(data[0].id.toString());
        } else {
          setError('등록된 기관이 없습니다. 관리자에게 문의하세요.');
        }
      } catch (err) {
        console.error('Failed to fetch institutions:', err);
        setError('기관 목록을 불러오는데 실패했습니다. 페이지를 새로고침해주세요.');
      } finally {
        setIsLoadingInstitutions(false);
      }
    };

    if (loginType === 'admin') {
      fetchInstitutions();
    }
  }, [loginType]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: LoginType) => {
    setLoginType(newValue);
    setError(null);
  };

  const handleAdminLogin = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);

      try {
        // Validate institutionId
        if (!institutionId || institutionId === '') {
          throw new Error('소속 기관을 선택해주세요.');
        }

        const parsedInstitutionId = parseInt(institutionId, 10);
        if (isNaN(parsedInstitutionId) || parsedInstitutionId <= 0) {
          throw new Error('유효하지 않은 기관 ID입니다.');
        }

        const response = await authService.adminLogin({
          email: adminEmail,
          password: adminPassword,
          institutionId: parsedInstitutionId,
        });

        login(response.accessToken, response.refreshToken, {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email || undefined,
          role: response.user.userType,
          institutionId: response.user.institutionId || undefined,
          institutionName: response.user.institutionName || undefined,
        });
        router.push(returnUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    },
    [adminEmail, adminPassword, institutionId, login, router, returnUrl]
  );

  const handleUserLogin = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);

      try {
        const response = await authService.userLogin({
          loginCode: userLoginCode,
        });

        login(response.accessToken, response.refreshToken, {
          id: response.user.id,
          name: response.user.name,
          code: userLoginCode, // 로그인 코드를 사용자 코드로 저장
        });
        router.push(returnUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    },
    [userLoginCode, login, router, returnUrl]
  );

  const renderAdminForm = (
    <Box component="form" onSubmit={handleAdminLogin}>
      <TextField
        fullWidth
        select
        name="institutionId"
        label="소속 기관"
        value={institutionId}
        onChange={(e) => setInstitutionId(e.target.value)}
        sx={{ mb: 3 }}
        required
        disabled={isLoading || isLoadingInstitutions}
        helperText={isLoadingInstitutions ? '기관 목록을 불러오는 중...' : '소속 기관을 선택하세요'}
      >
        {isLoadingInstitutions ? (
          <MenuItem value="">
            <CircularProgress size={20} sx={{ mr: 1 }} />
            로딩 중...
          </MenuItem>
        ) : institutions.length === 0 ? (
          <MenuItem value="" disabled>
            등록된 기관이 없습니다
          </MenuItem>
        ) : (
          institutions.map((institution) => (
            <MenuItem key={institution.id} value={institution.id.toString()}>
              {institution.name}
            </MenuItem>
          ))
        )}
      </TextField>

      <TextField
        fullWidth
        name="email"
        label="이메일"
        type="email"
        value={adminEmail}
        onChange={(e) => setAdminEmail(e.target.value)}
        placeholder="admin@example.com"
        sx={{ mb: 3 }}
        required
        disabled={isLoading}
      />

      <TextField
        fullWidth
        name="password"
        label="비밀번호"
        value={adminPassword}
        onChange={(e) => setAdminPassword(e.target.value)}
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
        disabled={isLoading || isLoadingInstitutions || institutions.length === 0 || !institutionId}
        startIcon={isLoading && <CircularProgress size={20} />}
        sx={{ mb: 2 }}
      >
        {isLoading ? '로그인 중...' : '관리자 로그인'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Link
          component="button"
          type="button"
          variant="body2"
          onClick={() => router.push('/sign-up')}
          sx={{ cursor: 'pointer' }}
        >
          계정이 없으신가요? 회원가입
        </Link>
      </Box>
    </Box>
  );

  const renderUserForm = (
    <Box component="form" onSubmit={handleUserLogin}>
      <TextField
        fullWidth
        name="loginCode"
        label="로그인 코드"
        value={userLoginCode}
        onChange={(e) => setUserLoginCode(e.target.value)}
        placeholder="발급받은 로그인 코드를 입력하세요"
        sx={{ mb: 3 }}
        required
        disabled={isLoading}
        helperText="관리자에게 발급받은 로그인 코드를 입력해주세요"
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        disabled={isLoading}
        startIcon={isLoading && <CircularProgress size={20} />}
      >
        {isLoading ? '로그인 중...' : '사용자 로그인'}
      </Button>
    </Box>
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
          온새 로그인
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          복지관 케어 시스템
        </Typography>
      </Box>

      <Tabs
        value={loginType}
        onChange={handleTabChange}
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            flex: 1,
            minHeight: 48,
          },
        }}
      >
        <Tab value="admin" label="관리자" />
        <Tab value="user" label="사용자" />
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loginType === 'admin' ? renderAdminForm : renderUserForm}
    </>
  );
}
