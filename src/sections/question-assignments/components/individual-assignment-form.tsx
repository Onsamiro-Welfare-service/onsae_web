import React, { useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { questionAssignmentService } from '@/services/questionAssignmentService';
import { questionService } from '@/services/questionService';
import { userService } from '@/services/userService';
import { groupService, type UserGroup } from '@/services/groupService';
import type { Question, User } from '@/types/api';

type IndividualAssignmentFormProps = {
  mode: 'user' | 'group';
  preselectedUserId?: number;
  preselectedGroupId?: number;
  onComplete: () => void;
  onCancel: () => void;
};

export function IndividualAssignmentForm({
  mode,
  preselectedUserId,
  preselectedGroupId,
  onComplete,
  onCancel,
}: IndividualAssignmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>(preselectedUserId || '');
  const [selectedGroupId, setSelectedGroupId] = useState<number | ''>(preselectedGroupId || '');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [priority, setPriority] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로드
  const loadData = async () => {
    try {
      setLoading(true);
      const questionsData = await questionService.getActiveQuestions();
      setQuestions(questionsData);

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

  const toggleQuestion = (questionId: string) => {
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selectedQuestionIds.size === 0) {
      setError('최소 1개 이상의 질문을 선택해주세요.');
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

      // 선택된 질문들을 순차적으로 할당
      for (const questionId of Array.from(selectedQuestionIds)) {
        await questionAssignmentService.assignQuestion({
          questionId: Number(questionId),
          userId: userId || null,
          groupId: groupId || null,
          priority,
        });
      }

      alert(`${selectedQuestionIds.size}개의 질문이 성공적으로 할당되었습니다.`);
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
        {mode === 'user' ? '개별 사용자 - 개별 질문' : '그룹 - 개별 질문'}
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

      {/* 질문 목록 */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          질문 선택 ({selectedQuestionIds.size}개 선택됨)
        </Typography>
        <TableContainer
          sx={{
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            maxHeight: 400,
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedQuestionIds.size === questions.length && questions.length > 0}
                    indeterminate={
                      selectedQuestionIds.size > 0 && selectedQuestionIds.size < questions.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedQuestionIds(new Set(questions.map((q) => q.id)));
                      } else {
                        setSelectedQuestionIds(new Set());
                      }
                    }}
                  />
                </TableCell>
                <TableCell>질문 제목</TableCell>
                <TableCell>카테고리</TableCell>
                <TableCell>유형</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {questions.map((question) => (
                <TableRow
                  key={question.id}
                  hover
                  onClick={() => toggleQuestion(question.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox checked={selectedQuestionIds.has(question.id)} />
                  </TableCell>
                  <TableCell>{question.title}</TableCell>
                  <TableCell>{question.category}</TableCell>
                  <TableCell>{question.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

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
