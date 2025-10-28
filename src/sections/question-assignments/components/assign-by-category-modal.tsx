'use client';

import React, { useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from '@/components/iconify';
import { questionAssignmentService } from '@/services/questionAssignmentService';
import { categoryService } from '@/services/categoryService';
import { userService } from '@/services/userService';
import { groupService, type UserGroup } from '@/services/groupService';
import type { Category, User } from '@/types/api';

type AssignByCategoryModalProps = {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
};

export function AssignByCategoryModal({ open, onClose, onComplete }: AssignByCategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
  const [assignType, setAssignType] = useState<'user' | 'group'>('user');
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [selectedGroupId, setSelectedGroupId] = useState<number | ''>('');
  const [priority, setPriority] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);

  // 카테고리, 사용자, 그룹 로드
  const loadData = async () => {
    try {
      setLoading(true);
      const [catData, userData, groupData] = await Promise.all([
        categoryService.getCategories(),
        userService.getUsers(),
        groupService.getActiveGroups(),
      ]);
      setCategories(catData);
      setUsers(userData.data);
      setGroups(groupData);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategoryId) {
      setError('카테고리를 선택해주세요.');
      return;
    }

    const userId = assignType === 'user' ? selectedUserId : null;
    const groupId = assignType === 'group' ? selectedGroupId : null;

    if (!userId && !groupId) {
      setError('사용자 또는 그룹을 선택해주세요.');
      return;
    }

    try {
      setAssigning(true);
      setError(null);
      setSuccessCount(0);

      // 카테고리별 일괄 할당 API 호출
      await questionAssignmentService.assignByCategory({
        categoryId: selectedCategoryId,
        userId: userId || null,
        groupId: groupId || null,
        priority,
      });

      setSuccessCount(1); // 성공
      alert('카테고리별 질문 할당이 완료되었습니다.');
      onComplete();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '할당에 실패했습니다.');
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedCategoryId('');
    setSelectedUserId('');
    setSelectedGroupId('');
    setPriority(1);
    setError(null);
    setSuccessCount(0);
    onClose();
  };

  // 모달이 열릴 때 데이터 로드
  React.useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:category-bold" sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            카테고리별 질문 할당
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          {/* 카테고리 선택 */}
          <FormControl fullWidth>
            <InputLabel>카테고리 선택</InputLabel>
            <Select
              value={selectedCategoryId}
              label="카테고리 선택"
              onChange={(e) => setSelectedCategoryId(e.target.value as number)}
              disabled={loading}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                  {category.description && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                      ({category.description})
                    </Typography>
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 할당 대상 선택 */}
          <FormControl component="fieldset">
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              할당 대상
            </Typography>
            <RadioGroup
              value={assignType}
              onChange={(e) => {
                setAssignType(e.target.value as 'user' | 'group');
                setSelectedUserId('');
                setSelectedGroupId('');
              }}
              row
            >
              <FormControlLabel value="user" control={<Radio />} label="사용자" />
              <FormControlLabel value="group" control={<Radio />} label="그룹" />
            </RadioGroup>
          </FormControl>

          {/* 사용자 또는 그룹 선택 */}
          {assignType === 'user' ? (
            <FormControl fullWidth>
              <InputLabel>사용자 선택</InputLabel>
              <Select
                value={selectedUserId}
                label="사용자 선택"
                onChange={(e) => setSelectedUserId(e.target.value as number)}
                disabled={loading}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name} ({user.loginCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <FormControl fullWidth>
              <InputLabel>그룹 선택</InputLabel>
              <Select
                value={selectedGroupId}
                label="그룹 선택"
                onChange={(e) => setSelectedGroupId(e.target.value as number)}
                disabled={loading}
              >
                {groups.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* 우선순위 */}
          <TextField
            label="우선순위"
            type="number"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value) || 1)}
            inputProps={{ min: 1 }}
            helperText="낮을수록 높은 우선순위"
          />

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          {successCount > 0 && (
            <Alert severity="success">
              {successCount}개의 할당이 완료되었습니다.
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={handleClose} disabled={assigning}>
          취소
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={assigning || !selectedCategoryId || (!selectedUserId && !selectedGroupId)}
        >
          {assigning ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              할당 중...
            </>
          ) : (
            '할당하기'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

