import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from '@/components/iconify';
import { Label } from '@/components/label';

import { responseService } from '@/services/responseService';

import type { ResponseProps } from '../response-table-row';
import type { DetailedResponse, UserResponsesResponse } from '@/types/api';

// ----------------------------------------------------------------------

type UserResponseDetailModalProps = {
  open: boolean;
  onClose: () => void;
  response: ResponseProps | null;
};

const questionTypeLabelMap: Record<string, string> = {
  SINGLE_CHOICE: '객관식 (단일)',
  MULTIPLE_CHOICE: '객관식 (복수)',
  TEXT: '주관식',
  SCALE: '척도형',
  YES_NO: '예/아니오',
  DATE: '날짜',
  TIME: '시간',
};

const getAnswerDisplay = (response: DetailedResponse): string => {
  const { responseData } = response;

  if (responseData.answer !== undefined) {
    if (typeof responseData.answer === 'boolean') {
      return responseData.answer ? '예' : '아니오';
    }
    if (Array.isArray(responseData.answers)) {
      return responseData.answers.join(', ');
    }
    // 단일 선택에서 "기타" 옵션을 선택한 경우 otherText 표시
    if (responseData.answer === 'other' && responseData.otherText) {
      return responseData.otherText;
    }
    return String(responseData.answer);
  }
  
  if (responseData.answers && Array.isArray(responseData.answers)) {
    const answers = responseData.answers.filter(a => a !== 'other').join(', ');
    const hasOther = responseData.answers.includes('other');
    if (hasOther && responseData.otherText) {
      return `${answers} (기타: ${responseData.otherText})`;
    }
    return answers;
  }
  
  if (responseData.otherText) {
    return responseData.otherText;
  }
  
  return response.responseText || '-';
};

export function UserResponseDetailModal({ open, onClose, response }: UserResponseDetailModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [userResponses, setUserResponses] = useState<UserResponsesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !response) {
      return;
    }

    const fetchUserResponses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await responseService.getResponsesByUser(parseInt(response.userId));
        setUserResponses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '응답 데이터를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserResponses();
  }, [open, response]);

  const handleClose = useCallback(() => {
    setUserResponses(null);
    setError(null);
    onClose();
  }, [onClose]);

  if (!response) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          m: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100vh' : '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: isMobile ? '100vh' : '90vh',
          flex: 1,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', flex: 1 }}>
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            p: isMobile ? 2 : 3,
            borderBottom: (themeArg) => `1px solid ${themeArg.palette.divider}`,
            gap: isMobile ? 2 : 0,
            flexShrink: 0,
          }}
        >
          <Box>
            <Typography variant={isMobile ? 'h4' : 'h5'} sx={{ fontWeight: 700 }}>
              응답 상세 정보
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {response.userName} ({response.userCode})
            </Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: 'text.secondary' }}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: isMobile ? 2 : 3,
            flex: 1,
            overflow: 'auto',
            minHeight: 0,
          }}
        >
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
              <CircularProgress size={32} />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!isLoading && userResponses && (
            <>
              {/* 사용자 정보 카드 */}
              <Card
                sx={{
                  p: 3,
                  mb: 3,
                  bgcolor: 'background.default',
                  border: (themeArg) => `1px solid ${themeArg.palette.divider}`,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {userResponses.userName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      총 {userResponses.totalResponses}개의 응답
                    </Typography>
                  </Box>
                  <Chip
                    label={userResponses.totalResponses > 0 ? '활성' : '미응답'}
                    color={userResponses.totalResponses > 0 ? 'success' : 'default'}
                    variant="outlined"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  최근 응답일시: {new Date(userResponses.latestResponseAt).toLocaleString('ko-KR')}
                </Typography>
              </Card>

              {/* 응답 목록 */}
              <Box>
                <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 700, mb: 2 }}>
                  응답 목록
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {userResponses.responses.map((resp, index) => (
                    <Card
                      key={resp.responseId}
                      sx={{
                        p: 2,
                        border: (themeArg) => `1px solid ${themeArg.palette.divider}`,
                        '&:hover': {
                          boxShadow: 2,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            Q{userResponses.responses.length - index}. {resp.questionTitle}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                            {resp.questionContent}
                          </Typography>
                          <Chip
                            label={questionTypeLabelMap[resp.questionType] || resp.questionType}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                        {resp.isModified && (
                          <Chip
                            label={`수정됨 (${resp.modificationCount}회)`}
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                          답변
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                          {getAnswerDisplay(resp)}
                        </Typography>
                        {resp.responseData.note && (
                          <Typography variant="body2" sx={{ color: 'text.secondary', ml: 2 }}>
                            참고: {resp.responseData.note}
                          </Typography>
                        )}
                      </Box>
                      
                      <Box sx={{ mt: 2, pt: 2, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          제출일시: {new Date(resp.submittedAt).toLocaleString('ko-KR')}
                        </Typography>
                        {resp.responseTimeSeconds !== null && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', ml: 2 }}>
                            응답 시간: {resp.responseTimeSeconds}초
                          </Typography>
                        )}
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
      </Box>
    </Dialog>
  );
}

