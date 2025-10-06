import { useState } from 'react';
import type { ChangeEvent } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from '@/components/iconify';
import type { CreateQuestionRequest } from '@/types/api';

// ----------------------------------------------------------------------

type QuestionAddModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (questionData: CreateQuestionRequest) => Promise<void>;
};

const QUESTION_TYPES = [
  { value: '단일 선택', label: '단일 선택' },
  { value: '다중 선택', label: '다중 선택' },
  { value: '텍스트 입력', label: '텍스트 입력' },
  { value: '스케일', label: '스케일' },
  { value: '예/아니오', label: '예/아니오' },
];

const OPTION_TYPES = new Set(['단일 선택', '다중 선택', '예/아니오', '스케일']);

const PRIORITIES = [
  { value: '높음', label: '높음' },
  { value: '중간', label: '중간' },
  { value: '낮음', label: '낮음' },
];

const CATEGORIES = [
  { value: '건강상태', label: '건강상태' },
  { value: '생활습관', label: '생활습관' },
  { value: '정신건강', label: '정신건강' },
  { value: '사회활동', label: '사회활동' },
  { value: '의료상담', label: '의료상담' },
];

const createInitialFormState = (): CreateQuestionRequest => ({
  title: '',
  content: '',
  category: '',
  type: '단일 선택',
  priority: '중간',
  options: [''],
});

export function QuestionAddModal({ open, onClose, onSave }: QuestionAddModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState<CreateQuestionRequest>(() => createInitialFormState());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requiresOptions = OPTION_TYPES.has(formData.type);

  const resetForm = () => {
    setFormData(createInitialFormState());
    setError(null);
  };

  const handleInputChange = (field: keyof CreateQuestionRequest) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;

    setFormData((prev) => {
      if (field === 'options') {
        return prev;
      }

      const next = { ...prev, [field]: value } as CreateQuestionRequest;

      if (field === 'type') {
        if (OPTION_TYPES.has(value)) {
          if (prev.options.length === 0) {
            next.options = [''];
          }
        } else {
          next.options = [];
        }
      }

      return next;
    });
    setError(null);
  };

  const handleSelectType = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value,
      options: OPTION_TYPES.has(value) ? (prev.options.length ? prev.options : ['']) : [],
    }));
    setError(null);
  };

  const handleOptionChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const newOptions = [...formData.options];
    newOptions[index] = event.target.value;
    setFormData((prev) => ({
      ...prev,
      options: newOptions,
    }));
    setError(null);
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, ''],
    }));
    setError(null);
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 1) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        options: newOptions,
      }));
      setError(null);
    }
  };

  const handleCancel = () => {
    if (isSubmitting) {
      return;
    }
    resetForm();
    onClose();
  };

  const handleDialogClose = () => {
    if (isSubmitting) {
      return;
    }
    handleCancel();
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim() || !formData.category.trim()) {
      setError('질문 제목, 내용, 카테고리는 필수 항목입니다.');
      return;
    }

    const normalizedOptions = requiresOptions
      ? formData.options.map((option) => option.trim()).filter(Boolean)
      : [];

    if (requiresOptions && normalizedOptions.length === 0) {
      setError('선택형 질문은 최소 1개의 옵션이 필요합니다.');
      return;
    }

    const payload: CreateQuestionRequest = {
      ...formData,
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category.trim(),
      options: normalizedOptions,
    };

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave(payload);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '질문을 저장하지 못했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (isSubmitting) {
          return;
        }
        handleDialogClose();
      }}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          bgcolor: 'rgba(26, 26, 26, 0.8)',
          m: isMobile ? 0 : 2,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          minHeight: isMobile ? '100vh' : '90vh',
          flex: 1,
        },
      }}
    >
      <Card
        sx={{
          bgcolor: 'white',
          borderRadius: isMobile ? 0 : 3,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flex: 1,
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: isMobile ? 2 : 3,
            borderBottom: '1px solid #e6e6e6',
            flexShrink: 0,
          }}
        >
          <Typography variant={isMobile ? 'h4' : 'h5'} sx={{ fontWeight: 700 }}>
            새 질문 만들기
          </Typography>
          <IconButton
            onClick={() => {
              if (!isSubmitting) {
                handleCancel();
              }
            }}
            sx={{ color: 'text.secondary' }}
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
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ mb: 2, fontWeight: 600 }}>
              질문 기본 정보
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="질문 제목 *"
                value={formData.title}
                onChange={handleInputChange('title')}
                placeholder="예: 오늘의 기분은 어떠세요?"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fafafa',
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                fullWidth
                multiline
                minRows={3}
                label="질문 내용 *"
                value={formData.content}
                onChange={handleInputChange('content')}
                placeholder="질문에 대한 상세 설명을 입력하세요..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fafafa',
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ mb: 2, fontWeight: 600 }}>
              질문 유형 설정
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {QUESTION_TYPES.map((type) => {
                const isActive = formData.type === type.value;
                return (
                  <Button
                    key={type.value}
                    variant={isActive ? 'contained' : 'outlined'}
                    onClick={() => handleSelectType(type.value)}
                    disabled={isSubmitting}
                    sx={{
                      borderRadius: 2,
                      bgcolor: isActive ? '#177578' : 'transparent',
                      borderColor: '#cccccc',
                      color: isActive ? '#ffffff' : '#1a1a1a',
                      '&:hover': {
                        bgcolor: isActive ? '#0f5a5c' : '#f0f0f0',
                      },
                    }}
                  >
                    {type.label}
                  </Button>
                );
              })}
            </Box>
          </Box>

          {requiresOptions && (
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 600 }}>
                  선택 옵션 설정
                </Typography>
                <Button
                  variant="contained"
                  onClick={addOption}
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  disabled={isSubmitting}
                  sx={{
                    bgcolor: '#177578',
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: '#0f5a5c',
                    },
                  }}
                >
                  옵션 추가
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {formData.options.map((option, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      value={option}
                      onChange={handleOptionChange(index)}
                      placeholder={`옵션 ${index + 1}`}
                      disabled={isSubmitting}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: '#ffffff',
                          borderRadius: 2,
                        },
                      }}
                    />
                    {formData.options.length > 1 && (
                      <IconButton
                        onClick={() => removeOption(index)}
                        disabled={isSubmitting}
                        sx={{ color: 'text.secondary' }}
                      >
                        <Iconify icon="mingcute:delete-2-line" />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
            <TextField
              fullWidth
              select
              label="카테고리"
              value={formData.category}
              onChange={handleInputChange('category')}
              SelectProps={{ native: true }}
              disabled={isSubmitting}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#fafafa',
                  borderRadius: 2,
                },
              }}
            >
              <option value="">카테고리 선택</option>
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </TextField>

            <TextField
              fullWidth
              select
              label="우선순위"
              value={formData.priority}
              onChange={handleInputChange('priority')}
              SelectProps={{ native: true }}
              disabled={isSubmitting}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#fafafa',
                  borderRadius: 2,
                },
              }}
            >
              {PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </TextField>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: isMobile ? 2 : 3,
            bgcolor: '#f2f2f2',
            borderTop: '1px solid #e6e6e6',
            justifyContent: 'space-between',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 2 : 0,
            flexShrink: 0,
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              disabled={isSubmitting}
              sx={{
                borderColor: '#cccccc',
                color: '#666666',
                borderRadius: 2,
              }}
            >
              미리보기
            </Button>
            <Button
              variant="outlined"
              disabled={isSubmitting}
              sx={{
                borderColor: '#cccccc',
                color: '#666666',
                borderRadius: 2,
              }}
            >
              템플릿 저장
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={handleCancel}
              variant="outlined"
              disabled={isSubmitting}
              sx={{
                borderColor: '#cccccc',
                color: '#666666',
                borderRadius: 2,
              }}
            >
              취소
            </Button>

            <Button
              onClick={handleSave}
              variant="contained"
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <Iconify icon="mingcute:check-fill" />
                )
              }
              sx={{
                bgcolor: '#177578',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: '#0f5a5c',
                },
              }}
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </Button>
          </Box>
        </DialogActions>
      </Card>
    </Dialog>
  );
}
