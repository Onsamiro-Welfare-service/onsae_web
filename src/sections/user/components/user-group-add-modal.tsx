import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

import { Iconify } from '@/components/iconify';
import { userGroupService, type CreateUserGroupRequest, type UserGroup } from '@/services/userGroupService';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (group: UserGroup) => void;
};

export function UserGroupAddModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setDescription('');
    setError(null);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('그룹 이름을 입력하세요.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      const payload: CreateUserGroupRequest = { name: name.trim(), description: description.trim() };
      const created = await userGroupService.createUserGroup(payload);
      onCreated?.(created);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '그룹 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>사용자 그룹 추가</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'grid', gap: 2, mt: 2}}>
            <TextField
              label="그룹 이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
              fullWidth
            />
            <TextField
              label="설명"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              fullWidth
              multiline
              minRows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting} variant="outlined">
            취소
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <Iconify icon="mingcute:check-fill" />}
          >
            생성
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

