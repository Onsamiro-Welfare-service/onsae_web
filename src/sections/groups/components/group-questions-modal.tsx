'use client';

import { useState, useEffect } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from '@/components/iconify';
import { questionAssignmentService, type QuestionAssignmentRecord } from '@/services/questionAssignmentService';
import { questionService } from '@/services/questionService';
import type { Question } from '@/types/api';
import type { UserGroup } from '@/services/groupService';

type GroupQuestionsModalProps = {
  open: boolean;
  onClose: () => void;
  group: UserGroup | null;
};

export function GroupQuestionsModal({ open, onClose, group }: GroupQuestionsModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [assignments, setAssignments] = useState<QuestionAssignmentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [priority, setPriority] = useState(1);
  const [assigning, setAssigning] = useState(false);

  // 할당 목록 로드
  const loadAssignments = async () => {
    if (!group) return;
    
    try {
      setLoading(true);
      const data = await questionAssignmentService.getAssignmentsByGroup(group.id);
      setAssignments(data);
    } catch (error) {
      console.error('질문 할당 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 할당 가능한 질문 로드
  const loadAvailableQuestions = async () => {
    try {
      const response = await questionService.getQuestions();
      setAvailableQuestions(response.data);
    } catch (error) {
      console.error('질문 목록 로드 실패:', error);
    }
  };

  // 할당 다이얼로그 열기
  const handleOpenAssignDialog = () => {
    setSelectedQuestionId(null);
    setPriority(1);
    loadAvailableQuestions();
    setAssignDialogOpen(true);
  };

  // 질문 할당
  const handleAssign = async () => {
    if (!group || !selectedQuestionId) {
      alert('질문을 선택해주세요.');
      return;
    }

    try {
      setAssigning(true);
      await questionAssignmentService.assignQuestion({
        questionId: selectedQuestionId,
        userId: null,
        groupId: group.id,
        priority,
      });
      alert('질문 할당이 완료되었습니다.');
      setAssignDialogOpen(false);
      await loadAssignments();
    } catch (error) {
      console.error('질문 할당 실패:', error);
      alert('질문 할당에 실패했습니다.');
    } finally {
      setAssigning(false);
    }
  };

  useEffect(() => {
    if (open && group) {
      loadAssignments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, group]);

  const handleClose = () => {
    setAssignments([]);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="solar:question-circle-bold" sx={{ color: 'primary.main' }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  할당된 질문
                </Typography>
                {group && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {group.name} ({assignments.length}개 질문)
                  </Typography>
                )}
              </Box>
            </Box>
            <Button
              variant="contained"
              size="small"
              onClick={handleOpenAssignDialog}
              startIcon={<Iconify icon="solar:add-circle-bold" />}
            >
              질문 할당
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                질문 목록을 불러오는 중...
              </Typography>
            </Box>
          ) : assignments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Iconify icon="solar:question-circle-bold" sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                할당된 질문이 없습니다
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                이 그룹에는 아직 질문이 할당되지 않았습니다.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.100' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>우선순위</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>질문 제목</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>질문 내용</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>응답 수</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>할당일</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments
                    .sort((a, b) => a.priority - b.priority)
                    .map((assignment) => (
                      <TableRow key={assignment.id} hover>
                        <TableCell>
                          <Chip
                            label={`${assignment.priority}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {assignment.questionTitle}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {assignment.questionContent}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip
                            label={assignment.responseCount}
                            size="small"
                            color={assignment.responseCount > 0 ? 'success' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {new Date(assignment.assignedAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Box sx={{ flex: 1 }} />
          <Button onClick={handleClose}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 질문 할당 다이얼로그 */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="solar:add-circle-bold" sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              질문 할당
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>질문 선택</InputLabel>
              <Select
                value={selectedQuestionId || ''}
                label="질문 선택"
                onChange={(e) => setSelectedQuestionId(Number(e.target.value))}
              >
                {availableQuestions.map((question) => (
                  <MenuItem key={question.id} value={question.id}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {question.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {question.content}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="우선순위"
              type="number"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              inputProps={{ min: 1 }}
              helperText="낮은 숫자가 먼저 표시됩니다."
            />

            {group && (
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>{group.name}</strong> 그룹에 할당됩니다.
                </Typography>
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAssignDialogOpen(false)}>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={!selectedQuestionId || assigning}
          >
            {assigning ? '할당 중...' : '할당하기'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

