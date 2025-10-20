'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from '@/components/iconify';
import { questionService, type UpdateQuestionRequest } from '@/services/questionService';
import { categoryService } from '@/services/categoryService';

import type { QuestionProps } from '../question-table-row';
import type { QuestionType } from '@/types/api';

const CHOICE_TYPES = new Set<QuestionType>(['SINGLE_CHOICE', 'MULTIPLE_CHOICE']);

type QuestionEditModalProps = {
  open: boolean;
  onClose: () => void;
  question: QuestionProps | null;
  onQuestionUpdated?: () => void;
};

export function QuestionEditModal({ open, onClose, question, onQuestionUpdated }: QuestionEditModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    questionType: 'SINGLE_CHOICE' as QuestionType,
    categoryId: 0,
    allowOtherOption: false,
    otherOptionLabel: '',
    otherOptionPlaceholder: '',
    isRequired: false,
  });
  const [choiceLabels, setChoiceLabels] = useState<string[]>(['']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const requiresChoiceOptions = CHOICE_TYPES.has(formData.questionType);

  // 카테고리 목록 로드
  const loadCategories = async () => {
    try {
      const data = await categoryService.getActiveCategories();
      setCategories(data.map(cat => ({ id: cat.id, name: cat.name })));
    } catch (error) {
      console.error('카테고리 목록 로드 실패:', error);
    }
  };

  // 질문 상세 정보 로드
  const loadQuestionDetail = useCallback(async () => {
    if (!question) return;
    
    try {
      setLoading(true);
      const detail = await questionService.getQuestionDetail(Number(question.id));
      
      setFormData({
        title: detail.title,
        content: detail.content,
        questionType: detail.questionType,
        categoryId: detail.categoryId,
        allowOtherOption: detail.allowOtherOption,
        otherOptionLabel: detail.otherOptionLabel || '',
        otherOptionPlaceholder: detail.otherOptionPlaceholder || '',
        isRequired: detail.isRequired,
      });

      // 선택지 옵션 로드 (객관식인 경우)
      if (CHOICE_TYPES.has(detail.questionType) && detail.options) {
        if (detail.options.type === 'single' || detail.options.type === 'multiple') {
          const labels = detail.options.options?.map(opt => opt.label) || [''];
          setChoiceLabels(labels.length > 0 ? labels : ['']);
        }
      } else {
        setChoiceLabels(['']);
      }
    } catch (error) {
      console.error('질문 상세 정보 로드 실패:', error);
      alert('질문 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [question]);

  useEffect(() => {
    if (open) {
      loadCategories();
      loadQuestionDetail();
    }
  }, [open, question, loadQuestionDetail]);

  const handleInputChange = (field: keyof typeof formData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // 질문 유형이 변경되면 선택지 옵션 초기화
    if (field === 'questionType' && !CHOICE_TYPES.has(value as QuestionType)) {
      setChoiceLabels(['']);
    }
    
    // 에러 상태 초기화
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleChoiceLabelChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = [...choiceLabels];
    next[index] = event.target.value;
    setChoiceLabels(next);
  };

  const addChoiceOption = () => {
    setChoiceLabels((prev) => ([...prev, '']));
  };

  const removeChoiceOption = (index: number) => {
    if (choiceLabels.length <= 1) return;
    setChoiceLabels((prev) => prev.filter((_, i) => i !== index));
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '질문 제목을 입력해주세요.';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = '질문 제목은 2자 이상 입력해주세요.';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = '질문 내용을 입력해주세요.';
    } else if (formData.content.trim().length < 5) {
      newErrors.content = '질문 내용은 5자 이상 입력해주세요.';
    }
    
    if (formData.categoryId === 0) {
      newErrors.categoryId = '카테고리를 선택해주세요.';
    }
    
    if (formData.allowOtherOption && !(formData.otherOptionLabel ?? '').trim()) {
      newErrors.otherOptionLabel = '기타 옵션 라벨을 입력해주세요.';
    }

    if (requiresChoiceOptions) {
      const validCount = choiceLabels.filter((label) => label.trim()).length;
      if (validCount < 2) {
        newErrors.choices = '객관식 옵션은 최소 2개 이상 필요합니다.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!question || !validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      const options = buildOptionsForPayload();

      const payload: UpdateQuestionRequest = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        questionType: formData.questionType,
        categoryId: formData.categoryId,
        options: options,
        isRequired: formData.isRequired,
        ...(formData.questionType === 'SINGLE_CHOICE' || formData.questionType === 'MULTIPLE_CHOICE'
          ? {
              allowOtherOption: formData.allowOtherOption,
              otherOptionLabel: formData.allowOtherOption ? (formData.otherOptionLabel ?? '').trim() || '기타' : undefined,
              otherOptionPlaceholder: formData.allowOtherOption ? (formData.otherOptionPlaceholder ?? '').trim() : undefined,
            }
          : {}),
      };
      
      await questionService.updateQuestionDetail(Number(question.id), payload);
      onQuestionUpdated?.();
      onClose();
      alert('질문이 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('질문 수정 실패:', error);
      alert('질문 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      questionType: 'SINGLE_CHOICE',
      categoryId: 0,
      allowOtherOption: false,
      otherOptionLabel: '',
      otherOptionPlaceholder: '',
      isRequired: false,
    });
    setChoiceLabels(['']);
    setErrors({});
    onClose();
  };

  const questionTypeOptions = [
    { value: 'SINGLE_CHOICE', label: '단일 선택' },
    { value: 'MULTIPLE_CHOICE', label: '다중 선택' },
    { value: 'YES_NO', label: '예/아니오' },
    { value: 'SCALE', label: '척도' },
    { value: 'TEXT', label: '텍스트' },
    { value: 'DATE', label: '날짜' },
    { value: 'TIME', label: '시간' },
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:pen-bold" sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            질문 수정
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              질문 정보를 불러오는 중...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt:2 }}>
            <TextField
              fullWidth
              label="질문 제목"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              variant="outlined"
              error={!!errors.title}
              helperText={errors.title}
              required
              placeholder="질문의 제목을 입력하세요"
            />
            
            <TextField
              fullWidth
              label="질문 내용"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              variant="outlined"
              multiline
              rows={4}
              error={!!errors.content}
              helperText={errors.content}
              required
              placeholder="질문의 상세 내용을 입력하세요"
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth error={!!errors.questionType}>
                <InputLabel>질문 유형</InputLabel>
                <Select
                  value={formData.questionType}
                  onChange={(e) => handleInputChange('questionType', e.target.value as QuestionType)}
                  label="질문 유형"
                >
                  {questionTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth error={!!errors.categoryId}>
                <InputLabel>카테고리</InputLabel>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', Number(e.target.value))}
                  label="카테고리"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.categoryId && (
                  <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5 }}>
                    {errors.categoryId}
                  </Typography>
                )}
              </FormControl>
            </Stack>

            {requiresChoiceOptions && (
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      선택지 옵션
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={addChoiceOption}
                      startIcon={<Iconify icon="solar:add-circle-bold" />}
                      disabled={saving}
                      size="small"
                    >
                      옵션 추가
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {choiceLabels.map((label, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                          fullWidth
                          value={label}
                          onChange={handleChoiceLabelChange(index)}
                          placeholder={`옵션 라벨 ${index + 1}`}
                          disabled={saving}
                          variant="outlined"
                          size="small"
                        />
                        {choiceLabels.length > 1 && (
                          <IconButton
                            onClick={() => removeChoiceOption(index)}
                            disabled={saving}
                            size="small"
                            sx={{ color: 'error.main' }}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                  </Box>

                  {errors.choices && (
                    <Typography variant="caption" sx={{ color: 'error.main', mt: 1, display: 'block' }}>
                      {errors.choices}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  추가 옵션
                </Typography>
                
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isRequired}
                        onChange={(e) => handleInputChange('isRequired', e.target.checked)}
                      />
                    }
                    label="필수 질문"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.allowOtherOption}
                        onChange={(e) => handleInputChange('allowOtherOption', e.target.checked)}
                      />
                    }
                    label="기타 옵션 허용"
                  />
                </FormGroup>

                {formData.allowOtherOption && (
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="기타 옵션 라벨"
                      value={formData.otherOptionLabel}
                      onChange={(e) => handleInputChange('otherOptionLabel', e.target.value)}
                      variant="outlined"
                      error={!!errors.otherOptionLabel}
                      helperText={errors.otherOptionLabel}
                      placeholder="예: 기타"
                    />
                    
                    <TextField
                      fullWidth
                      label="기타 옵션 플레이스홀더"
                      value={formData.otherOptionPlaceholder}
                      onChange={(e) => handleInputChange('otherOptionPlaceholder', e.target.value)}
                      variant="outlined"
                      placeholder="예: 직접 입력해주세요"
                    />
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose} disabled={saving}>
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || loading}
          startIcon={<Iconify icon="solar:diskette-bold" />}
        >
          {saving ? '저장 중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

