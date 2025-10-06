import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';


// ----------------------------------------------------------------------

export function DashboardView() {
  const [selectedInstitution, setSelectedInstitution] = useState('서울시립 복지관');

  // 모의 데이터
  const statsData = [
    {
      title: '총 사용자 수',
      value: '156',
      change: '+12 이번 주',
      icon: '👥',
    },
    {
      title: '활성 사용자',
      value: '142',
      change: '+8 이번 주',
      icon: '✅',
    },
    {
      title: '오늘 응답 수',
      value: '89',
      change: '+15 오늘',
      icon: '📝',
    },
    {
      title: '미처리 업로드',
      value: '7',
      change: '+2 오늘',
      icon: '📤',
    },
  ];

  const recentActivities = [
    {
      user: '김철수 (A001)',
      activity: '건강상태 질문 답변',
      time: '2분 전',
      status: '완료',
    },
    {
      user: '이영희 (A002)',
      activity: '사진 업로드',
      time: '5분 전',
      status: '미처리',
    },
    {
      user: '박민수 (A003)',
      activity: '고혈압 질문 답변',
      time: '10분 전',
      status: '완료',
    },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      

      {/* 메인 콘텐츠 */}
      <Box sx={{ flex: 1, bgcolor: '#fafafa' }}>
        {/* 헤더 */}
        <Box
          sx={{
            height: 64,
            bgcolor: '#ffffff',
            borderBottom: '1px solid #e5e5e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            대시보드
          </Typography>
        </Box>

        {/* 콘텐츠 영역 */}
        <Box sx={{ p: 3 }}>
          {/* 통계 카드 그리드 */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statsData.map((stat, index) => (
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }} key={index}>
                <Card
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    height: 140,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, fontSize: 32 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {stat.change}
                  </Typography>
                </Card>
              </Box>
            ))}
          </Grid>

          {/* 차트 섹션 */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <Card sx={{ p: 3, borderRadius: 2, height: 360 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  일별 응답 현황
                </Typography>
                <Box
                  sx={{
                    height: 200,
                    bgcolor: '#f5f5f5',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'end',
                    justifyContent: 'space-around',
                    p: 2,
                  }}
                >
                  {[200, 150, 180, 120, 160, 190, 220].map((height, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 40,
                        height: height,
                        bgcolor: '#d9d9d9',
                        borderRadius: 0.5,
                      }}
                    />
                  ))}
                </Box>
              </Card>
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <Card sx={{ p: 3, borderRadius: 2, height: 360 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  사용자 그룹 현황
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box
                    sx={{
                      width: 200,
                      height: 200,
                      bgcolor: '#d9d9d9',
                      borderRadius: '50%',
                    }}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: '#d9d9d9', borderRadius: 0.5 }} />
                      <Typography variant="body2">고혈압 그룹 (45명)</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: '#d9d9d9', borderRadius: 0.5 }} />
                      <Typography variant="body2">당뇨병 그룹 (32명)</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: '#d9d9d9', borderRadius: 0.5 }} />
                      <Typography variant="body2">기타 그룹 (79명)</Typography>
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Box>
          </Grid>

          {/* 최근 활동 */}
          <Card sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              최근 활동
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>사용자</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>활동</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>시간</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>상태</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentActivities.map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>
                        {activity.user}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>
                        {activity.activity}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>
                        {activity.time}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>
                        {activity.status}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {/* 빠른 액션 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#177578',
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 700,
              }}
            >
              + 새 사용자 등록
            </Button>
            <Button
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 700,
                borderColor: '#e5e5e5',
              }}
            >
              + 새 질문 생성
            </Button>
            <Button
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 700,
                borderColor: '#e5e5e5',
              }}
            >
              📤 업로드 관리
            </Button>
            <Button
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 700,
                borderColor: '#e5e5e5',
              }}
            >
              ⚙️ 관리자 승인
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 