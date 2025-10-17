import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { Iconify } from '@/components/iconify';
import { questionService } from '@/services/questionService';
import { questionAssignmentService, type QuestionAssignmentPayload, type QuestionAssignmentRecord } from '@/services/questionAssignmentService';
import type { Question } from '@/types/api';
import type { UserProps } from '../user-table-row';

type UserDetailQuestionProps = {
  user: UserProps;
};

export function UserDetailQuestion({ user }: UserDetailQuestionProps) {
  const [selectDialogOpen, setSelectDialogOpen] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  type SelectedItem = { id: string; title: string; assignmentId?: number };
  const [selectionList, setSelectionList] = useState<SelectedItem[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedItem[]>([]);
  const [initialAssignmentIds, setInitialAssignmentIds] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedIdSet = useMemo(() => new Set(selectionList.map((x) => x.id)), [selectionList]);

  // Load existing assignments for this user and fill the table
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list: QuestionAssignmentRecord[] = await questionAssignmentService.getAssignmentsByUser(Number(user.id));
        if (!mounted) return;
        const sorted = [...list].sort((a, b) => a.priority - b.priority);
        setSelectedQuestions(sorted.map((a) => ({ id: String(a.questionId), title: a.questionTitle, assignmentId: a.id })));
        setInitialAssignmentIds(new Set(sorted.map((a) => a.id)));
      } catch (e) {
        console.error('Failed to load user assignments', e);
        setErrorMessage(e instanceof Error ? e.message : '사용자 질문 할당을 불러오지 못했습니다.');
        setErrorOpen(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user.id]);

  const openSelect = async () => {
    try {
      setLoadingQuestions(true);
      setSelectDialogOpen(true);
      const list = await questionService.getActiveQuestions();
      setActiveQuestions(list);
      setSelectionList([...selectedQuestions]);
    } catch (e) {
      console.error('Failed to load active questions', e);
      setErrorMessage(e instanceof Error ? e.message : '활성 질문 목록을 불러오지 못했습니다.');
      setErrorOpen(true);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const toggleInSelection = (id: string, title: string, assignmentId?: number) => {
    setSelectionList((prev) => {
      const exists = prev.find((x) => x.id === id);
      if (exists) return prev.filter((x) => x.id !== id);
      return [...prev, { id, title, assignmentId }];
    });
  };

  const moveInSelection = (index: number, dir: -1 | 1) => {
    setSelectionList((prev) => {
      const next = [...prev];
      const t = index + dir;
      if (t < 0 || t >= next.length) return prev;
      [next[index], next[t]] = [next[t], next[index]];
      return next;
    });
  };

  const confirmSelection = () => {
    setSelectedQuestions(selectionList);
    setSelectDialogOpen(false);
  };

  const moveItem = (index: number, dir: -1 | 1) => {
    setSelectedQuestions((prev) => {
      const next = [...prev];
      const t = index + dir;
      if (t < 0 || t >= next.length) return prev;
      [next[index], next[t]] = [next[t], next[index]];
      return next;
    });
  };

  const removeSelected = (id: string) => {
    setSelectedQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const saveAssignments = async () => {
    try {
      setSaving(true);
      // compute deletions
      const currentAssignmentIds = new Set(
        selectedQuestions.map((q) => q.assignmentId).filter((v): v is number => typeof v === 'number')
      );
      const toDelete = Array.from(initialAssignmentIds).filter((id) => !currentAssignmentIds.has(id));
      for (const delId of toDelete) {
        await questionAssignmentService.deleteAssignment(delId);
      }

      // updates and creates
      for (let i = 0; i < selectedQuestions.length; i += 1) {
        const q = selectedQuestions[i];
        const payload: QuestionAssignmentPayload = {
          questionId: Number(q.id),
          userId: Number(user.id),
          groupId: null,
          priority: i + 1,
        };
        if (typeof q.assignmentId === 'number') {
          await questionAssignmentService.updateAssignment(q.assignmentId, payload);
        } else {
          await questionAssignmentService.assignQuestion(payload);
        }
      }

      // reload to sync IDs
      const refreshed = await questionAssignmentService.getAssignmentsByUser(Number(user.id));
      const sorted = [...refreshed].sort((a, b) => a.priority - b.priority);
      setSelectedQuestions(sorted.map((a) => ({ id: String(a.questionId), title: a.questionTitle, assignmentId: a.id })));
      setInitialAssignmentIds(new Set(sorted.map((a) => a.id)));
      setSuccessMessage('질문 할당이 저장되었습니다.');
      setSuccessOpen(true);
    } catch (e) {
      console.error('Failed to save assignments', e);
      setErrorMessage(e instanceof Error ? e.message : '질문 할당 저장에 실패했습니다.');
      setErrorOpen(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          질문 설정
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={openSelect} sx={{ borderRadius: 2 }}>
            질문 추가
          </Button>
          <Button variant="contained" onClick={saveAssignments} disabled={saving || selectedQuestions.length === 0} sx={{ borderRadius: 2 }}>
            저장
          </Button>
        </Box>
      </Box>

      {selectedQuestions.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          연결된 질문이 없습니다. ‘질문 추가’를 눌러 선택하세요.
        </Typography>
      ) : (
        <TableContainer sx={{ borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: 120 }}>우선순위</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>질문 제목</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 120 }}>액션</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedQuestions.map((q, idx) => (
                <TableRow key={q.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip label={idx + 1} size="small" />
                      <Box>
                        <IconButton size="small" onClick={() => moveItem(idx, -1)} disabled={idx === 0}>
                          <Iconify icon="solar:alt-arrow-up-bold" />
                        </IconButton>
                        <IconButton size="small" onClick={() => moveItem(idx, 1)} disabled={idx === selectedQuestions.length - 1}>
                          <Iconify icon="solar:alt-arrow-down-bold" />
                        </IconButton>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{q.title}</Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton color="error" onClick={() => removeSelected(q.id)}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={selectDialogOpen} onClose={() => setSelectDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>질문 선택</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            목록에서 질문을 선택하고 우선순위를 조정하세요.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            <TableContainer sx={{ flex: 1, borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'grey.100' }}>
                  <TableRow>
                    <TableCell sx={{ width: 56 }} />
                    <TableCell sx={{ fontWeight: 600 }}>제목</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>유형</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>카테고리</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeQuestions.map((item) => {
                    const checked = selectedIdSet.has(item.id);
                    return (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Checkbox checked={checked} onChange={() => toggleInSelection(item.id, item.title)} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.title}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.content}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{item.type}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={item.category} size="small" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ flex: 1, minWidth: 260 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>선택된 질문 (우선순위)</Typography>
              <TableContainer sx={{ borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 100 }}>순서</TableCell>
                      <TableCell>제목</TableCell>
                      <TableCell sx={{ width: 60 }}>삭제</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectionList.map((q, idx) => (
                      <TableRow key={q.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label={idx + 1} size="small" />
                            <Box>
                              <IconButton size="small" onClick={() => moveInSelection(idx, -1)} disabled={idx === 0}>
                                <Iconify icon="solar:alt-arrow-up-bold" />
                              </IconButton>
                              <IconButton size="small" onClick={() => moveInSelection(idx, 1)} disabled={idx === selectionList.length - 1}>
                                <Iconify icon="solar:alt-arrow-down-bold" />
                              </IconButton>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{q.title}</Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton color="error" onClick={() => toggleInSelection(q.id, q.title)}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setSelectDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={confirmSelection} disabled={loadingQuestions}>선택 완료</Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successOpen} onClose={() => setSuccessOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>저장 완료</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{successMessage || '작업이 성공적으로 완료되었습니다.'}</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setSuccessOpen(false)}>확인</Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={errorOpen} onClose={() => setErrorOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>오류</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{errorMessage || '처리 중 오류가 발생했습니다.'}</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={() => setErrorOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
