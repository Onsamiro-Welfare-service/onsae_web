import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { Iconify } from '@/components/iconify';
import { uploadService } from '@/services/uploadService';
import { fileService } from '@/services/fileService';

import type { UploadRow } from '../upload-table-row';
import type { UploadResponse } from '@/types/api';


// ----------------------------------------------------------------------

type UploadDetailModalProps = {
  open: boolean;
  onClose: () => void;
  response: UploadRow | null;
};

export function UploadDetailModal({ open, onClose, response }: UploadDetailModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [uploadDetail, setUploadDetail] = useState<UploadResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    if (open && response) {
      fetchUploadDetail();
    } else {
      setUploadDetail(null);
      setAdminResponse('');
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, response]);

  const fetchUploadDetail = async () => {
    if (!response) return;

    try {
      setIsLoading(true);
      setError(null);
      const detail = await uploadService.getUploadDetail(response.id);
      setUploadDetail(detail);
      setAdminResponse(detail.adminResponse || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : '상세 정보를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!response || !adminResponse.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const updated = await uploadService.submitAdminResponse(response.id, {
        response: adminResponse.trim(),
      });
      setUploadDetail(updated);
      // 모달을 닫지 않고 업데이트된 정보만 표시
    } catch (err) {
      setError(err instanceof Error ? err.message : '응답을 제출하지 못했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 이미지 파일 필터링
  const imageFiles = uploadDetail?.files.filter((file) => file.fileType === 'IMAGE') || [];
  const hasImages = imageFiles.length > 0;
  console.log(imageFiles);
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            p: isMobile ? 0 : 3,
            borderBottom: (themeArg) => `1px solid ${themeArg.palette.divider}`,
            flexDirection: 'row',
            gap: isMobile ? 2 : 0,
            flexShrink: 0,
          }}
        >
          <Box sx={{ p: { xs: 1, md: 0 } }}>
            <Typography variant={isMobile ? 'h4' : 'h5'} sx={{ fontWeight: 700 }}>
              메시지 상세 정보
            </Typography>
            {uploadDetail && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                업로드 일시 {new Date(uploadDetail.createdAt).toLocaleString('ko-KR')}
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              position: isMobile ? 'absolute' : 'relative',
              top: isMobile ? 16 : 'auto',
              right: isMobile ? 16 : 'auto',
            }}
          >
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: isMobile ? 2 : 3,
            flex: 1,
            overflow: 'auto',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : uploadDetail ? (
            <>
              {/* 이용자 정보 - 가장 위 */}
              <Box>
                <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 700, mb: 2 }}>
                  이용자 정보
                </Typography>
                <Stack spacing={1.5}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {uploadDetail.userName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    기관: {uploadDetail.institutionName}
                  </Typography>
                </Stack>
              </Box>

              {/* 업로드 내용 */}
              <Box>
                <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 700, mb: 2 }}>
                  업로드 내용
                </Typography>

                {/* 사진과 텍스트 레이아웃 */}
                <Stack
                  direction={isMobile ? 'column' : 'row'}
                  spacing={isMobile ? 2 : 3}
                  alignItems={isMobile ? 'flex-start' : 'flex-start'}
                >
                  {/* 사진 영역 (왼쪽) - 사진이 있을 때만 표시 */}
                  {hasImages && (
                    <Box
                      sx={{
                        width: isMobile ? '100%' : '300px',
                        flexShrink: 0,
                      }}
                    >
                      {imageFiles.map((file) => (
                        <Box
                          key={file.id}
                          component="img"
                          src={fileService.getFileUrl(file.id)}
                          alt={file.fileName}
                          sx={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: 2,
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                            objectFit: 'contain',
                            mb: 1,
                          }}
                          onError={(e) => {
                            // 이미지 로드 실패 시 숨김
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  {/* 텍스트 영역 (오른쪽 또는 전체) */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                          제목
                        </Typography>
                        <Typography variant="body2">{uploadDetail.title}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                          작성된 텍스트
                        </Typography>
                        <Typography variant="body2">{uploadDetail.content}</Typography>
                      </Box>
                      {uploadDetail.adminResponse && (
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                            관리자 응답
                          </Typography>
                          <Typography variant="body2">{uploadDetail.adminResponse}</Typography>
                          {uploadDetail.adminResponseDate && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                              {new Date(uploadDetail.adminResponseDate).toLocaleString('ko-KR')}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Box>

              {/* 관리자 응답 입력 */}
              {!uploadDetail.adminRead && (
                <Box>
                  <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 700, mb: 2 }}>
                    관리자 응답
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="응답 내용을 입력하세요..."
                    variant="outlined"
                  />
                </Box>
              )}
            </>
          ) : null}
        </DialogContent>

        <DialogActions
          sx={{
            p: isMobile ? 2 : 3,
            bgcolor: 'grey.100',
            borderTop: (themeArg) => `1px solid ${themeArg.palette.divider}`,
            justifyContent: 'flex-end',
            gap: 1,
            flexShrink: 0,
          }}
        >
          <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
            닫기
          </Button>
          {uploadDetail && !uploadDetail.adminRead && (
            <Button
              variant="contained"
              color="success"
              sx={{ borderRadius: 2 }}
              onClick={handleSubmitResponse}
              disabled={isSubmitting || !adminResponse.trim()}
            >
              {isSubmitting ? '제출 중...' : '응답 제출'}
            </Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
}
