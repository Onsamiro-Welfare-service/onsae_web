'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from '@/components/iconify';
import { groupService, type GroupMember, type UserGroup } from '@/services/groupService';

type GroupMembersModalProps = {
  open: boolean;
  onClose: () => void;
  group: UserGroup | null;
};

export function GroupMembersModal({ open, onClose, group }: GroupMembersModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);

  // 멤버 목록 로드
  const loadMembers = async () => {
    if (!group) return;
    
    try {
      setLoading(true);
      const data = await groupService.getGroupMembers(group.id);
      setMembers(data);
    } catch (error) {
      console.error('멤버 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && group) {
      loadMembers();
    }
  }, [open, group]);

  const handleRemoveMember = async (userId: number, userName: string) => {
    if (!group) return;
    
    if (!confirm(`정말로 ${userName}님을 이 그룹에서 제거하시겠습니까?`)) {
      return;
    }

    try {
      setRemoving(userId);
      await groupService.removeGroupMember(group.id, userId);
      await loadMembers(); // 목록 새로고침
      alert('멤버가 성공적으로 제거되었습니다.');
    } catch (error) {
      console.error('멤버 제거 실패:', error);
      alert('멤버 제거에 실패했습니다.');
    } finally {
      setRemoving(null);
    }
  };

  const handleClose = () => {
    setMembers([]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:users-group-rounded-bold" sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              그룹 멤버 관리
            </Typography>
            {group && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {group.name} ({members.length}명)
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              멤버 목록을 불러오는 중...
            </Typography>
          </Box>
        ) : members.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Iconify icon="solar:users-group-rounded-bold" sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
              멤버가 없습니다
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              이 그룹에는 아직 멤버가 없습니다.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>사용자 코드</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>이름</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>상태</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>가입일</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>추가한 사람</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>액션</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {member.usercode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {member.userName}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip
                        label={member.isActive ? '활성' : '비활성'}
                        size="small"
                        color={member.isActive ? 'success' : 'default'}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {member.addedByName}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveMember(member.userId, member.userName)}
                        disabled={removing === member.userId}
                        sx={{ color: 'error.main' }}
                        title="그룹에서 제거"
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
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose}>
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
