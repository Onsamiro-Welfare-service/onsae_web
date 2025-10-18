'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { Scrollbar } from '@/components/scrollbar';
import { systemAdminService } from '@/services/systemAdminService';
import type { AdminDetail } from '@/types/api';
// ----------------------------------------------------------------------

export function SystemAdminManagementView() {
  const [admins, setAdmins] = useState<AdminDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminDetail | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'pending'>(
    'all'
  );

  // 관리자 목록 조회
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await systemAdminService.getAdmins({
          status: filterStatus === 'all' ? undefined : filterStatus,
        });
        setAdmins(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '관리자 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, [filterStatus]);

  const handleDetailClick = (admin: AdminDetail) => {
    setSelectedAdmin(admin);
    setDetailModalOpen(true);
  };

  const handleApproveClick = (admin: AdminDetail) => {
    setSelectedAdmin(admin);
    setApproveModalOpen(true);
  };

  const handleApprove = async (approved: boolean) => {
    if (!selectedAdmin) return;

    try {
      setActionLoading(true);
      await systemAdminService.approveAdmin({
        adminId: selectedAdmin.id,
        approved,
      });
      setApproveModalOpen(false);
      // 목록 새로고침
      const response = await systemAdminService.getAdmins({
        status: filterStatus === 'all' ? undefined : filterStatus,
      });
      setAdmins(response.data);
    } catch (err) {
      alert(err instanceof Error ? err.message : '작업에 실패했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusToggle = async (admin: AdminDetail) => {
    try {
      const newStatus = admin.status === 'active' ? 'inactive' : 'active';
      await systemAdminService.updateAdminStatus({
        adminId: admin.id,
        status: newStatus,
      });
      // 목록 새로고침
      const response = await systemAdminService.getAdmins({
        status: filterStatus === 'all' ? undefined : filterStatus,
      });
      setAdmins(response.data);
    } catch (err) {
      alert(err instanceof Error ? err.message : '상태 변경에 실패했습니다.');
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'active':
        return <Chip label="활성" color="success" size="small" />;
      case 'inactive':
        return <Chip label="비활성" color="default" size="small" />;
      case 'pending':
        return <Chip label="승인대기" color="warning" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: 3 }}>
        {/* 페이지 헤더 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            복지관 관리자 인증 관리
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            복지관 관리자 계정 승인 및 상태 관리
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* 필터 영역 */}
        <Card sx={{ mb: 3 }}>
          <Box sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant={filterStatus === 'all' ? 'contained' : 'outlined'}
                onClick={() => setFilterStatus('all')}
                sx={{ bgcolor: filterStatus === 'all' ? '#177578' : 'transparent' }}
              >
                전체
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'contained' : 'outlined'}
                onClick={() => setFilterStatus('pending')}
                sx={{ bgcolor: filterStatus === 'pending' ? '#177578' : 'transparent' }}
              >
                승인대기
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'contained' : 'outlined'}
                onClick={() => setFilterStatus('active')}
                sx={{ bgcolor: filterStatus === 'active' ? '#177578' : 'transparent' }}
              >
                활성
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'contained' : 'outlined'}
                onClick={() => setFilterStatus('inactive')}
                sx={{ bgcolor: filterStatus === 'inactive' ? '#177578' : 'transparent' }}
              >
                비활성
              </Button>
            </Stack>
          </Box>
        </Card>

        {/* 테이블 영역 */}
        <Card>
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table sx={{ minWidth: 960 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>관리자명</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>이메일</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>소속 복지관</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>상태</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>가입일</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>최근 로그인</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>액션</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {admins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                        <Typography variant="body2" color="text.secondary">
                          관리자가 없습니다
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    admins.map((admin) => (
                      <TableRow key={admin.id} hover>
                        <TableCell>{admin.name}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>{admin.institutionName}</TableCell>
                        <TableCell>{getStatusChip(admin.status)}</TableCell>
                        <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {admin.lastLogin
                            ? new Date(admin.lastLogin).toLocaleDateString()
                            : '없음'}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button size="small" onClick={() => handleDetailClick(admin)}>
                              상세
                            </Button>
                            {admin.status === 'pending' && (
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => handleApproveClick(admin)}
                                sx={{ bgcolor: '#177578' }}
                              >
                                승인
                              </Button>
                            )}
                            {admin.status !== 'pending' && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleStatusToggle(admin)}
                              >
                                {admin.status === 'active' ? '비활성화' : '활성화'}
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        </Card>
      </Box>

      {/* 상세 모달 */}
      <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>관리자 상세 정보</DialogTitle>
        <DialogContent>
          {selectedAdmin && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  이름
                </Typography>
                <Typography variant="body1">{selectedAdmin.name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  이메일
                </Typography>
                <Typography variant="body1">{selectedAdmin.email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  소속 복지관
                </Typography>
                <Typography variant="body1">{selectedAdmin.institutionName}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  상태
                </Typography>
                <Box sx={{ mt: 0.5 }}>{getStatusChip(selectedAdmin.status)}</Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  가입일
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedAdmin.createdAt).toLocaleString()}
                </Typography>
              </Box>
              {selectedAdmin.lastLogin && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    최근 로그인
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedAdmin.lastLogin).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 승인 모달 */}
      <Dialog open={approveModalOpen} onClose={() => setApproveModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>관리자 승인</DialogTitle>
        <DialogContent>
          {selectedAdmin && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>{selectedAdmin.name}</strong> ({selectedAdmin.email})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                소속: {selectedAdmin.institutionName}
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                이 관리자를 승인하시겠습니까?
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveModalOpen(false)} disabled={actionLoading}>
            취소
          </Button>
          <Button
            onClick={() => handleApprove(false)}
            color="error"
            disabled={actionLoading}
            startIcon={actionLoading && <CircularProgress size={16} />}
          >
            거부
          </Button>
          <Button
            onClick={() => handleApprove(true)}
            variant="contained"
            sx={{ bgcolor: '#177578' }}
            disabled={actionLoading}
            startIcon={actionLoading && <CircularProgress size={16} />}
          >
            승인
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
