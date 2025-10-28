'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
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
import { userService } from '@/services/userService';
import type { User } from '@/types/api';

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
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setAddDialogOpen(false);
    setSelectedUserIds([]);
    setSearchFilter('');
    onClose();
  };

  // 사용자 목록 로드
  const loadAvailableUsers = useCallback(async () => {
    try {
      const response = await userService.getUsers();
      // 현재 그룹에 속하지 않은 사용자만 필터링
      const memberIds = new Set(members.map(m => m.userId));
      const available = response.data.filter(user => !memberIds.has(parseInt(user.id)));
      setAvailableUsers(available);
    } catch (error) {
      console.error('사용자 목록 로드 실패:', error);
    }
  }, [members]);

  const handleOpenAddDialog = () => {
    loadAvailableUsers();
    setAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
    setSelectedUserIds([]);
    setSearchFilter('');
  };

  const handleToggleUser = (userId: number) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddMembers = async () => {
    if (!group || selectedUserIds.length === 0) return;

    try {
      setLoading(true);
      await groupService.addGroupMembers(group.id, { userIds: selectedUserIds });
      await loadMembers();
      handleCloseAddDialog();
      alert('멤버가 성공적으로 추가되었습니다.');
    } catch (error) {
      console.error('멤버 추가 실패:', error);
      alert('멤버 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = availableUsers.filter(user => 
    user.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    user.loginCode.toLowerCase().includes(searchFilter.toLowerCase())
  );

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
        <Button onClick={handleOpenAddDialog} variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
          멤버 추가
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={handleClose}>
          닫기
        </Button>
      </DialogActions>
    </Dialog>

    {/* 멤버 추가 다이얼로그 */}
    <Dialog
      open={addDialogOpen}
      onClose={handleCloseAddDialog}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="eva:person-fill" sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              멤버 추가
            </Typography>
          </Box>
          <IconButton onClick={handleCloseAddDialog} size="small">
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <OutlinedInput
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="이름 또는 코드로 검색..."
          fullWidth
          startAdornment={
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          }
          sx={{ mb: 3 }}
        />

        {filteredUsers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              추가 가능한 사용자가 없습니다.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ width: 50 }} />
                  <TableCell sx={{ fontWeight: 600 }}>코드</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>이름</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>상태</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow 
                    key={user.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleToggleUser(parseInt(user.id))}
                  >
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedUserIds.includes(parseInt(user.id))}
                        onChange={() => handleToggleUser(parseInt(user.id))}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {user.loginCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status === 'active' ? '활성' : '비활성'}
                        size="small"
                        color={user.status === 'active' ? 'success' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mr: 'auto' }}>
          {selectedUserIds.length}명 선택됨
        </Typography>
        <Button onClick={handleCloseAddDialog}>취소</Button>
        <Button 
          onClick={handleAddMembers}
          variant="contained"
          disabled={selectedUserIds.length === 0 || loading}
        >
          추가
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}
