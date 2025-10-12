'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from '@/layouts/dashboard';
import { dashboardService } from '@/services/dashboardService';

import { DashboardStatsCard } from '../dashboard-stats-card';
import { DashboardResponseChart } from '../dashboard-response-chart';
import { DashboardGroupChart } from '../dashboard-group-chart';
import { DashboardActivitiesTable } from '../dashboard-activities-table';

import type { DashboardStats, ResponseTrends, UserGroupsStats, RecentActivities } from '@/types/api';

// ----------------------------------------------------------------------

export function DashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<ResponseTrends | null>(null);
  const [groups, setGroups] = useState<UserGroupsStats | null>(null);
  const [activities, setActivities] = useState<RecentActivities | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 모든 대시보드 데이터를 병렬로 가져오기
        const [statsData, trendsData, groupsData, activitiesData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getResponseTrends('7d'),
          dashboardService.getUserGroups(),
          dashboardService.getRecentActivities(10),
        ]);

        setStats(statsData);
        setTrends(trendsData);
        setGroups(groupsData);
        setActivities(activitiesData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('대시보드 데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <DashboardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
          }}
        >
          <CircularProgress size={48} />
        </Box>
      </DashboardContent>
    );
  }

  if (error) {
    return (
      <DashboardContent>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      {/* 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          대시보드
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          복지관 운영 현황을 한눈에 확인하세요
        </Typography>
      </Box>

      {/* 통계 카드 그리드 */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardStatsCard
              title="총 사용자 수"
              value={stats.totalUsers}
              change={stats.totalUsersChange}
              icon="👥"
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardStatsCard
              title="활성 사용자"
              value={stats.activeUsers}
              change={stats.activeUsersChange}
              icon="✅"
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardStatsCard
              title="오늘 응답률"
              value={`${stats.todayResponses.rate.toFixed(1)}%`}
              change={{ value: stats.todayResponses.change, period: '오늘' }}
              icon="📝"
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardStatsCard
              title="미처리 업로드"
              value={stats.pendingUploads.count}
              change={stats.pendingUploads}
              icon="📤"
              color="warning"
            />
          </Grid>
        </Grid>
      )}

      {/* 차트 섹션 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          {trends && <DashboardResponseChart data={trends.data} />}
        </Grid>
        <Grid item xs={12} md={5}>
          {groups && <DashboardGroupChart groups={groups.groups} />}
        </Grid>
      </Grid>

      {/* 최근 활동 */}
      {activities && <DashboardActivitiesTable activities={activities.activities} />}
    </DashboardContent>
  );
}
