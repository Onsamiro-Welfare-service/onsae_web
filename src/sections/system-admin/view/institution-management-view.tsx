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
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';

import { Scrollbar } from '@/components/scrollbar';
import { systemAdminService } from '@/services/systemAdminService';
import type { InstitutionDetail, CreateInstitutionRequest } from '@/types/api';

// ----------------------------------------------------------------------

// 사업자번호 포맷팅 함수 (000-00-00000)
const formatBusinessNumber = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`;
};

// 전화번호 포맷팅 함수 (02-0000-0000, 010-0000-0000 등)
const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, '');

  // 02, 031, 032 등 지역번호
  if (numbers.startsWith('02')) {
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5)}`;
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
  }

  // 010, 011, 016, 017, 018, 019 등 휴대폰 또는 3자리 지역번호
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  if (numbers.length <= 10) return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};

// 이메일 유효성 검사
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 웹사이트 URL 유효성 검사
const isValidWebsite = (url: string): boolean => {
  if (!url) return true; // 선택 필드이므로 빈 값은 허용

  // http:// 또는 https://가 있는 경우
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // http(s):// 없이 입력한 경우 (www.example.com, example.com 등)
  // 기본적인 도메인 패턴 검증
  const domainRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
  return domainRegex.test(url);
};

export function InstitutionManagementView() {
  const router = useRouter();
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
    businessNumber: '',
    registrationNumber: '',
    address: '',
    phone: '',
    email: '',
    directorName: '',
    website: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
  });

  // 복지관 목록 조회
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let isActiveParam: boolean | undefined;
        if (filterStatus === 'all') {
          isActiveParam = undefined;
        } else if (filterStatus === 'active') {
          isActiveParam = true;
        } else if (filterStatus === 'inactive') {
          isActiveParam = false;
        }

        console.log('필터 상태:', filterStatus, '→ isActive 파라미터:', isActiveParam);

        const response = await systemAdminService.getInstitutions({
          isActive: isActiveParam,
        });

        console.log('API 응답 데이터:', response);

        // 클라이언트 측 필터링 (백엔드가 isActive 파라미터를 제대로 처리하지 못하는 경우)
        let filteredData = response;
        if (filterStatus === 'active') {
          filteredData = response.filter(inst => inst.isActive === true);
        } else if (filterStatus === 'inactive') {
          filteredData = response.filter(inst => inst.isActive === false);
        }

        console.log('필터링된 데이터:', filteredData);
        setInstitutions(filteredData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '복지관 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstitutions();
  }, [filterStatus]);

  const handleDetailClick = async (institution: InstitutionDetail) => {
    try {
      setActionLoading(true);
      const detailData = await systemAdminService.getInstitution(institution.id);
      console.log('복지관 상세 데이터:', detailData);
      setSelectedInstitution(detailData);
      setDetailModalOpen(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : '복지관 상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateClick = () => {
    setNewInstitution({
      name: '',
      businessNumber: '',
      registrationNumber: '',
      address: '',
      phone: '',
      email: '',
      directorName: '',
      website: '',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
    });
    setCreateModalOpen(true);
  };

  const handleCreate = async () => {
    try {
      setActionLoading(true);
      await systemAdminService.createInstitution(newInstitution);
      setCreateModalOpen(false);
      // 목록 새로고침
      let isActiveParam: boolean | undefined;
      if (filterStatus === 'all') {
        isActiveParam = undefined;
      } else if (filterStatus === 'active') {
        isActiveParam = true;
      } else if (filterStatus === 'inactive') {
        isActiveParam = false;
      }

      const response = await systemAdminService.getInstitutions({
        isActive: isActiveParam,
      });

      // 클라이언트 측 필터링
      let filteredData = response;
      if (filterStatus === 'active') {
        filteredData = response.filter(inst => inst.isActive === true);
      } else if (filterStatus === 'inactive') {
        filteredData = response.filter(inst => inst.isActive === false);
      }

      setInstitutions(filteredData);
      alert('복지관이 생성되었습니다.');
    } catch (err) {
      alert(err instanceof Error ? err.message : '복지관 생성에 실패했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusToggle = async (institution: InstitutionDetail, newStatus: 'active' | 'inactive') => {
    try {
      await systemAdminService.updateInstitution(institution.id, { status: newStatus });
      // 목록 새로고침
      let isActiveParam: boolean | undefined;
      if (filterStatus === 'all') {
        isActiveParam = undefined;
      } else if (filterStatus === 'active') {
        isActiveParam = true;
      } else if (filterStatus === 'inactive') {
        isActiveParam = false;
      }

      const response = await systemAdminService.getInstitutions({
        isActive: isActiveParam,
      });

      // 클라이언트 측 필터링
      let filteredData = response;
      if (filterStatus === 'active') {
        filteredData = response.filter(inst => inst.isActive === true);
      } else if (filterStatus === 'inactive') {
        filteredData = response.filter(inst => inst.isActive === false);
      }

      setInstitutions(filteredData);
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
              복지관 관리
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              복지관 등록 및 관리
            </Typography>
          </Box>
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
          <TableContainer sx={{ position: 'relative', overflow: institutions.length === 0 ? 'visible' : 'auto' }}>
            <Scrollbar>
              <Table sx={{ minWidth: institutions.length === 0 ? 'auto' : 960, width: institutions.length === 0 ? '100%' : 'auto' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>복지관명</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>주소</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>연락처</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>관리자 수</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>사용자 수</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>상태</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>등록일</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {institutions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                        <Typography variant="body2" color="text.secondary">
                          복지관이 없습니다
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    institutions.map((institution) => (
                      <TableRow
                        key={institution.id}
                        hover
                        onClick={() => handleDetailClick(institution)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{institution.name}</TableCell>
                        <TableCell>{institution.address}</TableCell>
                        <TableCell>{institution.phone}</TableCell>
                        <TableCell>{institution.adminCount || 0}명</TableCell>
                        <TableCell>{institution.userCount || 0}명</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <FormControl size="small" fullWidth sx={{ minWidth: 100 }}>
                            <Select
                              value={institution.isActive ? 'active' : 'inactive'}
                              onChange={(e) => handleStatusToggle(institution, e.target.value as 'active' | 'inactive')}
                              disabled
                            >
                              <MenuItem value="active">활성</MenuItem>
                              <MenuItem value="inactive">비활성</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>{new Date(institution.createdAt).toLocaleDateString()}</TableCell>
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
      <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="md" fullWidth>
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
              <Stack direction="row" spacing={2}>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    사업자번호
                  </Typography>
                  <Typography variant="body1">{selectedInstitution.businessNumber}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    등록번호
                  </Typography>
                  <Typography variant="body1">{selectedInstitution.registrationNumber}</Typography>
                </Box>
              </Stack>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  주소
                </Typography>
                <Typography variant="body1">{selectedInstitution.address}</Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    대표 전화번호
                  </Typography>
                  <Typography variant="body1">{selectedInstitution.phone}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    대표 이메일
                  </Typography>
                  <Link href={`mailto:${selectedInstitution.email}`} underline="hover">
                    <Typography variant="body1">{selectedInstitution.email}</Typography>
                  </Link>
                </Box>
              </Stack>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  관장명
                </Typography>
                <Typography variant="body1">{selectedInstitution.directorName}</Typography>
              </Box>
              {selectedInstitution.website && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    웹사이트
                  </Typography>
                  <Link href={selectedInstitution.website} target="_blank" rel="noopener noreferrer" underline="hover">
                    <Typography variant="body1">{selectedInstitution.website}</Typography>
                  </Link>
                </Box>
              )}
              <Typography variant="subtitle2" sx={{ pt: 2 }}>
                담당자 정보
              </Typography>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  담당자명
                </Typography>
                <Typography variant="body1">{selectedInstitution.contactPerson}</Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    담당자 전화번호
                  </Typography>
                  <Typography variant="body1">{selectedInstitution.contactPhone}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    담당자 이메일
                  </Typography>
                  <Link href={`mailto:${selectedInstitution.contactEmail}`} underline="hover">
                    <Typography variant="body1">{selectedInstitution.contactEmail}</Typography>
                  </Link>
                </Box>
              </Stack>
              <Typography variant="subtitle2" sx={{ pt: 2 }}>
                통계 정보
              </Typography>
              <Stack direction="row" spacing={2}>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    관리자 수
                  </Typography>
                  <Typography variant="body1">{selectedInstitution.adminCount || 0}명</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    사용자 수
                  </Typography>
                  <Typography variant="body1">{selectedInstitution.userCount || 0}명</Typography>
                </Box>
              </Stack>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  상태
                </Typography>
                <Typography variant="body1">
                  {selectedInstitution.isActive ? '활성' : '비활성'}
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    등록일
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedInstitution.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    수정일
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedInstitution.updatedAt).toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 생성 모달 */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="md" fullWidth>
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
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="사업자번호"
                value={newInstitution.businessNumber}
                onChange={(e) => {
                  const formatted = formatBusinessNumber(e.target.value);
                  setNewInstitution({ ...newInstitution, businessNumber: formatted });
                }}
                placeholder="000-00-00000"
                inputProps={{ maxLength: 12 }}
                required
              />
              <TextField
                fullWidth
                label="등록번호"
                value={newInstitution.registrationNumber}
                onChange={(e) => setNewInstitution({ ...newInstitution, registrationNumber: e.target.value })}
                required
              />
            </Stack>
            <TextField
              fullWidth
              label="주소"
              value={newInstitution.address}
              onChange={(e) => setNewInstitution({ ...newInstitution, address: e.target.value })}
              required
            />
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="대표 전화번호"
                value={newInstitution.phone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setNewInstitution({ ...newInstitution, phone: formatted });
                }}
                placeholder="02-0000-0000"
                inputProps={{ maxLength: 13 }}
                required
              />
              <TextField
                fullWidth
                label="대표 이메일"
                type="email"
                value={newInstitution.email}
                onChange={(e) => setNewInstitution({ ...newInstitution, email: e.target.value })}
                placeholder="contact@institution.kr"
                error={newInstitution.email !== '' && !isValidEmail(newInstitution.email)}
                helperText={
                  newInstitution.email !== '' && !isValidEmail(newInstitution.email)
                    ? '올바른 이메일 형식이 아닙니다'
                    : ''
                }
                required
              />
            </Stack>
            <TextField
              fullWidth
              label="관장명"
              value={newInstitution.directorName}
              onChange={(e) => setNewInstitution({ ...newInstitution, directorName: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="웹사이트"
              value={newInstitution.website}
              onChange={(e) => setNewInstitution({ ...newInstitution, website: e.target.value })}
              placeholder="www.example.com 또는 https://www.example.com"
              error={newInstitution.website !== '' && !isValidWebsite(newInstitution.website)}
              helperText={
                newInstitution.website !== '' && !isValidWebsite(newInstitution.website)
                  ? '올바른 URL 형식이 아닙니다 (예: www.example.com, example.com, https://example.com)'
                  : ''
              }
            />
            <Typography variant="subtitle2" sx={{ pt: 2 }}>
              담당자 정보
            </Typography>
            <TextField
              fullWidth
              label="담당자명"
              value={newInstitution.contactPerson}
              onChange={(e) => setNewInstitution({ ...newInstitution, contactPerson: e.target.value })}
              required
            />
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="담당자 전화번호"
                value={newInstitution.contactPhone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setNewInstitution({ ...newInstitution, contactPhone: formatted });
                }}
                placeholder="010-0000-0000"
                inputProps={{ maxLength: 13 }}
                required
              />
              <TextField
                fullWidth
                label="담당자 이메일"
                type="email"
                value={newInstitution.contactEmail}
                onChange={(e) => setNewInstitution({ ...newInstitution, contactEmail: e.target.value })}
                placeholder="manager@institution.kr"
                error={newInstitution.contactEmail !== '' && !isValidEmail(newInstitution.contactEmail)}
                helperText={
                  newInstitution.contactEmail !== '' && !isValidEmail(newInstitution.contactEmail)
                    ? '올바른 이메일 형식이 아닙니다'
                    : ''
                }
                required
              />
            </Stack>
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
              !newInstitution.businessNumber ||
              !newInstitution.registrationNumber ||
              !newInstitution.address ||
              !newInstitution.phone ||
              !newInstitution.email ||
              !newInstitution.directorName ||
              !newInstitution.contactPerson ||
              !newInstitution.contactPhone ||
              !newInstitution.contactEmail ||
              !isValidEmail(newInstitution.email) ||
              !isValidEmail(newInstitution.contactEmail) ||
              !isValidWebsite(newInstitution.website || '')
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
