import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ChangeEvent } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from '@/layouts/dashboard';
import { responseService } from '@/services/responseService';

import { Scrollbar } from '@/components/scrollbar';

import { ResponseTableToolbar } from '../response-table-toolbar';
import { UserResponseDetailModal } from '../components/user-response-detail-modal';
import { applyFilter, getComparator } from '../utils';

import type { Response } from '@/types/api';
import type { ResponseProps } from '../response-table-row';

// ----------------------------------------------------------------------

const mapResponseToRow = (response: Response): ResponseProps => ({ ...response });

type GroupedResponse = {
  date: string;
  userGroup: {
    user: string;
    userId: string;
    responses: ResponseProps[];
  }[];
};

const groupResponsesByDateAndUser = (responses: ResponseProps[]): GroupedResponse[] => {
  const grouped: Record<string, Record<string, ResponseProps[]>> = {};

  responses.forEach((response) => {
    const date = new Date(response.submittedAt).toLocaleDateString('ko-KR');
    const userId = response.userId;

    if (!grouped[date]) {
      grouped[date] = {};
    }
    if (!grouped[date][userId]) {
      grouped[date][userId] = [];
    }
    grouped[date][userId].push(response);
  });

  return Object.entries(grouped)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .map(([date, userMap]) => ({
      date,
      userGroup: Object.entries(userMap)
        .map(([userId, responses]) => ({
          user: responses[0].userName,
          userId,
          responses,
        }))
        .sort((a, b) => a.user.localeCompare(b.user)),
    }));
};

export function ResponseView() {
  const [filterName, setFilterName] = useState('');
  const [responses, setResponses] = useState<ResponseProps[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<ResponseProps | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchResponses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await responseService.getRecentResponses(50);
        if (!isMounted) return;

        const mapped = result.map((item) => mapResponseToRow(item));
        setResponses(mapped);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : '응답 데이터를 불러오지 못했습니다.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchResponses();

    return () => {
      isMounted = false;
    };
  }, []);

  const dataFiltered: ResponseProps[] = applyFilter({
    inputData: responses,
    comparator: getComparator('desc', 'submittedAt'),
    filterName,
  });

  const groupedResponses = useMemo(() => groupResponsesByDateAndUser(dataFiltered), [dataFiltered]);

  const notFound = !isLoading && !groupedResponses.length && filterName !== '';

  const handleFilterName = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      setFilterName(event.target.value);
  }, []);

  const handleRowClick = useCallback((response: ResponseProps) => {
    setSelectedResponse(response);
    setDetailModalOpen(true);
  }, []);

  const handleDetailModalClose = useCallback(() => {
    setDetailModalOpen(false);
    setSelectedResponse(null);
  }, []);

  return (
    <DashboardContent maxWidth="xl">
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          응답 관리
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <ResponseTableToolbar
          numSelected={0}
          filterName={filterName}
          onFilterName={handleFilterName}
        />

        {error && (
          <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ p: 3 }}>
                {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                      <CircularProgress size={32} />
            </Box>
          )}

          {!isLoading && (
            <Scrollbar>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {groupedResponses.map((dayGroup) => (
                  <Box key={dayGroup.date}>
                    {/* 날짜 헤더 */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        pb: 1,
                        borderBottom: (theme) => `2px solid ${theme.palette.primary.main}`,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {dayGroup.date}
                      </Typography>
                      <Chip
                        label={`${dayGroup.userGroup.reduce((sum, group) => sum + group.responses.length, 0)}개 응답`}
                        size="small"
                        sx={{ ml: 2 }}
                      />
                    </Box>

                    {/* 사용자별 그룹 */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {dayGroup.userGroup.map((userGroup) => (
                        <Card
                          key={`${dayGroup.date}-${userGroup.userId}`}
                          sx={{
                            p: 2,
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                            '&:hover': {
                              boxShadow: 2,
                            },
                            cursor: 'pointer',
                          }}
                          onClick={() => handleRowClick(userGroup.responses[0])}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {userGroup.user}
                            </Typography>
                            <Chip
                              label={`${userGroup.responses.length}개 질문`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>

                          <Divider sx={{ my: 1 }} />

                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {userGroup.responses.slice(0, 3).map((resp, idx) => (
                              <Typography
                                key={resp.id}
                                variant="body2"
                                sx={{
                                  color: 'text.secondary',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {idx + 1}. {resp.questionTitle}: {resp.responseText}
                              </Typography>
                            ))}
                            {userGroup.responses.length > 3 && (
                              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                +{userGroup.responses.length - 3}개 더 보기
                              </Typography>
                            )}
                          </Box>
                        </Card>
                      ))}
                    </Box>
                  </Box>
                ))}

                {notFound && (
                  <Box
                    sx={{
                      py: 6,
                      px: 3,
                      textAlign: 'center',
                      border: (theme) => `1px dashed ${theme.palette.divider}`,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      찾을 수 없음
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      <strong>&quot;{filterName}&quot;</strong>에 대한 결과를 찾을 수 없습니다.
                      <br /> 다른 검색어를 시도해보세요.
                    </Typography>
                  </Box>
                )}
              </Box>
        </Scrollbar>
          )}
        </Box>
      </Card>

      <UserResponseDetailModal
        open={detailModalOpen}
        onClose={handleDetailModalClose}
        response={selectedResponse}
      />
    </DashboardContent>
  );
}

