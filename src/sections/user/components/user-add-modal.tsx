import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from '@/components/iconify';
import type { CreateUserRequest } from '@/types/api';

// ----------------------------------------------------------------------

type UserAddModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (userData: CreateUserRequest) => Promise<void>;
};

const GROUP_OPTIONS = ['고혈압', '당뇨병', '심장질환', '치매'];

type FormState = CreateUserRequest & { code: string };

const createInitialFormState = (): FormState => ({
  name: '',
  code: '',
  phoneNumber: '',
  guardianName: '',
  guardianRelation: '',
  guardianPhone: '',
  group: GROUP_OPTIONS[0],
});

export function UserAddModal({ open, onClose, onSave }: UserAddModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState<FormState>(() => createInitialFormState());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof FormState) => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    setError(null);
  };

  const resetForm = () => {
    setFormData(createInitialFormState());
    setError(null);
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.code.trim()) {
      setError('이름과 이용자 코드는 필수 항목입니다.');
      return;
    }

    const payload: CreateUserRequest = {
      ...formData,
      name: formData.name.trim(),
      code: formData.code.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      guardianName: formData.guardianName.trim(),
      guardianRelation: formData.guardianRelation.trim(),
      guardianPhone: formData.guardianPhone.trim(),
      group: formData.group,
    };

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave(payload);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '사용자를 저장하지 못했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!isSubmitting) {
          handleCancel();
        }
      }}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          m: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100vh' : '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: isMobile ? 2 : 3,
            borderBottom: (themeArg) => `1px solid ${themeArg.palette.divider}`,
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>
            이용자 추가
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
              기본 정보
            </Typography>

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <TextField
                fullWidth
                label="이름 *"
                value={formData.name}
                onChange={handleInputChange('name')}
                placeholder="이용자 이름을 입력하세요"
                disabled={isSubmitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                fullWidth
                label="이용자 코드 *"
                value={formData.code}
                onChange={handleInputChange('code')}
                placeholder="예: A001"
                disabled={isSubmitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                fullWidth
                label="전화번호"
                value={formData.phoneNumber}
                onChange={handleInputChange('phoneNumber')}
                placeholder="010-1234-5678"
                disabled={isSubmitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                select
                fullWidth
                label="케어 그룹"
                value={formData.group}
                onChange={handleInputChange('group')}
                disabled={isSubmitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                  },
                }}
              >
                {GROUP_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>

          <Box>
            <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ mb: 2, fontWeight: 600 }}>
              보호자 정보
            </Typography>

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <TextField
                fullWidth
                label="보호자 이름"
                value={formData.guardianName}
                onChange={handleInputChange('guardianName')}
                placeholder="보호자 이름을 입력하세요"
                disabled={isSubmitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                fullWidth
                label="관계"
                value={formData.guardianRelation}
                onChange={handleInputChange('guardianRelation')}
                placeholder="예: 부모, 형제, 배우자"
                disabled={isSubmitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                fullWidth
                label="보호자 연락처"
                value={formData.guardianPhone}
                onChange={handleInputChange('guardianPhone')}
                placeholder="010-9876-5432"
                disabled={isSubmitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
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
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
          }}
        >
          <Button
            onClick={handleCancel}
            variant="outlined"
            disabled={isSubmitting}
            sx={{
              borderColor: 'grey.300',
              color: 'text.secondary',
              borderRadius: 2,
              width: isMobile ? '100%' : 'auto',
            }}
          >
            취소
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? <CircularProgress size={18} color="inherit" /> : <Iconify icon="mingcute:check-fill" />
            }
            sx={{
              bgcolor: 'primary.main',
              borderRadius: 2,
              width: isMobile ? '100%' : 'auto',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

