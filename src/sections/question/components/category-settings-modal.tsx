'use client';

import { useState, useEffect, useRef } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from '@/components/iconify';
import { categoryService, type UpdateCategoryRequest } from '@/services/categoryService';
import type { Category, CreateCategoryRequest } from '@/types/api';

type CategorySettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CategorySettingsModal({ open, onClose }: CategorySettingsModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const mountedRef = useRef(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imagePath: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  // 카테고리 목록 로드
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      if (!mountedRef.current) return;
      setCategories(data);
    } catch (error) {
      console.error('카테고리 목록 로드 실패:', error);
    } finally {
      if (!mountedRef.current) return;
      setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    if (open) {
      loadCategories();
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [open]);

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', imagePath: '' });
    setErrors({});
    setFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      imagePath: category.imagePath,
    });
    setErrors({});
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', imagePath: '' });
    setErrors({});
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
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
      newErrors.name = '카테고리 이름을 입력해주세요.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '카테고리 이름은 2자 이상 입력해주세요.';
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
      
      if (editingCategory) {
        // 수정
        const payload: UpdateCategoryRequest = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          imagePath: formData.imagePath.trim(),
        };
        await categoryService.updateCategory(editingCategory.id, payload);
      } else {
        // 생성
        const payload: CreateCategoryRequest = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          imagePath: formData.imagePath.trim() || undefined,
        };
        await categoryService.createCategory(payload);
      }
      
      if (!mountedRef.current) return;
      await loadCategories();
      if (!mountedRef.current) return;
      handleFormClose();
    } catch (error) {
      console.error('카테고리 저장 실패:', error);
      if (!mountedRef.current) return;
      alert('카테고리 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      if (!mountedRef.current) return;
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
    if (!confirm(`정말로 '${categoryName}' 카테고리를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setDeleting(categoryId);
      await categoryService.deleteCategory(categoryId);
      if (!mountedRef.current) return;
      await loadCategories();
      if (!mountedRef.current) return;
      alert('카테고리가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('카테고리 삭제 실패:', error);
      if (!mountedRef.current) return;
      alert('카테고리 삭제에 실패했습니다.');
    } finally {
      if (!mountedRef.current) return;
      setDeleting(null);
    }
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', imagePath: '' });
    setErrors({});
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="solar:settings-bold" sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              카테고리 설정
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              질문 카테고리를 관리하세요
            </Typography>
            <Button
              variant="contained"
              onClick={handleCreateCategory}
              startIcon={<Iconify icon="solar:add-circle-bold" />}
              sx={{ borderRadius: 2 }}
            >
              카테고리 추가
            </Button>
          </Box>

          <Card>
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.100' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>카테고리명</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>설명</TableCell>
                      <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>질문 수</TableCell>
                      <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>상태</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>생성자</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>생성일</TableCell>
                      <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>액션</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            로딩 중...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Iconify icon="solar:folder-bold" sx={{ fontSize: 48, color: 'text.secondary' }} />
                            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                              카테고리가 없습니다
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              &apos;카테고리 추가&apos; 버튼을 눌러 첫 번째 카테고리를 만들어보세요
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map((category) => (
                        <TableRow key={category.id} hover>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {category.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {category.description || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {category.questionCount}개
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Chip
                              label={category.isActive ? '활성' : '비활성'}
                              size="small"
                              color={category.isActive ? 'success' : 'default'}
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {category.createdByName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {new Date(category.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <IconButton
                                size="small"
                                onClick={() => handleEditCategory(category)}
                                sx={{ color: 'warning.main' }}
                                title="수정"
                              >
                                <Iconify icon="solar:pen-bold" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteCategory(category.id, category.name)}
                                disabled={deleting === category.id}
                                sx={{ color: 'error.main' }}
                                title="삭제"
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleClose}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 카테고리 생성/수정 폼 모달 */}
      <Dialog
        open={formOpen}
        onClose={handleFormClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify 
              icon={editingCategory ? "solar:pen-bold" : "solar:add-circle-bold"} 
              sx={{ color: 'primary.main' }} 
            />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {editingCategory ? '카테고리 수정' : '카테고리 추가'}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt:2  }}>
            <TextField
              fullWidth
              label="카테고리명"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              variant="outlined"
              error={!!errors.name}
              helperText={errors.name}
              required
              placeholder="예: 건강관리, 일상생활 등"
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
              helperText={errors.description || '카테고리에 대한 설명을 입력하세요 (선택사항)'}
              placeholder="이 카테고리의 목적이나 특징을 설명해주세요..."
            />
            
            <TextField
              fullWidth
              label="이미지 경로"
              value={formData.imagePath || ''}
              onChange={(e) => handleInputChange('imagePath', e.target.value)}
              variant="outlined"
              placeholder="이미지 파일 경로를 입력하세요 (선택사항)"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleFormClose} disabled={saving}>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={<Iconify icon="solar:diskette-bold" />}
          >
            {saving ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
