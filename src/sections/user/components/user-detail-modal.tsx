
import { useState, type SyntheticEvent } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from '@/components/iconify';
import { UserDetailQuestion } from './user-detail-question';
import { UserDetailProfile } from './user-detail-profile';

import type { UserProps } from '../user-table-row';

type UserDetailModalProps = {
  open: boolean;
  onClose: () => void;
  user: UserProps | null;
  groupMap?: Record<number, string>;
};

export function UserDetailModal({ open, onClose, user, groupMap = {} }: UserDetailModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const [activeTab, setActiveTab] = useState(0);

  if (!user) {
    return null;
  }


  const getStatusColor = (status: string) => (status === 'active' ? 'success.main' : 'grey.500');

  const responseHistory = [
    { date: '2024.01.15', question: '오늘 기분이 어떠세요?', answer: '좋음', time: '오전 9:30' },
    { date: '2024.01.14', question: '혈압 측정 결과는?', answer: '120/80', time: '오전 8:45' },
    { date: '2024.01.13', question: '약물 복용하셨나요?', answer: '복용함', time: '오전 9:15' },
  ];

  const tabLabels = isMobile
    ? ['응답 기록', '응답 통계', '개인정보', '질문 설정']
    : ['응답 기록', '응답 통계', '개인정보 변경', '질문 설정'];

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isMobile ? 'sm' : isTablet ? 'md' : 'lg'}
      fullWidth
      fullScreen={isMobile || isTablet}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          m: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100vh' : '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden', // Dialog 자체의 스크롤 방지
          minHeight: isMobile ? '100vh' : '90vh',
          flex: 1,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',flex: 1 }}>
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            p: isMobile ? 1 : 2,
            borderBottom: (themeArg) => `1px solid ${themeArg.palette.divider}`,
            flexDirection: 'row',
            gap: 0,
            flexShrink: 0, // 헤더 고정
            minHeight: 'auto',
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              p: 0.5,
            }}
          >
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>

        <Box sx={{ borderBottom: (themeArg) => `1px solid ${themeArg.palette.divider}`, flexShrink: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexDirection:'row',
              textAlign: isMobile ? 'center' : 'left',
              width: isMobile ? '100%' : 'auto',
              p: isMobile ? 1.5 : 2,
            }}
          >
            <Avatar
              alt={user.name}
              src={user.avatarUrl}
              sx={{
                width: isMobile ? 60 : 48,
                height: isMobile ? 60 : 48,
                bgcolor: 'primary.main',
              }}
            />
            <Box sx={{ width: '100%' }}>
              <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 700 }}>
                {user.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                코드 {user.code} · {user.phoneNumber} 
              </Typography>
              <Box
                sx={{
                  mt: 1,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  justifyContent: isMobile ? 'center' : 'flex-start',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  {user.groupIds && user.groupIds.length
                    ? user.groupIds.map((id) => groupMap[id] ?? id.toString()).join(', ')
                    : '-'}
                </Typography>
                <Chip
                  label={user.status === 'active' ? '활성' : '비활성'}
                  size="small"
                  sx={{
                    bgcolor: getStatusColor(user.status),
                    color: 'common.white',
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
            sx={{
              px: isMobile ? 1.5 : 2,
              '& .MuiTab-root': {
                fontSize: isMobile ? '0.875rem' : '1rem',
                minWidth: isMobile ? 'auto' : 120,
                px: isMobile ? 1 : 2,
                fontWeight: 500,
                py: 1,
              },
            }}
          >
            {tabLabels.map((label, index) => (
              <Tab
                key={label}
                label={label}
                sx={{
                  fontWeight: activeTab === index ? 600 : 500,
                  color: activeTab === index ? 'primary.main' : 'text.secondary',
                }}
              />
            ))}
          </Tabs>
        </Box>

        <DialogContent
          sx={{
            p: isMobile ? 1.5 : 2,
            flex: 1,
            overflow: 'auto', // DialogContent에서 스크롤 발생
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {activeTab === 0 && (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  mb: 1.5,
                  gap: isMobile ? 1.5 : 0,
                  flexDirection:  'row',
                }}
              >
                <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 700}}>
                  최근 응답 기록
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    flexDirection:  'row',
                    
                  }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 2 , px: 2}}
                  >
                    최근 7일
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 2 , px: 2}}
                  >
                    전체 기록 보기
                  </Button>
                </Box>
              </Box>

              <TableContainer
                sx={{
                  borderRadius: 2,
                  border: (themeArg) => `1px solid ${themeArg.palette.divider}`,
                  overflowX: 'auto',
                  flex: 1,
                }}
              >
                <Table sx={{ minWidth: isMobile ? 600 : 'auto' }}>
                  <TableHead sx={{ bgcolor: 'grey.100' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: isMobile ? '0.875rem' : '1rem' }}>날짜</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: isMobile ? '0.875rem' : '1rem' }}>질문</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: isMobile ? '0.875rem' : '1rem' }}>답변</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: isMobile ? '0.875rem' : '1rem' }}>응답 시간</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {responseHistory.map((record) => (
                      <TableRow key={`${record.date}-${record.time}`}>
                        <TableCell sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>{record.date}</TableCell>
                        <TableCell sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>{record.question}</TableCell>
                        <TableCell sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>{record.answer}</TableCell>
                        <TableCell sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>{record.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 700, mb: 2 }}>
                응답 통계
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                통계 데이터가 준비되면 이 영역에 표시됩니다.
              </Typography>
            </Box>
          )}

          {activeTab === 2 && <UserDetailProfile user={user} />}

          {false && (
            <Box>
              <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 700, mb: 2 }}>
                질문 설정
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                연결된 질문 설정 정보가 준비되면 이 영역에 표시됩니다.
              </Typography>
            </Box>
          )}
          {activeTab === 3 && <UserDetailQuestion user={user} />}
        </DialogContent>

        <DialogActions
          sx={{
            p: isMobile ? 1.5 : 2,
            bgcolor: 'grey.100',
            borderTop: (themeArg) => `1px solid ${themeArg.palette.divider}`,
            justifyContent: 'flex-end',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1.5 : 0,
            flexShrink: 0, // 푸터 고정
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexDirection:  'row',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              sx={{
                borderRadius: 2,
                width: isMobile ? '100%' : 'auto',
                color: 'error.main',
                borderColor: 'error.light',
              }}
            >
              삭제
            </Button>
          </Box>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
