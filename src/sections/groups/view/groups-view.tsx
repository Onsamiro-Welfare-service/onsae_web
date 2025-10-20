'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { Iconify } from '@/components/iconify';
import { groupService, type UserGroup } from '@/services/groupService';

import { GroupCreateModal } from '../components/group-create-modal';
import { GroupEditModal } from '../components/group-edit-modal';
import { GroupMembersModal } from '../components/group-members-modal';

export default function GroupsView() {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);

  // 그룹 목록 로드
  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await groupService.getGroups();
      setGroups(data);
    } catch (error) {
      console.error('그룹 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleCreateGroup = () => {
    setSelectedGroup(null);
    setCreateModalOpen(true);
  };

  const handleEditGroup = (group: UserGroup) => {
    setSelectedGroup(group);
    setEditModalOpen(true);
  };

  const handleViewMembers = (group: UserGroup) => {
    setSelectedGroup(group);
    setMembersModalOpen(true);
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm('정말로 이 그룹을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await groupService.deleteGroup(groupId);
      await loadGroups();
      alert('그룹이 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('그룹 삭제 실패:', error);
      alert('그룹 삭제에 실패했습니다.');
    }
  };

  const handleModalClose = () => {
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setMembersModalOpen(false);
    setSelectedGroup(null);
    loadGroups(); // 모달 닫을 때 목록 새로고침
  };

  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        {/* 헤더 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              그룹 관리
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              사용자 그룹을 생성하고 관리하세요
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleCreateGroup}
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            sx={{ borderRadius: 2 }}
          >
            그룹 생성
          </Button>
        </Box>

        {/* 그룹 목록 */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.100' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>그룹명</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>설명</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>멤버 수</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>상태</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>생성자</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>생성일</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>액션</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          로딩 중...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : groups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <Iconify icon="solar:users-group-rounded-bold" sx={{ fontSize: 48, color: 'text.secondary' }} />
                          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                            그룹이 없습니다
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            &apos;그룹 생성&apos; 버튼을 눌러 첫 번째 그룹을 만들어보세요
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    groups.map((group) => (
                      <TableRow key={group.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {group.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {group.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {group.memberCount}명
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip
                            label={group.isActive ? '활성' : '비활성'}
                            size="small"
                            color={group.isActive ? 'success' : 'default'}
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {group.createdByName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {new Date(group.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <IconButton
                              size="small"
                              onClick={() => handleViewMembers(group)}
                              sx={{ color: 'primary.main' }}
                              title="멤버 관리"
                            >
                              <Iconify icon="solar:users-group-rounded-bold" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleEditGroup(group)}
                              sx={{ color: 'warning.main' }}
                              title="수정"
                            >
                              <Iconify icon="solar:pen-bold" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteGroup(group.id)}
                              sx={{ color: 'error.main' }}
                              title="삭제"
                            >
                              <Iconify icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Stack>

      {/* 모달들 */}
      <GroupCreateModal
        open={createModalOpen}
        onClose={handleModalClose}
      />

      <GroupEditModal
        open={editModalOpen}
        onClose={handleModalClose}
        group={selectedGroup}
      />

      <GroupMembersModal
        open={membersModalOpen}
        onClose={handleModalClose}
        group={selectedGroup}
      />
    </Container>
  );
}
