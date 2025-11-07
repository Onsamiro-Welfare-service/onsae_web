import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { Scrollbar } from '@/components/scrollbar';

import { AdminTableRow } from '../components/admin-table-row';
import { AdminDetailModal } from '../components/admin-detail-modal';
import { WelfareCenterTableRow } from '../components/welfare-center-table-row';
import { WelfareCenterDetailModal } from '../components/welfare-center-detail-modal';

// ----------------------------------------------------------------------

export function AdminView() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedWelfareCenter, setSelectedWelfareCenter] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [welfareCenterModalOpen, setWelfareCenterModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // 모의 데이터
  const welfareCenters = [
    {
      id: '1',
      name: '서울시 강남구 복지관',
      address: '서울시 강남구 테헤란로 123',
      admin: '김관리자',
      userCount: 45,
      status: 'active' as const,
      registeredAt: '2024-01-15',
    },
    {
      id: '2',
      name: '부산시 해운대구 복지관',
      address: '부산시 해운대구 센텀중앙로 456',
      admin: '이관리자',
      userCount: 32,
      status: 'active' as const,
      registeredAt: '2024-01-20',
    },
  ];

  const admins = [
    {
      id: '1',
      name: '김관리자',
      welfareCenter: '서울시 강남구 복지관',
      email: 'admin@gangnam-welfare.kr',
      role: '복지관 관리자',
      status: 'active' as const,
      lastLogin: '2024-01-20 14:30',
    },
    {
      id: '2',
      name: '이관리자',
      welfareCenter: '부산시 해운대구 복지관',
      email: 'admin@haeundae-welfare.kr',
      role: '복지관 관리자',
      status: 'active' as const,
      lastLogin: '2024-01-19 09:15',
    },
    {
      id: '3',
      name: '박관리자',
      welfareCenter: '대구시 수성구 복지관',
      email: 'admin@suseong-welfare.kr',
      role: '복지관 관리자',
      status: 'inactive' as const,
      lastLogin: '2024-01-10 16:45',
    },
  ];

  const handleWelfareCenterDetail = (welfareCenter: any) => {
    setSelectedWelfareCenter(welfareCenter);
    setWelfareCenterModalOpen(true);
  };

  const handleAdminDetail = (admin: any) => {
    setSelectedAdmin(admin);
    setAdminModalOpen(true);
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        {/* 페이지 헤더 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            관리자 관리
          </Typography>
        </Box>

        {/* 탭 메뉴 */}
        <Card sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction="row" spacing={0}>
              <Button
                variant={activeTab === 0 ? 'contained' : 'text'}
                onClick={() => setActiveTab(0)}
                sx={{
                  borderRadius: 0,
                  px: 3,
                  py: 2,
                  bgcolor: activeTab === 0 ? 'primary.main' : 'transparent',
                  color: activeTab === 0 ? 'white' : 'text.primary',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: activeTab === 0 ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                🏢 복지관 관리
              </Button>
              <Button
                variant={activeTab === 1 ? 'contained' : 'text'}
                onClick={() => setActiveTab(1)}
                sx={{
                  borderRadius: 0,
                  px: 3,
                  py: 2,
                  bgcolor: activeTab === 1 ? 'primary.main' : 'transparent',
                  color: activeTab === 1 ? 'white' : 'text.primary',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: activeTab === 1 ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                👤 관리자 관리
              </Button>
            </Stack>
          </Box>
        </Card>

        {/* 필터 및 검색 영역 */}
        <Card sx={{ mb: 3 }}>
          <Box sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 300,
                    height: 40,
                    bgcolor: '#fafafa',
                    border: '1px solid #cccccc',
                    borderRadius: 1,
                    px: 2,
                    display: 'flex',
                    alignItems: 'center',
                    color: '#666666',
                    fontSize: 14,
                  }}
                >
                  {activeTab === 0 ? '복지관명 또는 관리자명 검색...' : '관리자명 또는 이메일 검색...'}
                </Box>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: 'primary.main',
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  전체
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: '#cccccc',
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  활성
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: '#cccccc',
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  비활성
                </Button>
              </Box>
              <Button
                variant="contained"
                sx={{
                  bgcolor: 'primary.main',
                  borderRadius: 1,
                  px: 3,
                  py: 1,
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                + {activeTab === 0 ? '새 복지관' : '새 관리자'}
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
                    {activeTab === 0 ? (
                      <>
                        <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>복지관명</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>주소</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>관리자</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>사용자 수</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>상태</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>등록일</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>액션</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>관리자명</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>소속 복지관</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>이메일</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>권한</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>상태</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>최근 로그인</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>액션</TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeTab === 0
                    ? welfareCenters.map((welfareCenter) => (
                        <WelfareCenterTableRow
                          key={welfareCenter.id}
                          welfareCenter={welfareCenter}
                          onDetail={() => handleWelfareCenterDetail(welfareCenter)}
                        />
                      ))
                    : admins.map((admin) => (
                        <AdminTableRow
                          key={admin.id}
                          admin={admin}
                          onDetail={() => handleAdminDetail(admin)}
                        />
                      ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        </Card>

        {/* 페이지네이션 */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={3} color="primary" />
        </Box>
      </Box>

      {/* 모달들 */}
      <WelfareCenterDetailModal
        open={welfareCenterModalOpen}
        onClose={() => setWelfareCenterModalOpen(false)}
        welfareCenter={selectedWelfareCenter}
      />

      <AdminDetailModal
        open={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        admin={selectedAdmin}
      />
    </>
  );
} 