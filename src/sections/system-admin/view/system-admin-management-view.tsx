'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';

import { Scrollbar } from '@/components/scrollbar';
import { systemAdminService } from '@/services/systemAdminService';
import type { AdminDetail } from '@/types/api';
// ----------------------------------------------------------------------

export function SystemAdminManagementView() {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminDetail[]>([]);
  const [allAdmins, setAllAdmins] = useState<AdminDetail[]>([]);
  const [institutions, setInstitutions] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminDetail | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [statusChangeModalOpen, setStatusChangeModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusChangeReason, setStatusChangeReason] = useState<string>('');

  // 필터 상태
  const [filterInstitution, setFilterInstitution] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<string | 'all'>('all');

  // 관리자 목록 조회
  useEffect(() => {
    fetchAdmins();
  }, []);

  // 필터링된 데이터
  useEffect(() => {
    let filtered = allAdmins;

    if (filterInstitution !== 'all') {
      filtered = filtered.filter(admin => admin.institutionId === filterInstitution);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(admin => admin.status === filterStatus);
    }

    setAdmins(filtered);
  }, [filterInstitution, filterStatus, allAdmins]);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await systemAdminService.getPendingAdmins();
      setAllAdmins(response);

      // 복지관 목록 추출 (중복 제거)
      const uniqueInstitutions = response.reduce((acc, admin) => {
        if (!acc.find(inst => inst.id === admin.institutionId)) {
          acc.push({ id: admin.institutionId, name: admin.institutionName });
        }
        return acc;
      }, [] as { id: number; name: string }[]);
      setInstitutions(uniqueInstitutions);
    } catch (err) {
      setError(err instanceof Error ? err.message : '관리자 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailClick = (admin: AdminDetail) => {
    setSelectedAdmin(admin);
    setDetailModalOpen(true);
  };

  const handleStatusSelectChange = (admin: AdminDetail, status: string) => {
    setSelectedAdmin(admin);
    setNewStatus(status);
    setStatusChangeReason('');
    setStatusChangeModalOpen(true);
  };

  const handleStatusChange = async () => {
    if (!selectedAdmin) return;

    try {
      await systemAdminService.updateAdminStatus(selectedAdmin.id, newStatus, statusChangeReason);
      setStatusChangeModalOpen(false);
      // 목록 새로고침
      await fetchAdmins();
      alert('상태가 변경되었습니다.');
    } catch (err) {
      alert(err instanceof Error ? err.message : '상태 변경에 실패했습니다.');
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
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => router.push('/system-admin')}
            sx={{
              bgcolor: 'white',
              '&:hover': { bgcolor: '#f5f5f5' },
              boxShadow: 1,
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              복지관 관리자 인증 관리
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              복지관 관리자 계정 승인 및 상태 관리
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* 필터 영역 */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <Typography variant="caption" sx={{ mb: 0.5, color: 'text.secondary' }}>
              복지관
            </Typography>
            <Select
              size="small"
              value={filterInstitution}
              onChange={(e) => setFilterInstitution(e.target.value as number | 'all')}
            >
              <MenuItem value="all">전체</MenuItem>
              {institutions.map((inst) => (
                <MenuItem key={inst.id} value={inst.id}>
                  {inst.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <Typography variant="caption" sx={{ mb: 0.5, color: 'text.secondary' }}>
              상태
            </Typography>
            <Select
              size="small"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">전체</MenuItem>
              <MenuItem value="PENDING">승인대기</MenuItem>
              <MenuItem value="APPROVED">승인됨</MenuItem>
              <MenuItem value="REJECTED">거부됨</MenuItem>
              <MenuItem value="SUSPENDED">정지됨</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* 테이블 영역 */}
        <Card>
          <TableContainer sx={{ position: 'relative', overflow: 'auto' }}>
            <Scrollbar>
              <Table sx={{ minWidth: 1200 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>관리자명</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>이메일</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>전화번호</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>소속 복지관</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', minWidth: 140 }}>상태</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>가입일</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>승인일</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>승인자</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>최근 로그인</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>비고</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {admins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                        <Typography variant="body2" color="text.secondary">
                          관리자가 없습니다
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    admins.map((admin) => (
                      <TableRow
                        key={admin.id}
                        hover
                        onClick={() => handleDetailClick(admin)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{admin.name}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{admin.email}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{admin.phone}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{admin.institutionName}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()} sx={{ whiteSpace: 'nowrap' }}>
                          <FormControl size="small" fullWidth sx={{ minWidth: 120 }}>
                            <Select
                              value={admin.status}
                              onChange={(e) => handleStatusSelectChange(admin, e.target.value)}
                            >
                              <MenuItem value="PENDING">승인대기</MenuItem>
                              <MenuItem value="APPROVED">승인됨</MenuItem>
                              <MenuItem value="REJECTED">거부됨</MenuItem>
                              <MenuItem value="SUSPENDED">정지됨</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {admin.approvedAt
                            ? new Date(admin.approvedAt).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{admin.approvedBy || '-'}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {admin.lastLogin
                            ? new Date(admin.lastLogin).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {admin.rejectionReason && admin.rejectionReason !== 'string'
                            ? admin.rejectionReason
                            : ''}
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

      {/* 상태 변경 모달 */}
      <Dialog open={statusChangeModalOpen} onClose={() => setStatusChangeModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>관리자 상태 변경</DialogTitle>
        <DialogContent>
          {selectedAdmin && (
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>{selectedAdmin.name}</strong> ({selectedAdmin.email})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  소속: {selectedAdmin.institutionName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  상태를 <strong>
                    {newStatus === 'PENDING' && '승인대기'}
                    {newStatus === 'APPROVED' && '승인됨'}
                    {newStatus === 'REJECTED' && '거부됨'}
                    {newStatus === 'SUSPENDED' && '정지됨'}
                  </strong>(으)로 변경합니다.
                </Typography>
              </Box>
              {(newStatus === 'REJECTED' || newStatus === 'SUSPENDED') && (
                <TextField
                  fullWidth
                  label="사유"
                  multiline
                  rows={3}
                  value={statusChangeReason}
                  onChange={(e) => setStatusChangeReason(e.target.value)}
                  placeholder="상태 변경 사유를 입력하세요"
                  required
                />
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusChangeModalOpen(false)}>
            취소
          </Button>
          <Button
            onClick={handleStatusChange}
            variant="contained"
            sx={{ bgcolor: '#177578' }}
            disabled={
              (newStatus === 'REJECTED' || newStatus === 'SUSPENDED') && !statusChangeReason.trim()
            }
          >
            변경
          </Button>
        </DialogActions>
      </Dialog>

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
                  전화번호
                </Typography>
                <Typography variant="body1">{selectedAdmin.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  소속 복지관
                </Typography>
                <Typography variant="body1">{selectedAdmin.institutionName}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  역할
                </Typography>
                <Typography variant="body1">{selectedAdmin.role}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  상태
                </Typography>
                <Typography variant="body1">
                  {selectedAdmin.status === 'PENDING' && '승인대기'}
                  {selectedAdmin.status === 'APPROVED' && '승인됨'}
                  {selectedAdmin.status === 'REJECTED' && '거부됨'}
                  {selectedAdmin.status === 'SUSPENDED' && '정지됨'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  가입일
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedAdmin.createdAt).toLocaleString()}
                </Typography>
              </Box>
              {selectedAdmin.approvedAt && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    승인일
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedAdmin.approvedAt).toLocaleString()}
                  </Typography>
                </Box>
              )}
              {selectedAdmin.approvedBy && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    승인자
                  </Typography>
                  <Typography variant="body1">{selectedAdmin.approvedBy}</Typography>
                </Box>
              )}
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
              {selectedAdmin.rejectionReason && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    거부 사유
                  </Typography>
                  <Typography variant="body1" color="error">
                    {selectedAdmin.rejectionReason}
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
    </>
  );
}
