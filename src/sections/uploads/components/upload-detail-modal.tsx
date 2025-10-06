import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from '@/components/iconify';
import { Label } from '@/components/label';

import type { UploadRow } from '../upload-table-row';

// ----------------------------------------------------------------------

type UploadDetailModalProps = {
  open: boolean;
  onClose: () => void;
  response: UploadRow | null;
};

const STATUS_TEXT: Record<UploadRow['status'], string> = {
  completed: '확인 완료',
  incomplete: '처리 대기',
};

const STATUS_COLOR: Record<UploadRow['status'], 'success' | 'warning'> = {
  completed: 'success',
  incomplete: 'warning',
};

const getUploadInfo = (row: UploadRow) =>
  row.id.includes('photo')
    ? { label: row.uploadType, icon: 'solar:camera-bold' as const }
    : { label: row.uploadType, icon: 'solar:document-bold' as const };

export function UploadDetailModal({ open, onClose, response }: UploadDetailModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!response) {
    return null;
  }

  const uploadInfo = getUploadInfo(response);

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
              업로드 상세 정보
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              업로드 일시 {response.submittedAt}
            </Typography>
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
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: 'background.default',
              border: (themeArg) => `1px solid ${themeArg.palette.divider}`,
            }}
          >
            <Stack
              direction={isMobile ? 'column' : 'row'}
              spacing={isMobile ? 2 : 3}
              alignItems={isMobile ? 'flex-start' : 'center'}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Iconify icon={uploadInfo.icon} width={36} height={36} />
                <Box>
                  <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 600 }}>
                    {uploadInfo.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    처리 소요 시간 {response.responseTime}분
                  </Typography>
                </Box>
              </Stack>

              <Label variant="soft" color={STATUS_COLOR[response.status]} sx={{ fontWeight: 600 }}>
                {STATUS_TEXT[response.status]}
              </Label>
            </Stack>
          </Box>

          <Box>
            <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 700, mb: 2 }}>
              이용자 정보
            </Typography>
            <Stack spacing={1.5}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {response.userName} ({response.userCode})
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                질문 제목: {response.questionTitle}
              </Typography>
            </Stack>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box>
            <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 700, mb: 2 }}>
              업로드 내용
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  선택 답변
                </Typography>
                <Typography variant="body2">
                  {Array.isArray(response.responseData.선택답변)
                    ? response.responseData.선택답변.join(', ')
                    : response.responseData.선택답변 ?? '응답 없음'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  기타 의견
                </Typography>
                <Typography variant="body2">
                  {response.responseData.기타의견 ?? '기타 의견 없음'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  상세 내용
                </Typography>
                <Typography variant="body2">{response.responseText}</Typography>
              </Box>
            </Stack>
          </Box>
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
          <Button
            variant="contained"
            color={response.status === 'completed' ? 'primary' : 'success'}
            sx={{ borderRadius: 2 }}
          >
            {response.status === 'completed' ? '재검토' : '검토 완료'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
