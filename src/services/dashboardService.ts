import type {
  DashboardStats,
  ResponseTrends,
  UserGroupsStats,
  RecentActivities,
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const dashboardService = {
  /**
   * 대시보드 핵심 통계 조회
   */
  async getStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authentication token
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    return response.json();
  },

  /**
   * 응답 추이 조회
   */
  async getResponseTrends(period: '7d' | '30d' | '90d' = '7d'): Promise<ResponseTrends> {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/response-trends?period=${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authentication token
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch response trends');
    }

    return response.json();
  },

  /**
   * 사용자 그룹 현황 조회
   */
  async getUserGroups(): Promise<UserGroupsStats> {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/user-groups`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authentication token
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user groups');
    }

    return response.json();
  },

  /**
   * 최근 활동 조회
   */
  async getRecentActivities(
    limit: number = 20,
    type?: 'all' | 'responses' | 'uploads' | 'approvals'
  ): Promise<RecentActivities> {
    let url = `${API_BASE_URL}/api/dashboard/recent-activities?limit=${limit}`;
    if (type && type !== 'all') {
      url += `&type=${type}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authentication token
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recent activities');
    }

    return response.json();
  },
};
