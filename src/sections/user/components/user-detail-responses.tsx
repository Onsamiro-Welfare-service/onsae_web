import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { responseService } from '@/services/responseService';
import type { DetailedResponse, UserResponsesResponse } from '@/types/api';

import type { UserProps } from '../user-table-row';

type UserDetailResponsesProps = {
  user: UserProps;
};

const extractAnswer = (resp: DetailedResponse): string => {
  const data = resp.responseData ?? {};
  const answer = (data as { answer?: unknown; answers?: unknown; otherText?: unknown }).answer;
  const answers = (data as { answers?: unknown }).answers;
  const otherText = (data as { otherText?: unknown }).otherText;

  if (typeof answer === 'string' && answer) {
    // 단일 선택에서 "기타" 옵션을 선택한 경우 otherText 표시
    if (answer === 'other' && typeof otherText === 'string' && otherText) {
      return otherText;
    }
    return answer;
  }
  if (Array.isArray(answers)) return answers.join(', ');
  if (typeof resp.responseText === 'string' && resp.responseText) return resp.responseText;
  if (typeof otherText === 'string' && otherText) return otherText;
  return '';
};

export function UserDetailResponses({ user }: UserDetailResponsesProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserResponsesResponse | null>(null);
  const [range, setRange] = useState<'7d' | 'all'>('7d');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    const numericUserId = Number.parseInt(user.id, 10);
    responseService
      .getResponsesByUser(numericUserId)
      .then((res) => {
        if (!mounted) return;
        setData(res);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : '응답 조회 중 오류가 발생했습니다.');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [user.id]);

  const rows = useMemo(() => {
    const list = data?.responses ?? [];
    const sorted = [...list].sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
    if (range === 'all') return sorted;
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return sorted.filter((r) => new Date(r.submittedAt) >= start);
  }, [data, range]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="body2" color="error">
          {error}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          잠시 후 다시 시도해 주세요.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          mb: 1.5,
          gap: isMobile ? 1.5 : 0,
          flexDirection: 'row',
        }}
      >
        <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 700 }}>
          최근 응답 기록
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'row' }}>
          <Button
            size="small"
            variant={range === '7d' ? 'contained' : 'outlined'}
            color={range === '7d' ? 'primary' : 'inherit'}
            sx={{ borderRadius: 2, px: 2 }}
            onClick={() => setRange('7d')}
            disabled={loading}
          >
            최근 7일
          </Button>
          <Button
            size="small"
            variant={range === 'all' ? 'contained' : 'outlined'}
            color={range === 'all' ? 'primary' : 'inherit'}
            sx={{ borderRadius: 2, px: 2 }}
            onClick={() => setRange('all')}
            disabled={loading}
          >
            전체 기록 보기
          </Button>
        </Box>
      </Box>

      <TableContainer
        sx={{
          borderRadius: 2,
          border: (themeArg) => `1px solid ${themeArg.palette.divider}`,
          overflowX: 'auto',
          flex: 1,
        }}
      >
        <Table sx={{ minWidth: isMobile ? 600 : 'auto' }}>
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: isMobile ? '0.875rem' : '1rem' }}>날짜</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: isMobile ? '0.875rem' : '1rem' }}>질문</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: isMobile ? '0.875rem' : '1rem' }}>답변</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: isMobile ? '0.875rem' : '1rem' }}>응답 시간</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((record) => {
              const date = new Date(record.submittedAt);
              const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
              const timeStr = date.toLocaleTimeString('ko-KR', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });

              return (
                <TableRow key={`${record.responseId}-${record.submittedAt}`}>
                  <TableCell sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                    {dateStr}
                  </TableCell>
                  <TableCell sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>{record.questionTitle}</TableCell>
                  <TableCell sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>{extractAnswer(record)}</TableCell>
                  <TableCell sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                    {timeStr}
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>
                  응답 기록이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default UserDetailResponses;


