import React, { useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { questionAssignmentService } from '@/services/questionAssignmentService';
import { categoryService } from '@/services/categoryService';
import { userService } from '@/services/userService';
import { groupService, type UserGroup } from '@/services/groupService';
import type { Category, User } from '@/types/api';

type CategoryAssignmentFormProps = {
  mode: 'user' | 'group';
  preselectedUserId?: number;
  preselectedGroupId?: number;
  onComplete: () => void;
  onCancel: () => void;
};

export function CategoryAssignmentForm({
  mode,
  preselectedUserId,
  preselectedGroupId,
  onComplete,
  onCancel,
}: CategoryAssignmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
  const [selectedUserId, setSelectedUserId] = useState<number | ''>(preselectedUserId || '');
  const [selectedGroupId, setSelectedGroupId] = useState<number | ''>(preselectedGroupId || '');
  const [priority, setPriority] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로드
  const loadData = async () => {
    try {
      setLoading(true);
      const catData = await categoryService.getCategories();
      setCategories(catData);

      if (mode === 'user' && !preselectedUserId) {
        const userData = await userService.getUsers();
        setUsers(userData.data);
      } else if (mode === 'group' && !preselectedGroupId) {
        const groupData = await groupService.getActiveGroups();
        setGroups(groupData);
      }
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

    const userId = mode === 'user' ? selectedUserId : null;
    const groupId = mode === 'group' ? selectedGroupId : null;

    if (!userId && !groupId) {
      setError(mode === 'user' ? '사용자를 선택해주세요.' : '그룹을 선택해주세요.');
      return;
    }

    try {
      setAssigning(true);
      setError(null);

      await questionAssignmentService.assignByCategory({
        categoryId: selectedCategoryId,
        userId: userId || null,
        groupId: groupId || null,
        priority,
      });

      alert('카테고리별 질문 할당이 완료되었습니다.');
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : '할당에 실패했습니다.');
    } finally {
      setAssigning(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {mode === 'user' ? '개별 사용자 + 카테고리' : '그룹 + 카테고리'}
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 사용자/그룹 선택 */}
      {mode === 'user' && !preselectedUserId && (
        <FormControl fullWidth>
          <InputLabel>사용자 선택</InputLabel>
          <Select
            value={selectedUserId}
            label="사용자 선택"
            onChange={(e) => setSelectedUserId(e.target.value as number)}
          >
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name} ({user.phoneNumber})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {mode === 'group' && !preselectedGroupId && (
        <FormControl fullWidth>
          <InputLabel>그룹 선택</InputLabel>
          <Select
            value={selectedGroupId}
            label="그룹 선택"
            onChange={(e) => setSelectedGroupId(e.target.value as number)}
          >
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* 카테고리 선택 */}
      <FormControl fullWidth>
        <InputLabel>카테고리 선택</InputLabel>
        <Select
          value={selectedCategoryId}
          label="카테고리 선택"
          onChange={(e) => setSelectedCategoryId(e.target.value as number)}
        >
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* 우선순위 */}
      <TextField
        fullWidth
        type="number"
        label="우선순위"
        value={priority}
        onChange={(e) => setPriority(Number(e.target.value))}
        helperText="낮은 숫자일수록 먼저 표시됩니다"
        inputProps={{ min: 1 }}
      />

      {/* 액션 버튼 */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} disabled={assigning}>
          취소
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={assigning}>
          {assigning ? <CircularProgress size={24} /> : '할당하기'}
        </Button>
      </Box>
    </Box>
  );
}
