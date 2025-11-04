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
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from '@/components/iconify';
import { questionService } from '@/services/questionService';
import { questionAssignmentService, type QuestionAssignmentPayload, type QuestionAssignmentRecord } from '@/services/questionAssignmentService';
import type { Question } from '@/types/api';
import type { UserProps } from '../user-table-row';

type UserDetailQuestionProps = {
  user: UserProps;
};

export function UserDetailQuestion({ user }: UserDetailQuestionProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box>
          <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
            질문 설정
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            사용자에게 보여줄 질문을 선택하고 우선순위를 설정하세요
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, width: isMobile ? '100%' : 'auto', flexDirection: 'row' }}>
          <Button 
            variant="outlined" 
            onClick={openSelect} 
            sx={{ borderRadius: 2, width: isMobile ? '100%' : 'auto' }}
            startIcon={<Iconify icon="solar:add-circle-bold" />}
          >
            질문 추가
          </Button>
          <Button 
            variant="contained" 
            onClick={saveAssignments} 
            disabled={saving || selectedQuestions.length === 0} 
            sx={{ borderRadius: 2, width: isMobile ? '100%' : 'auto' }}
            startIcon={<Iconify icon="solar:diskette-bold" />}
          >
            {saving ? '저장 중...' : '저장'}
          </Button>
        </Box>
      </Box>

      {selectedQuestions.length === 0 ? (
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            border: (t) => `2px dashed ${t.palette.divider}`,
            bgcolor: 'grey.50',
          }}
        >
          <Iconify icon="solar:question-circle-bold" sx={{ width: 48, height: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
            연결된 질문이 없습니다
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            &apos;질문 추가&apos; 버튼을 눌러 사용자에게 보여줄 질문을 선택하세요
          </Typography>
          <Button variant="outlined" onClick={openSelect} sx={{ borderRadius: 2 }}>
            <Iconify icon="solar:add-circle-bold" sx={{ mr: 1 }} />
            질문 추가하기
          </Button>
        </Box>
      ) : (
        <TableContainer sx={{ borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: 80, textAlign: 'center' }}>순서</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>질문 제목</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 100, textAlign: 'center' }}>우선순위</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 80, textAlign: 'center' }}>삭제</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedQuestions.map((q, idx) => (
                <TableRow key={q.id} hover>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Chip 
                      label={idx + 1} 
                      size="small" 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        color: 'white',
                        fontWeight: 600,
                        minWidth: 32,
                        height: 24
                      }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                      {q.title}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                      <IconButton 
                        size="small" 
                        onClick={() => moveItem(idx, -1)} 
                        disabled={idx === 0}
                        aria-label="질문 우선순위 위로 이동"
                        sx={{ 
                          p: 0.5,
                          '&:disabled': { opacity: 0.3 }
                        }}
                      >
                        <Iconify icon="solar:alt-arrow-up-bold" sx={{ width: 16, height: 16 }} />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => moveItem(idx, 1)} 
                        disabled={idx === selectedQuestions.length - 1}
                        aria-label="질문 우선순위 아래로 이동"
                        sx={{ 
                          p: 0.5,
                          '&:disabled': { opacity: 0.3 }
                        }}
                      >
                        <Iconify icon="solar:alt-arrow-down-bold" sx={{ width: 16, height: 16 }} />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton 
                      color="error" 
                      onClick={() => removeSelected(q.id)}
                      aria-label="질문 삭제"
                      sx={{ 
                        p: 0.5,
                        '&:hover': { bgcolor: 'error.light', color: 'error.main' }
                      }}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" sx={{ width: 16, height: 16 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={selectDialogOpen} onClose={() => setSelectDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography sx={{ fontWeight: 700 }}>
            질문 선택 및 우선순위 설정
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            사용자에게 보여줄 질문을 선택하고 순서를 조정하세요
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            <TableContainer 
              sx={{ 
                flex: 1, 
                borderRadius: 2, 
                border: (t) => `1px solid ${t.palette.divider}`,
                overflowX: 'auto',
              }}
            >
              <Table size="small" sx={{ minWidth: isMobile ? 600 : 'auto' }}>
                <TableHead sx={{ bgcolor: 'grey.100' }}>
                  <TableRow>
                    <TableCell sx={{ width: 56, px: isMobile ? 1 : 2 }} />
                    <TableCell sx={{ fontWeight: 600, fontSize: isMobile ? '0.875rem' : '1rem', px: isMobile ? 1 : 2 }}>
                      제목
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: isMobile ? '0.875rem' : '1rem', px: isMobile ? 1 : 2 }}>
                      유형
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: isMobile ? '0.875rem' : '1rem', px: isMobile ? 1 : 2 }}>
                      카테고리
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeQuestions.map((item) => {
                    const checked = selectedIdSet.has(item.id);
                    return (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ px: isMobile ? 1 : 2 }}>
                          <Checkbox 
                            checked={checked} 
                            onChange={() => toggleInSelection(item.id, item.title)}
                            size={isMobile ? 'small' : 'medium'}
                          />
                        </TableCell>
                        <TableCell sx={{ px: isMobile ? 1 : 2 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              fontSize: isMobile ? '0.875rem' : '1rem',
                            }}
                          >
                            {item.title}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.secondary',
                              fontSize: isMobile ? '0.75rem' : '0.875rem',
                            }}
                          >
                            {item.content}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ px: isMobile ? 1 : 2 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'text.secondary',
                              fontSize: isMobile ? '0.875rem' : '1rem',
                            }}
                          >
                            {item.type}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ px: isMobile ? 1 : 2 }}>
                          <Chip 
                            label={item.category} 
                            size="small"
                            sx={{
                              fontSize: isMobile ? '0.75rem' : '0.875rem',
                              height: isMobile ? 20 : 24,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ flex: 1, minWidth: 300 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Iconify icon="solar:list-bold" sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  선택된 질문 ({selectionList.length}개)
                </Typography>
              </Box>
              {selectionList.length === 0 ? (
                <Box
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 2,
                    border: (t) => `2px dashed ${t.palette.divider}`,
                    bgcolor: 'grey.50',
                  }}
                >
                  <Iconify icon="solar:list-check-bold" sx={{ width: 32, height: 32, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    왼쪽에서 질문을 선택하세요
                  </Typography>
                </Box>
              ) : (
                <TableContainer sx={{ borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'grey.100' }}>
                      <TableRow>
                        <TableCell sx={{ width: 80, textAlign: 'center', fontWeight: 600 }}>순서</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>제목</TableCell>
                        <TableCell sx={{ width: 100, textAlign: 'center', fontWeight: 600 }}>우선순위</TableCell>
                        <TableCell sx={{ width: 60, textAlign: 'center', fontWeight: 600 }}>삭제</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectionList.map((q, idx) => (
                        <TableRow key={q.id} hover>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Chip 
                              label={idx + 1} 
                              size="small" 
                              sx={{ 
                                bgcolor: 'primary.main', 
                                color: 'white',
                                fontWeight: 600,
                                minWidth: 28,
                                height: 22
                              }} 
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                              {q.title}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                              <IconButton 
                                size="small" 
                                onClick={() => moveInSelection(idx, -1)} 
                                disabled={idx === 0}
                                aria-label="질문 우선순위 위로 이동"
                                sx={{ 
                                  p: 0.5,
                                  '&:disabled': { opacity: 0.3 }
                                }}
                              >
                                <Iconify icon="solar:alt-arrow-up-bold" sx={{ width: 14, height: 14 }} />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => moveInSelection(idx, 1)} 
                                disabled={idx === selectionList.length - 1}
                                aria-label="질문 우선순위 아래로 이동"
                                sx={{ 
                                  p: 0.5,
                                  '&:disabled': { opacity: 0.3 }
                                }}
                              >
                                <Iconify icon="solar:alt-arrow-down-bold" sx={{ width: 14, height: 14 }} />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <IconButton 
                              color="error" 
                              onClick={() => toggleInSelection(q.id, q.title)}
                              aria-label="질문 삭제"
                              sx={{ 
                                p: 0.5,
                                '&:hover': { bgcolor: 'error.light', color: 'error.main' }
                              }}
                            >
                              <Iconify icon="solar:trash-bin-trash-bold" sx={{ width: 14, height: 14 }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => setSelectDialogOpen(false)} sx={{ borderRadius: 2 }}>
            취소
          </Button>
          <Button 
            variant="contained" 
            onClick={confirmSelection} 
            disabled={loadingQuestions || selectionList.length === 0}
            sx={{ borderRadius: 2 }}
            startIcon={<Iconify icon="solar:check-circle-bold" />}
          >
            {loadingQuestions ? '로딩 중...' : `선택 완료 (${selectionList.length}개)`}
          </Button>
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
