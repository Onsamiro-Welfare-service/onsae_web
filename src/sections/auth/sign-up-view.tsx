'use client';

import { useState, useCallback, FormEvent, useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';

import { useRouter } from 'next/navigation';
import { institutionService, type Institution } from '@/services/institutionService';
import { Iconify } from '@/components/iconify';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// ----------------------------------------------------------------------

type AdminRole = 'ADMIN' | 'STAFF';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: AdminRole;
  institutionId: number;
}

export function SignUpView() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 기관 목록
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(true);

  // 폼 데이터
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<AdminRole>('ADMIN');
  const [institutionId, setInstitutionId] = useState('');

  // 기관 목록 조회
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const data = await institutionService.getInstitutions();
        setInstitutions(data);
        // 기관이 하나라도 있으면 첫 번째 기관을 기본값으로 설정
        if (data.length > 0) {
          setInstitutionId(data[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to fetch institutions:', err);
        setError('기관 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoadingInstitutions(false);
      }
    };

    fetchInstitutions();
  }, []);

  const handleRegister = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      // 비밀번호 확인
      if (password !== passwordConfirm) {
        setError('비밀번호가 일치하지 않습니다.');
        setIsLoading(false);
        return;
      }

      // 비밀번호 길이 확인
      if (password.length < 8) {
        setError('비밀번호는 8자 이상이어야 합니다.');
        setIsLoading(false);
        return;
      }

      try {
        const requestData: RegisterRequest = {
          name,
          email,
          password,
          phone: phone || undefined,
          role,
          institutionId: parseInt(institutionId, 10),
        };

        const response = await fetch(`${API_BASE_URL}/admin/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: '회원가입에 실패했습니다.' }));
          throw new Error(errorData.message || '회원가입에 실패했습니다.');
        }

        setSuccess(true);
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/sign-in');
        }, 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    },
    [name, email, password, passwordConfirm, phone, role, institutionId, router]
  );

  if (success) {
    return (
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Iconify icon="solar:check-circle-bold" width={64} color="success.main" />
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
          회원가입 성공!
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          관리자 승인 후 로그인하실 수 있습니다.
          <br />
          잠시 후 로그인 페이지로 이동합니다...
        </Typography>
      </Box>
    );
  }

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
          관리자 회원가입
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          복지관 케어 시스템 관리자 등록
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleRegister}>
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
          name="name"
          label="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
          sx={{ mb: 3 }}
          required
          disabled={isLoading}
        />

        <TextField
          fullWidth
          name="email"
          label="이메일"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          sx={{ mb: 3 }}
          required
          disabled={isLoading}
        />

        <TextField
          fullWidth
          name="phone"
          label="전화번호 (선택)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="010-1234-5678"
          sx={{ mb: 3 }}
          disabled={isLoading}
        />

        <TextField
          fullWidth
          select
          name="role"
          label="역할"
          value={role}
          onChange={(e) => setRole(e.target.value as AdminRole)}
          sx={{ mb: 3 }}
          required
          disabled={isLoading}
        >
          <MenuItem value="ADMIN">관리자</MenuItem>
          <MenuItem value="STAFF">직원</MenuItem>
        </TextField>

        <TextField
          fullWidth
          name="password"
          label="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type={showPassword ? 'text' : 'password'}
          placeholder="8자 이상 입력하세요"
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

        <TextField
          fullWidth
          name="passwordConfirm"
          label="비밀번호 확인"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          type={showPasswordConfirm ? 'text' : 'password'}
          placeholder="비밀번호를 다시 입력하세요"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    edge="end"
                  >
                    <Iconify
                      icon={showPasswordConfirm ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                    />
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
          {isLoading ? '등록 중...' : '회원가입'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={() => router.push('/sign-in')}
            sx={{ cursor: 'pointer' }}
          >
            이미 계정이 있으신가요? 로그인
          </Link>
        </Box>
      </Box>
    </>
  );
}
