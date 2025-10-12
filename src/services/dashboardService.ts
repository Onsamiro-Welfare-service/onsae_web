import type {
  DashboardStats,
  ResponseTrends,
  UserGroupsStats,
  RecentActivities,
} from '@/types/api';
import { getAuthHeader } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const dashboardService = {
  /**
   * 대시보드 핵심 통계 조회
   */
  async getStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `대시보드 통계 조회 실패 (${response.status})`
      );
    }

    return response.json();
  },

  /**
   * 응답 추이 조회
   */
  async getResponseTrends(period: '7d' | '30d' | '90d' = '7d'): Promise<ResponseTrends> {
    const response = await fetch(`${API_BASE_URL}/dashboard/response-trends?period=${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `응답 추이 조회 실패 (${response.status})`
      );
    }

    return response.json();
  },

  /**
   * 사용자 그룹 현황 조회
   */
  async getUserGroups(): Promise<UserGroupsStats> {
    const response = await fetch(`${API_BASE_URL}/dashboard/user-groups`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `사용자 그룹 조회 실패 (${response.status})`
      );
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
    let url = `${API_BASE_URL}/dashboard/recent-activities?limit=${limit}`;
    if (type && type !== 'all') {
      url += `&type=${type}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `최근 활동 조회 실패 (${response.status})`
      );
    }

    return response.json();
  },
};
