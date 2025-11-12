
'use client';

import { useState } from 'react';
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
import { questionService } from '@/services/questionService';
import { QuestionEditModal } from './question-edit-modal';

import type { QuestionProps } from '../question-table-row';
import { getQuestionTypeLabel } from '../utils';
// ----------------------------------------------------------------------

type QuestionDetailModalProps = {
  open: boolean;
  onClose: () => void;
  question: QuestionProps | null;
  onQuestionUpdated?: () => void;
};

// priority removed from UI

const statusLabelMap: Record<'active' | 'inactive', string> = {
  active: '활성',
  inactive: '비활성',
};

const statusColorMap: Record<'active' | 'inactive', string> = {
  active: 'success.main',
  inactive: 'grey.500',
};

export function QuestionDetailModal({ open, onClose, question, onQuestionUpdated }: QuestionDetailModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [deleting, setDeleting] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  if (!question) {
    return null;
  }

  const handleDeleteQuestion = async () => {
    if (!confirm(`정말로 '${question.title}' 질문을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setDeleting(true);
      await questionService.deleteQuestion(Number(question.id));
      onQuestionUpdated?.();
      onClose();
      alert('질문이 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('질문 삭제 실패:', error);
      alert('질문 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditQuestion = () => {
    setEditModalOpen(true);
  };

  
  const stats = [
    { label: '총 응답 수', value: question.totalResponses.toLocaleString() },
    { label: '응답률', value: `${question.responseRate}%` },
    { label: '평균 응답 시간', value: `${question.avgResponseTime}분` },
    { label: '마지막 응답', value: question.lastResponse },
  ];

  return (
    <>
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
            maxHeight: isMobile ? '100%' : '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            height: isMobile ? '100%' : 'auto',
          },
        }}
      >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '100%', overflow: 'hidden', flex: 1 }}>
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            p: isMobile ? 1 : 2,
            borderBottom: (themeArg) => `1px solid ${themeArg.palette.divider}`,
            flexDirection: 'row',
            gap: 0,
            flexShrink: 0, // 헤더 고정
            minHeight: 'auto',
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              p: 0.5,
            }}
          >
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>

        <Box sx={{ borderBottom: (themeArg) => `1px solid ${themeArg.palette.divider}`, flexShrink: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexDirection: 'row',
              textAlign: isMobile ? 'center' : 'left',
              width: isMobile ? '100%' : 'auto',
              p: isMobile ? 1.5 : 2,
            }}
          >
            <Box sx={{ width: '100%' }}>
              <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 700 }}>
                {question.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                등록일 {question.createdAt} · 작성자 {question.createdBy}
              </Typography>
              <Box
                sx={{
                  mt: 1,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  justifyContent: isMobile ? 'center' : 'flex-start',
                }}
              >
                <Chip label={question.category} size="small" sx={{ bgcolor: 'grey.100', color: 'text.primary' }} />
                <Chip label={getQuestionTypeLabel(question.type)} size="small" sx={{ bgcolor: 'grey.100', color: 'text.primary' }} />
                <Chip
                  label={statusLabelMap[question.status]}
                  size="small"
                  sx={{ bgcolor: statusColorMap[question.status], color: 'common.white' }}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        <DialogContent
          sx={{
            p: isMobile ? 1.5 : 2,
            flex: 1,
            overflow: 'auto',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >

          <Box sx={{ mb: 3 }}>
            <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 700, mb: 1.5 }}>
              질문 내용
            </Typography>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'background.default',
                border: (themeArg) => `1px solid ${themeArg.palette.divider}`,
              }}
            >
              <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                {question.content}
              </Typography>
              {!!question.options.length && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    선택지
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    {question.options.map((option, index) => (
                      <Box
                        key={option}
                        sx={{
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 1,
                          bgcolor: 'grey.100',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 20 }}>
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
            <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 700, mb: 1.5 }}>
              응답 통계
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                gap: 1.5,
              }}
            >
              {stats.map((stat) => (
                <Box
                  key={stat.label}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    border: (themeArg) => `1px solid ${themeArg.palette.divider}`,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.75 }}>
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
            p: isMobile ? 1.5 : 2,
            bgcolor: 'grey.100',
            borderTop: (themeArg) => `1px solid ${themeArg.palette.divider}`,
            justifyContent: 'flex-end',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1.5 : 0,
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
              onClick={handleDeleteQuestion}
              disabled={deleting}
              sx={{
                borderRadius: 2,
                width: isMobile ? '100%' : 'auto',
                color: 'error.main',
                borderColor: 'error.light',
              }}
            >
              {deleting ? '삭제 중...' : '삭제'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:pen-bold" />}
              onClick={handleEditQuestion}
              sx={{ borderRadius: 2, width: isMobile ? '100%' : 'auto' }}
            >
              수정
            </Button>
          </Box>

        </DialogActions>
      </Box>
    </Dialog>

    <QuestionEditModal
      open={editModalOpen}
      onClose={() => setEditModalOpen(false)}
      question={question}
      onQuestionUpdated={onQuestionUpdated}
    />
    </>
  );
}





