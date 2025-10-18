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
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { Scrollbar } from '@/components/scrollbar';
import { systemAdminService } from '@/services/systemAdminService';
import type { InstitutionDetail, CreateInstitutionRequest } from '@/types/api';

// ----------------------------------------------------------------------

export function InstitutionManagementView() {
  const [institutions, setInstitutions] = useState<InstitutionDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionDetail | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // 새 복지관 생성 폼 데이터
  const [newInstitution, setNewInstitution] = useState<CreateInstitutionRequest>({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  // 복지관 목록 조회
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await systemAdminService.getInstitutions({
          status: filterStatus === 'all' ? undefined : filterStatus,
        });
        setInstitutions(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '복지관 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstitutions();
  }, [filterStatus]);

  const handleDetailClick = (institution: InstitutionDetail) => {
    setSelectedInstitution(institution);
    setDetailModalOpen(true);
  };

  const handleCreateClick = () => {
    setNewInstitution({
      name: '',
      address: '',
      phone: '',
      email: '',
    });
    setCreateModalOpen(true);
  };

  const handleCreate = async () => {
    try {
      setActionLoading(true);
      await systemAdminService.createInstitution(newInstitution);
      setCreateModalOpen(false);
      // 목록 새로고침
      const response = await systemAdminService.getInstitutions({
        status: filterStatus === 'all' ? undefined : filterStatus,
      });
      setInstitutions(response.data);
      alert('복지관이 생성되었습니다.');
    } catch (err) {
      alert(err instanceof Error ? err.message : '복지관 생성에 실패했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusToggle = async (institution: InstitutionDetail) => {
    try {
      const newStatus = institution.status === 'active' ? 'inactive' : 'active';
      await systemAdminService.updateInstitution(institution.id, { status: newStatus });
      // 목록 새로고침
      const response = await systemAdminService.getInstitutions({
        status: filterStatus === 'all' ? undefined : filterStatus,
      });
      setInstitutions(response.data);
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
            복지관 관리
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            복지관 등록 및 관리
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* 필터 및 액션 영역 */}
        <Card sx={{ mb: 3 }}>
          <Box sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={2}>
                <Button
                  variant={filterStatus === 'all' ? 'contained' : 'outlined'}
                  onClick={() => setFilterStatus('all')}
                  sx={{ bgcolor: filterStatus === 'all' ? '#177578' : 'transparent' }}
                >
                  전체
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
              <Button
                variant="contained"
                onClick={handleCreateClick}
                sx={{ bgcolor: '#177578' }}
              >
                + 새 복지관
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
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>복지관명</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>주소</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>연락처</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>관리자 수</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>사용자 수</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>상태</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>등록일</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>액션</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {institutions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                        <Typography variant="body2" color="text.secondary">
                          복지관이 없습니다
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    institutions.map((institution) => (
                      <TableRow key={institution.id} hover>
                        <TableCell>{institution.name}</TableCell>
                        <TableCell>{institution.address}</TableCell>
                        <TableCell>{institution.phone}</TableCell>
                        <TableCell>{institution.adminCount}명</TableCell>
                        <TableCell>{institution.userCount}명</TableCell>
                        <TableCell>{getStatusChip(institution.status)}</TableCell>
                        <TableCell>{new Date(institution.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button size="small" onClick={() => handleDetailClick(institution)}>
                              상세
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleStatusToggle(institution)}
                            >
                              {institution.status === 'active' ? '비활성화' : '활성화'}
                            </Button>
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
        <DialogTitle>복지관 상세 정보</DialogTitle>
        <DialogContent>
          {selectedInstitution && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  복지관명
                </Typography>
                <Typography variant="body1">{selectedInstitution.name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  주소
                </Typography>
                <Typography variant="body1">{selectedInstitution.address}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  연락처
                </Typography>
                <Typography variant="body1">{selectedInstitution.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  이메일
                </Typography>
                <Typography variant="body1">{selectedInstitution.email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  관리자 수
                </Typography>
                <Typography variant="body1">{selectedInstitution.adminCount}명</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  사용자 수
                </Typography>
                <Typography variant="body1">{selectedInstitution.userCount}명</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  상태
                </Typography>
                <Box sx={{ mt: 0.5 }}>{getStatusChip(selectedInstitution.status)}</Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  등록일
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedInstitution.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 생성 모달 */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>새 복지관 등록</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="복지관명"
              value={newInstitution.name}
              onChange={(e) => setNewInstitution({ ...newInstitution, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="주소"
              value={newInstitution.address}
              onChange={(e) => setNewInstitution({ ...newInstitution, address: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="연락처"
              value={newInstitution.phone}
              onChange={(e) => setNewInstitution({ ...newInstitution, phone: e.target.value })}
              placeholder="010-0000-0000"
              required
            />
            <TextField
              fullWidth
              label="이메일"
              type="email"
              value={newInstitution.email}
              onChange={(e) => setNewInstitution({ ...newInstitution, email: e.target.value })}
              placeholder="contact@institution.kr"
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateModalOpen(false)} disabled={actionLoading}>
            취소
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            sx={{ bgcolor: '#177578' }}
            disabled={
              actionLoading ||
              !newInstitution.name ||
              !newInstitution.address ||
              !newInstitution.phone ||
              !newInstitution.email
            }
            startIcon={actionLoading && <CircularProgress size={16} />}
          >
            등록
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
