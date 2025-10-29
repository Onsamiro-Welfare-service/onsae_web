import { useState, useEffect } from 'react';
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
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from '@/components/iconify';
import { categoryService } from '@/services/categoryService';
import type { Category } from '@/types/api';
import type { CreateQuestionRequest, QuestionType } from '@/types/api';

// ----------------------------------------------------------------------

type QuestionAddModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (questionData: CreateQuestionRequest) => Promise<void>;
};

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'SINGLE_CHOICE', label: '객관식(단일)' },
  { value: 'MULTIPLE_CHOICE', label: '객관식(복수)' },
  { value: 'TEXT', label: '주관식' },
  { value: 'SCALE', label: '척도형' },
  { value: 'YES_NO', label: '예/아니오' },
  { value: 'DATE', label: '날짜' },
  { value: 'TIME', label: '시간' },
];

const CHOICE_TYPES = new Set<QuestionType>(['SINGLE_CHOICE', 'MULTIPLE_CHOICE']);

// Categories are loaded from backend when modal opens

type LocalFormState = {
  title: string;
  content: string;
  categoryId: number;
  questionType: QuestionType;
  isRequired: boolean;
  allowOtherOption: boolean;
  otherOptionLabel: string;
  otherOptionPlaceholder: string;
};

const createInitialFormState = (): LocalFormState => ({
  title: '',
  content: '',
  categoryId: 0,
  questionType: 'SINGLE_CHOICE',
  isRequired: true,
  allowOtherOption: false,
  otherOptionLabel: '기타',
  otherOptionPlaceholder: '',
});

export function QuestionAddModal({ open, onClose, onSave }: QuestionAddModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState<LocalFormState>(() => createInitialFormState());
  const [choiceLabels, setChoiceLabels] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const requiresChoiceOptions = CHOICE_TYPES.has(formData.questionType);

  const resetForm = () => {
    setFormData(createInitialFormState());
    setChoiceLabels(['']);
    setError(null);
  };

  // Load active categories when modal opens
  useEffect(() => {
    let active = true;
    const fetchCategories = async () => {
      try {
        const list = await categoryService.getActiveCategories();
        if (!active) return;
        setCategories(list);
        // if no selection, default to first category id
        if (list.length && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: list[0].id }));
        }
      } catch (e) {
        // silently ignore in modal; user can retry opening
      }
    };
    if (open) fetchCategories();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleInputChange = (field: keyof LocalFormState) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    if (field === 'categoryId') {
      setFormData((prev) => ({ ...prev, categoryId: Number(value) }));
    } else if (field === 'otherOptionLabel' || field === 'otherOptionPlaceholder' || field === 'title' || field === 'content') {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    setError(null);
  };

  const handleToggle = (field: 'isRequired' | 'allowOtherOption') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.target.checked;
    setFormData((prev) => ({ ...prev, [field]: checked }));
    setError(null);
  };

  const handleSelectType = (value: QuestionType) => {
    setFormData((prev) => ({
      ...prev,
      questionType: value,
    }));
    if (!CHOICE_TYPES.has(value)) {
      setChoiceLabels(['']);
    }
    setError(null);
  };

  const handleChoiceLabelChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const next = [...choiceLabels];
    next[index] = event.target.value;
    setChoiceLabels(next);
  };

  const addChoiceOption = () => {
    setChoiceLabels((prev) => ([...prev, '' ]));
  };

  const removeChoiceOption = (index: number) => {
    if (choiceLabels.length <= 1) return;
    setChoiceLabels((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const buildOptionsForPayload = () => {
    switch (formData.questionType) {
      case 'SINGLE_CHOICE':
        return {
          type: 'single' as const,
          options: choiceLabels
            .map((label, idx) => ({ value: String(idx + 1), label: label.trim() }))
            .filter((o) => o.label),
        };
      case 'MULTIPLE_CHOICE':
        return {
          type: 'multiple' as const,
          options: choiceLabels
            .map((label, idx) => ({ value: String(idx + 1), label: label.trim() }))
            .filter((o) => o.label),
        };
      case 'SCALE':
        return { type: 'scale' as const, min: 1, max: 5 };
      case 'TEXT':
        return { type: 'text' as const, maxLength: 500 };
      case 'DATE':
        return { type: 'date' as const, defaultToday: true };
      case 'TIME':
        return { type: 'time' as const };
      case 'YES_NO':
        return null; // backend can infer yes/no
      default:
        return null;
    }
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.title.trim()) throw new Error('제목을 입력해주세요.');
      if (!formData.content.trim()) throw new Error('내용을 입력해주세요.');
      if (!formData.categoryId) throw new Error('카테고리를 선택해주세요.');

      if (requiresChoiceOptions) {
        const validCount = choiceLabels.filter((label) => label.trim()).length;
        if (validCount < 2) throw new Error('객관식 옵션은 최소 2개 이상 필요합니다.');
      }

      const options = buildOptionsForPayload();

      const payload: CreateQuestionRequest = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        questionType: formData.questionType,
        categoryId: formData.categoryId,
        options: options,
        isRequired: formData.isRequired,
        ...(formData.questionType === 'SINGLE_CHOICE' || formData.questionType === 'MULTIPLE_CHOICE'
          ? {
              allowOtherOption: formData.allowOtherOption,
              otherOptionLabel: formData.allowOtherOption ? formData.otherOptionLabel || '기타' : undefined,
              otherOptionPlaceholder: formData.allowOtherOption ? formData.otherOptionPlaceholder || '' : undefined,
            }
          : {}),
      };

      await onSave(payload);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '질문 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" fullScreen={isMobile}>
      <Card sx={{ bgcolor: 'white', borderRadius: isMobile ? 0 : 3, display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: isMobile ? 2 : 3, borderBottom: '1px solid #e6e6e6', flexShrink: 0 }}>
          <Typography sx={{ fontWeight: 700 }}>질문 새로 만들기</Typography>
          <IconButton onClick={() => { if (!isSubmitting) handleCancel(); }} sx={{ color: 'text.secondary' }}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: isMobile ? 2 : 3, flex: 1, overflow: 'auto', minHeight: 0}}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box sx={{ mb: 4 }}>
            <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ mb: 2, fontWeight: 600 }}>질문 기본 정보</Typography>
            <Box sx={{mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {QUESTION_TYPES.map((type) => {
                const isActive = formData.questionType === type.value;
                return (
                  <Button key={type.value} variant={isActive ? 'contained' : 'outlined'} onClick={() => handleSelectType(type.value)} disabled={isSubmitting}
                    sx={{ borderRadius: 2, bgcolor: isActive ? 'primary.main' : 'transparent', borderColor: '#cccccc', color: isActive ? '#ffffff' : '#1a1a1a', '&:hover': { bgcolor: isActive ? 'primary.dark' : '#f0f0f0' } }}>
                    {type.label}
                  </Button>
                );
              })}
            </Box>
            <Box sx={{ mb: 2 , display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'flex-end' }}>
            <TextField fullWidth select label="카테고리" value={formData.categoryId} onChange={handleInputChange('categoryId')} SelectProps={{ native: true }} disabled={isSubmitting || !categories.length}
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fafafa', borderRadius: 2 } }}>
              <option value={0}>카테고리 선택</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </TextField>

              <FormControlLabel sx={{whiteSpace: 'nowrap'}} control={<Checkbox checked={formData.isRequired} onChange={handleToggle('isRequired')} />} label="필수 응답" />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField fullWidth label="질문 제목 *" value={formData.title} onChange={handleInputChange('title')} placeholder="예: 오늘의 기분은 어떠신가요?" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fafafa', borderRadius: 2 } }} />
              <TextField fullWidth multiline minRows={3} label="질문 내용 *" value={formData.content} onChange={handleInputChange('content')} placeholder="질문의 상세한 안내 문구를 입력해주세요..." sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fafafa', borderRadius: 2 } }} />
            </Box>
          </Box>

          {requiresChoiceOptions && (
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 600 }}>선택지 옵션</Typography>
                <Button variant="contained" onClick={addChoiceOption} startIcon={<Iconify icon="mingcute:add-line" />} disabled={isSubmitting}
                  sx={{ bgcolor: 'primary.main', borderRadius: 2, '&:hover': { bgcolor: 'primary.dark' } }}>
                  옵션 추가
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {choiceLabels.map((label, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField fullWidth value={label} onChange={handleChoiceLabelChange(index)} placeholder={`옵션 라벨 ${index + 1}`} disabled={isSubmitting}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#ffffff', borderRadius: 2 } }} />
                    {choiceLabels.length > 1 && (
                      <IconButton onClick={() => removeChoiceOption(index)} disabled={isSubmitting} sx={{ color: 'text.secondary' }}>
                        <Iconify icon="mingcute:delete-2-line" />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControlLabel control={<Checkbox checked={formData.allowOtherOption} onChange={handleToggle('allowOtherOption')} />} label="기타 옵션 허용" />
                {formData.allowOtherOption && (
                  <>
                    <TextField label="기타 라벨" value={formData.otherOptionLabel} onChange={handleInputChange('otherOptionLabel')} sx={{ minWidth: 200 }} />
                    <TextField label="기타 선택 시 사용자에게 표시할 안내 문구" value={formData.otherOptionPlaceholder} onChange={handleInputChange('otherOptionPlaceholder')} sx={{ minWidth: 260, flex: 1 }} />
                  </>
                )}
              </Box>
            </Box>
          )}

          
        </DialogContent>

        <DialogActions sx={{ p: isMobile ? 2 : 3, bgcolor: '#f2f2f2', borderTop: '1px solid #e6e6e6', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 2 : 0, flexShrink: 0, position: 'sticky', bottom: 0, zIndex: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" disabled={isSubmitting} sx={{ borderColor: '#cccccc', color: '#666666', borderRadius: 2 }}>
              미리보기
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={handleCancel} variant="outlined" disabled={isSubmitting} sx={{ borderColor: '#cccccc', color: '#666666', borderRadius: 2 }}>
              취소
            </Button>
            <Button onClick={handleSave} variant="contained" disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <Iconify icon="mingcute:check-fill" />}
              sx={{ bgcolor: 'primary.main', borderRadius: 2, '&:hover': { bgcolor: 'primary.dark' } }}>
              {isSubmitting ? '저장 중...' : '저장'}
            </Button>
          </Box>
        </DialogActions>
      </Card>
    </Dialog>
  );
}
