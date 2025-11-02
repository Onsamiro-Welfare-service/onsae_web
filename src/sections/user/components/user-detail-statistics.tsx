import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { questionService, type UserQuestionStatistics } from '@/services/questionService';
import type { UserProps } from '../user-table-row';

type UserDetailStatisticsProps = {
  user: UserProps;
};

export function UserDetailStatistics({ user }: UserDetailStatisticsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<UserQuestionStatistics | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    questionService
      .getUserQuestionStatistics(Number(user.id))
      .then((data) => {
        if (!mounted) return;
        setStatistics(data);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : '통계 데이터를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user.id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, py: 3 }}>
        <Typography variant="body2" color="error">
          {error}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          잠시 후 다시 시도해 주세요.
        </Typography>
      </Box>
    );
  }

  if (!statistics) {
    return (
      <Box sx={{ py: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          통계 데이터가 없습니다.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 700 }}>
        응답 통계
      </Typography>

      {/* 요약 카드 */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2, bgcolor: 'primary.lighter' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
              할당된 질문
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {statistics.totalAssignedQuestions}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2, bgcolor: 'success.lighter' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
              완료한 질문
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
              {statistics.totalCompletedQuestions}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2, bgcolor: 'info.lighter' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
              완료율
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
              {statistics.completionRate.toFixed(1)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={statistics.completionRate}
              sx={{ mt: 1, height: 6, borderRadius: 1 }}
            />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2, bgcolor: 'warning.lighter' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
              평균 응답 시간
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
              {statistics.averageResponseTime.toFixed(0)}초
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* 질문별 상세 통계 */}
      <Box>
        <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ fontWeight: 700, mb: 2 }}>
          질문별 상세 통계
        </Typography>
        <TableContainer
          sx={{
            borderRadius: 2,
            border: (themeArg) => `1px solid ${themeArg.palette.divider}`,
            overflowX: 'auto',
          }}
        >
          <Table sx={{ minWidth: isMobile ? 600 : 'auto' }}>
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: isMobile ? '0.875rem' : '1rem' }}>
                  질문 제목
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: isMobile ? '0.875rem' : '1rem' }}>
                  카테고리
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: isMobile ? '0.875rem' : '1rem' }}>
                  유형
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: isMobile ? '0.875rem' : '1rem' }}>
                  상태
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: isMobile ? '0.875rem' : '1rem' }}>
                  응답 수
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: isMobile ? '0.875rem' : '1rem' }}>
                  응답 시간(초)
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: isMobile ? '0.875rem' : '1rem' }}>
                  최근 응답일
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statistics.questionStatistics.map((stat) => (
                <TableRow key={stat.questionId}>
                  <TableCell sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                    {stat.questionTitle}
                  </TableCell>
                  <TableCell sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                    {stat.categoryName || '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                    {stat.questionType}
                  </TableCell>
                  <TableCell sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: stat.isCompleted ? 'success.lighter' : 'grey.200',
                        color: stat.isCompleted ? 'success.main' : 'text.secondary',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      {stat.isCompleted ? '완료' : '미완료'}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                    {stat.responseCount}
                  </TableCell>
                  <TableCell sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                    {stat.responseTimeSeconds ?? '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                    {stat.lastResponseAt
                      ? new Date(stat.lastResponseAt).toLocaleDateString('ko-KR')
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
              {statistics.questionStatistics.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ color: 'text.secondary' }}>
                    질문 통계가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

export default UserDetailStatistics;
