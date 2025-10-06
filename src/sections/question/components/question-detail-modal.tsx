
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from '@/components/iconify';

import type { QuestionProps } from '../question-table-row';

// ----------------------------------------------------------------------

type QuestionDetailModalProps = {
  open: boolean;
  onClose: () => void;
  question: QuestionProps | null;
};

const priorityColorMap: Record<string, string> = {
  긴급: 'error.main',
  중요: 'info.main',
  일반: 'success.main',
};

const statusLabelMap: Record<'active' | 'inactive', string> = {
  active: '활성',
  inactive: '비활성',
};

const statusColorMap: Record<'active' | 'inactive', string> = {
  active: 'success.main',
  inactive: 'grey.500',
};

export function QuestionDetailModal({ open, onClose, question }: QuestionDetailModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!question) {
    return null;
  }

  const getPriorityColor = (priority: string) => priorityColorMap[priority] ?? 'primary.main';

  const stats = [
    { label: '총 응답 수', value: question.totalResponses.toLocaleString() },
    { label: '응답률', value: `${question.responseRate}%` },
    { label: '평균 응답 시간', value: `${question.avgResponseTime}분` },
    { label: '마지막 응답', value: question.lastResponse },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          m: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100vh' : '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden', // Dialog 자체의 스크롤 방지
          minHeight: isMobile ? '100vh' : '90vh',
          flex: 1,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',flex: 1 }}>
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: isMobile ? 'flex-start' : 'center',
            p: isMobile ? 0 : 3,
            borderBottom: (themeArg) => `1px solid ${themeArg.palette.divider}`,
            flexDirection: 'row',
            gap: isMobile ? 2 : 0,
            flexShrink: 0, // 헤더 고정
          }}
        >
          <Box sx={{ width: '100%',display: 'flex', flexDirection: {xs: 'column', md: 'row'} ,p: {xs: 1, md: 0}}}>
            <Box sx={{ display: 'flex', flexDirection: 'row' , alignItems: 'center' ,gap: 1 }}>
              <Typography variant={isMobile ? 'h4' : 'h5'} sx={{ fontWeight: 700, mb: 1 }}>
                {question.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                등록일 {question.createdAt} · 작성자 {question.createdBy}
              </Typography>
            </Box>
            <Box
              sx={{
                mt: {xs: 1.5, md: 0.7},
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Chip label={question.category} size="small" sx={{ bgcolor: 'grey.100', color: 'text.primary' }} />
              <Chip label={question.type} size="small" sx={{ bgcolor: 'grey.100', color: 'text.primary' }} />
              <Chip
                label={`우선순위: ${question.priority}`}
                size="small"
                sx={{ bgcolor: getPriorityColor(question.priority), color: 'common.white' }}
              />
              <Chip
                label={statusLabelMap[question.status]}
                size="small"
                sx={{ bgcolor: statusColorMap[question.status], color: 'common.white' }}
              />
            </Box>
          </Box>

          <IconButton
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              position: 'relative',
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
          }}
        >

          <Box sx={{ mb: 4 }}>
            <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 700, mb: 2 }}>
              질문 내용
            </Typography>
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: 'background.default',
                border: (themeArg) => `1px solid ${themeArg.palette.divider}`,
              }}
            >
              <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                {question.content}
              </Typography>
              {!!question.options.length && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    선택지
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {question.options.map((option, index) => (
                      <Box
                        key={option}
                        sx={{
                          px: 2,
                          py: 1,
                          borderRadius: 1,
                          bgcolor: 'grey.100',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                        }}
                      >
                        <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 24 }}>
                          {index + 1}.
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.primary' }}>
                          {option}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          <Box>
            <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 700, mb: 2 }}>
              응답 통계
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                gap: 2,
              }}
            >
              {stats.map((stat) => (
                <Box
                  key={stat.label}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    border: (themeArg) => `1px solid ${themeArg.palette.divider}`,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    {stat.label}
                  </Typography>
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {stat.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: isMobile ? 2 : 3,
            bgcolor: 'grey.100',
            borderTop: (themeArg) => `1px solid ${themeArg.palette.divider}`,
            justifyContent: 'flex-end',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 2 : 0,
            flexShrink: 0, // 푸터 고정
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexDirection:  'row',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              sx={{
                borderRadius: 2,
                width: isMobile ? '100%' : 'auto',
                color: 'error.main',
                borderColor: 'error.light',
              }}
            >
              삭제
            </Button>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:pen-bold" />}
              sx={{ borderRadius: 2, width: isMobile ? '100%' : 'auto' }}
            >
              수정
            </Button>
          </Box>

        </DialogActions>
      </Box>
    </Dialog>
  );
}

