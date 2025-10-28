'use client';

import { useState, useEffect } from 'react';

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
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from '@/components/iconify';
import { questionAssignmentService } from '@/services/questionAssignmentService';
import { userService } from '@/services/userService';
import { groupService, type UserGroup } from '@/services/groupService';
import type { QuestionAssignmentRecord, QuestionAssignmentPayload } from '@/services/questionAssignmentService';
import type { User } from '@/types/api';

type AssignmentDetailModalProps = {
  open: boolean;
  onClose: () => void;
  assignmentId: number | null;
  onUpdate: () => void;
};

export function AssignmentDetailModal({ open, onClose, assignmentId, onUpdate }: AssignmentDetailModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [assignment, setAssignment] = useState<QuestionAssignmentRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [questionId, setQuestionId] = useState<number | ''>('');
  const [assignType, setAssignType] = useState<'user' | 'group'>('user');
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [selectedGroupId, setSelectedGroupId] = useState<number | ''>('');
  const [priority, setPriority] = useState(1);
  
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<UserGroup[]>([]);

  useEffect(() => {
    if (open && assignmentId) {
      loadAssignment();
      loadUsersAndGroups();
    }
  }, [open, assignmentId]);

  const loadAssignment = async () => {
    if (!assignmentId) return;
    
    try {
      setLoading(true);
      const data = await questionAssignmentService.getAssignment(assignmentId);
      setAssignment(data);
      setQuestionId(data.questionId);
      setPriority(data.priority);
      setAssignType(data.userId ? 'user' : 'group');
      setSelectedUserId(data.userId || '');
      setSelectedGroupId(data.groupId || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : '할당 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadUsersAndGroups = async () => {
    try {
      const [userData, groupData] = await Promise.all([
        userService.getUsers(),
        groupService.getActiveGroups(),
      ]);
      setUsers(userData.data);
      setGroups(groupData);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
    }
  };

  const handleSubmit = async () => {
    if (!assignment || !questionId) {
      setError('질문 ID가 필요합니다.');
      return;
    }

    const userId = assignType === 'user' ? selectedUserId : null;
    const groupId = assignType === 'group' ? selectedGroupId : null;

    if (!userId && !groupId) {
      setError('사용자 또는 그룹을 선택해주세요.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload: QuestionAssignmentPayload = {
        questionId,
        userId: userId || null,
        groupId: groupId || null,
        priority,
      };

      await questionAssignmentService.updateAssignment(assignment.id, payload);
      onUpdate();
      onClose();
      alert('할당이 성공적으로 수정되었습니다.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '할당 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!assignment || !confirm('정말로 이 할당을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await questionAssignmentService.deleteAssignment(assignment.id);
      onUpdate();
      onClose();
      alert('할당이 성공적으로 삭제되었습니다.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '할당 삭제에 실패했습니다.');
    }
  };

  if (!assignment) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="solar:pen-bold" sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              할당 상세 수정
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            {/* 질문 정보 */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                질문 정보
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                {assignment.questionTitle}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {assignment.questionContent}
              </Typography>
            </Box>

            {/* 할당 대상 */}
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

            {/* 정보 */}
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                할당일: {new Date(assignment.assignedAt).toLocaleString()}
              </Typography>
              {assignment.assignedByName && (
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  할당자: {assignment.assignedByName}
                </Typography>
              )}
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                응답 수: {assignment.responseCount}개
              </Typography>
            </Box>

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={handleDelete} color="error" disabled={saving || loading}>
          삭제
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} disabled={saving}>
          취소
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={saving || loading || !selectedUserId && !selectedGroupId}
        >
          {saving ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              저장 중...
            </>
          ) : (
            '저장'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

