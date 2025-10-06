
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

import type { ResponseProps } from '../response-table-row';

// ----------------------------------------------------------------------

type ResponseDetailModalProps = {
  open: boolean;
  onClose: () => void;
  response: ResponseProps | null;
};

const statusLabelMap: Record<ResponseProps['status'], string> = {
  completed: '완료',
  incomplete: '미완료',
};

const statusColorMap: Record<ResponseProps['status'], 'success' | 'warning'> = {
  completed: 'success',
  incomplete: 'warning',
};

export function ResponseDetailModal({ open, onClose, response }: ResponseDetailModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!response) {
    return null;
  }

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
          overflow: 'hidden', // Dialog ?먯껜???ㅽ겕濡?諛⑹?
          minHeight: isMobile ? '100vh' : '90vh',
          flex: 1,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',flex: 1 }}>
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            p: isMobile ? 0 : 3,
            borderBottom: (themeArg) => `1px solid ${themeArg.palette.divider}`,
            flexDirection: 'row',
            gap: isMobile ? 2 : 0,
            flexShrink: 0, // ?ㅻ뜑 怨좎젙
          }}
        >
          <Box sx={{p: {xs: 1, md: 0}}}>
            <Typography variant={isMobile ? 'h4' : 'h5'} sx={{ fontWeight: 700 }}>
              응답 상세 정보
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              제출일시: {response.submittedAt}
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
            overflow: 'auto', // DialogContent?먯꽌 ?ㅽ겕濡?諛쒖깮
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Box
            sx={{
              mt: 2,
              mb: 2,
              p: 3,
              borderRadius: 2,
              bgcolor: 'background.default',
              border: (themeArg) => `1px solid ${themeArg.palette.divider}`,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? 1 : 2,
              }}
            >
              <Box>
                <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 600 }}>
                  {response.userName} ({response.userCode})
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  ?뚯슂 ?쒓컙 {response.responseTime}遺?
                </Typography>
              </Box>
              <Label variant="soft" color={statusColorMap[response.status]} sx={{ fontWeight: 600 }}>
                {statusLabelMap[response.status]}
              </Label>
            </Box>
          </Box>

          <Box>
            <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 700, mb: 2 }}>
              ?곸꽭 응답
            </Typography>
            <Stack
              spacing={2}
              sx={{ '& > *': { borderRadius: 2, border: (themeArg) => `1px solid ${themeArg.palette.divider}`, p: 3 } }}
            >
              {response.detailedResponses.map((item, index) => (
                <Box key={item.questionId}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Q{index + 1}. {item.questionTitle}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    A. {item.answer}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: 'background.default',
              border: (themeArg) => `1px solid ${themeArg.palette.divider}`,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              異붽? ?뺣낫
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  응답 ?붿빟
                </Typography>
                <Typography variant="body2">{response.responseSummary}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  鍮꾧퀬
                </Typography>
                <Typography variant="body2">-</Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <Divider sx={{ m: 0 }} />

      </Box>
    </Dialog>
  );
}

