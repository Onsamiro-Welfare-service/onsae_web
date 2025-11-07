'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from '@/components/iconify';
import { groupService, type CreateGroupRequest } from '@/services/groupService';

type GroupCreateModalProps = {
  open: boolean;
  onClose: () => void;
};

export function GroupCreateModal({ open, onClose }: GroupCreateModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [formData, setFormData] = useState<CreateGroupRequest>({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field: keyof CreateGroupRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // 에러 상태 초기화
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '그룹명을 입력해주세요.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '그룹명은 2자 이상 입력해주세요.';
    }
    
    if (formData.description.trim().length > 200) {
      newErrors.description = '설명은 200자 이하로 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      await groupService.createGroup(formData);
      onClose();
    } catch (error) {
      console.error('그룹 생성 실패:', error);
      alert('그룹 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:add-circle-bold" sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            새 그룹 생성
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="그룹명"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            variant="outlined"
            error={!!errors.name}
            helperText={errors.name}
            required
            placeholder="예: 고위험군, 일반환자 등"
          />
          
          <TextField
            fullWidth
            label="설명"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            variant="outlined"
            multiline
            rows={3}
            error={!!errors.description}
            helperText={errors.description || '그룹에 대한 설명을 입력하세요 (선택사항)'}
            placeholder="이 그룹의 목적이나 특징을 설명해주세요..."
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose} disabled={saving}>
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={<Iconify icon="solar:diskette-bold" />}
        >
          {saving ? '생성 중...' : '그룹 생성'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
