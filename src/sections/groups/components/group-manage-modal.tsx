'use client';

import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
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
import { groupService, type GroupMember, type UpdateGroupRequest, type UserGroup } from '@/services/groupService';
import { questionAssignmentService, type QuestionAssignmentRecord } from '@/services/questionAssignmentService';
import { questionService } from '@/services/questionService';
import { UnifiedAssignmentModal } from '@/sections/question-assignments/components/unified-assignment-modal';
import type { Question } from '@/types/api';

type GroupManageModalProps = {
  open: boolean;
  onClose: () => void;
  onDeleted?: () => void;
  group: UserGroup | null;
};

export function GroupManageModal({ open, onClose, onDeleted, group }: GroupManageModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tab, setTab] = useState(0);

  // Edit state
  const [formData, setFormData] = useState<UpdateGroupRequest>({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  // Members state
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<number | null>(null);

  // Assignments state
  const [assignments, setAssignments] = useState<QuestionAssignmentRecord[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [priority, setPriority] = useState(1);
  const [assigning, setAssigning] = useState(false);

  // Unified assignment modal
  const [unifiedAssignmentModalOpen, setUnifiedAssignmentModalOpen] = useState(false);

  useEffect(() => {
    if (open && group) {
      setTab(0);
      setFormData({ name: group.name, description: group.description });
      // preload lists
      loadMembers(group.id);
      loadAssignments(group.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, group]);

  const loadMembers = async (groupId: number) => {
    try {
      setMembersLoading(true);
      const data = await groupService.getGroupMembers(groupId);
      setMembers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setMembersLoading(false);
    }
  };

  const loadAssignments = async (groupId: number) => {
    try {
      setAssignmentsLoading(true);
      const data = await questionAssignmentService.getAssignmentsByGroup(groupId);
      setAssignments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const memberCount = useMemo(() => members.length, [members]);

  const handleSaveEdit = async () => {
    if (!group) return;
    try {
      setSaving(true);
      await groupService.updateGroup(group.id, formData);
      onClose();
    } catch (e) {
      console.error('그룹 수정 실패:', e);
      alert('그룹 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (userId: number, userName: string) => {
    if (!group) return;
    if (!confirm(`정말로 ${userName}님을 이 그룹에서 제거하시겠습니까?`)) return;
    try {
      setRemovingUserId(userId);
      await groupService.removeGroupMember(group.id, userId);
      await loadMembers(group.id);
    } catch (e) {
      console.error('멤버 제거 실패:', e);
      alert('멤버 제거에 실패했습니다.');
    } finally {
      setRemovingUserId(null);
    }
  };

  const handleOpenAssign = async () => {
    try {
      const response = await questionService.getQuestions();
      setAvailableQuestions(response.data);
      setSelectedQuestionId(null);
      setPriority(1);
      setAssignDialogOpen(true);
    } catch (e) {
      console.error('질문 목록 로드 실패:', e);
    }
  };

  const handleAssign = async () => {
    if (!group || !selectedQuestionId) return;
    try {
      setAssigning(true);
      await questionAssignmentService.assignQuestion({
        questionId: selectedQuestionId,
        userId: null,
        groupId: group.id,
        priority,
      });
      setAssignDialogOpen(false);
      await loadAssignments(group.id);
    } catch (e) {
      console.error('질문 할당 실패:', e);
      alert('질문 할당에 실패했습니다.');
    } finally {
      setAssigning(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!group) return;
    if (!confirm('정말로 이 그룹을 삭제하시겠습니까?')) return;
    try {
      await groupService.deleteGroup(group.id);
      onClose();
      onDeleted?.();
      alert('그룹이 삭제되었습니다.');
    } catch (e) {
      console.error('그룹 삭제 실패:', e);
      alert('그룹 삭제에 실패했습니다.');
    }
  };

  const handleClose = () => {
    setAssignDialogOpen(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={isMobile ? 'sm' : 'md'}
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          display: 'flex',
          flexDirection: 'column',
          maxHeight: isMobile ? '100%' : '90vh',
          height: isMobile ? '100%' : 'auto',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          position: 'sticky',
          top: 0,
          zIndex: 2,
          bgcolor: 'background.paper',
          borderBottom: (themeArg) => `1px solid ${themeArg.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="solar:users-group-rounded-bold" sx={{ color: 'primary.main' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                그룹 관리
              </Typography>
              {group && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {group.name} · 멤버 {memberCount}명
                </Typography>
              )}
            </Box>
            <IconButton aria-label="삭제" onClick={handleDeleteGroup} sx={{ color: 'error.main' }}>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="solar:add-circle-bold" />}
              onClick={() => setUnifiedAssignmentModalOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              질문 할당
            </Button>
            <IconButton aria-label="닫기" onClick={handleClose} sx={{ color: 'text.secondary' }}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 1, flex: 1, overflow: 'auto', minHeight: 0 }}>
        <Tabs
          value={tab}
          onChange={(_e, v) => setTab(v)}
          variant={isMobile ? 'scrollable' : 'standard'}
          sx={{ mb: 2 }}
        >
          <Tab label="멤버" />
          <Tab label="질문" />
          <Tab label="수정" />
        </Tabs>

        {/* Members Tab */}
        {tab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                멤버 목록
              </Typography>
              <Button variant="contained" size="small" onClick={handleOpenAssign} sx={{ display: 'none' }} />
            </Box>
            {membersLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  로딩 중...
                </Typography>
              </Box>
            ) : members.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  멤버가 없습니다.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.100' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>코드</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>이름</TableCell>
                      <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>상태</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>가입일</TableCell>
                      <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>액션</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {members.map((m) => (
                      <TableRow key={m.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {m.usercode}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{m.userName}</Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip
                            label={m.isActive ? '활성' : '비활성'}
                            size="small"
                            color={m.isActive ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {new Date(m.joinedAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveMember(m.userId, m.userName)}
                            disabled={removingUserId === m.userId}
                            sx={{ color: 'error.main' }}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Questions Tab */}
        {tab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                할당된 질문
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={handleOpenAssign}
                startIcon={<Iconify icon="solar:add-circle-bold" />}
              >
                질문 할당
              </Button>
            </Box>
            {assignmentsLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  로딩 중...
                </Typography>
              </Box>
            ) : assignments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  할당된 질문이 없습니다.
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
                      .map((a) => (
                        <TableRow key={a.id} hover>
                          <TableCell>
                            <Chip label={`${a.priority}`} size="small" color="primary" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {a.questionTitle}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {a.questionContent}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Chip
                              label={a.responseCount}
                              size="small"
                              color={a.responseCount > 0 ? 'success' : 'default'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {new Date(a.assignedAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Edit Tab */}
        {tab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="그룹명"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              required
            />
            <TextField
              fullWidth
              label="설명"
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              multiline
              rows={3}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={onClose}>취소</Button>
              <Button variant="contained" onClick={handleSaveEdit} disabled={saving} startIcon={<Iconify icon="solar:diskette-bold" />}>
                {saving ? '저장 중...' : '저장'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Assign dialog (Questions tab) */}
        {assignDialogOpen && (
          <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:add-circle-bold" sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  질문 할당
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                <TextField
                  select
                  label="질문 선택"
                  SelectProps={{ native: true }}
                  value={selectedQuestionId ?? ''}
                  onChange={(e) => setSelectedQuestionId(Number(e.target.value))}
                >
                  <option value="" disabled>
                    선택하세요
                  </option>
                  {availableQuestions.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title}
                    </option>
                  ))}
                </TextField>
                <TextField
                  label="우선순위"
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  inputProps={{ min: 1 }}
                  helperText="낮은 숫자가 먼저 표시됩니다."
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                <Button onClick={() => setAssignDialogOpen(false)}>취소</Button>
                <Button variant="contained" onClick={handleAssign} disabled={!selectedQuestionId || assigning}>
                  {assigning ? '할당 중...' : '할당하기'}
                </Button>
              </Box>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>

      <UnifiedAssignmentModal
        open={unifiedAssignmentModalOpen}
        onClose={() => setUnifiedAssignmentModalOpen(false)}
        preselectedGroupId={group?.id}
        onComplete={() => {
          if (group) {
            loadAssignments(group.id);
          }
        }}
      />
    </Dialog>
  );
}

export default GroupManageModal;


