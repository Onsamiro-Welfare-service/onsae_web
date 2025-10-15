import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { categoryService } from '@/services/categoryService';
import type { CreateCategoryRequest, Category } from '@/types/api';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (category: Category) => void;
};

export function CategoryAddModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setDescription('');
    setImagePath('');
    setError(null);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      if (!name.trim()) throw new Error('카테고리 이름을 입력해주세요.');
      const payload: CreateCategoryRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        imagePath: imagePath.trim() || undefined,
      };
      const created = await categoryService.createCategory(payload);
      onCreated?.(created);
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : '카테고리 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>카테고리 만들기</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="이름 *" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField label="설명" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline minRows={2} />
          <TextField label="이미지 경로" value={imagePath} onChange={(e) => setImagePath(e.target.value)} fullWidth />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting} variant="outlined">취소</Button>
        <Button onClick={handleSave} disabled={isSubmitting} variant="contained">저장</Button>
      </DialogActions>
    </Dialog>
  );
}

