import { getAuthHeader } from '@/utils/auth';
import type {
  SystemAdminLoginRequest,
  LoginResponse,
  AdminDetail,
  InstitutionDetail,
  ApproveAdminRequest,
  UpdateAdminStatusRequest,
  CreateInstitutionRequest,
  UpdateInstitutionRequest,
  ApiResponse,
  PaginatedResponse,
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const systemAdminService = {
  /**
   * 시스템 관리자 로그인
   */
  async login(request: SystemAdminLoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/system/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: '시스템 관리자 로그인에 실패했습니다.',
      }));
      throw new Error(error.message || '시스템 관리자 로그인에 실패했습니다.');
    }

    return response.json();
  },

  /**
   * 복지관 관리자 목록 조회
   */
  async getAdmins(params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'inactive' | 'pending';
    search?: string;
  }): Promise<PaginatedResponse<AdminDetail>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const response = await fetch(
      `${API_BASE_URL}/system-admin/admins?${queryParams.toString()}`,
      {
        headers: {
          ...getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      throw new Error('관리자 목록 조회에 실패했습니다.');
    }

    return response.json();
  },

  /**
   * 복지관 관리자 상세 조회
   */
  async getAdmin(adminId: number): Promise<AdminDetail> {
    const response = await fetch(`${API_BASE_URL}/system-admin/admins/${adminId}`, {
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('관리자 정보 조회에 실패했습니다.');
    }

    return response.json();
  },

  /**
   * 승인 대기 중인 복지관 관리자 목록 조회
   */
  async getPendingAdmins(): Promise<AdminDetail[]> {
    const response = await fetch(`${API_BASE_URL}/admin`, {
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('승인 대기 관리자 목록 조회에 실패했습니다.');
    }

    return response.json();
  },

  /**
   * 복지관 관리자 승인/거부
   */
  async approveAdmin(adminId: number, approved: boolean): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/approve/${adminId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ approved }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: '관리자 승인/거부에 실패했습니다.',
      }));
      throw new Error(error.message || '관리자 승인/거부에 실패했습니다.');
    }
  },

  /**
   * 복지관 관리자 상태 변경
   */
  async updateAdminStatus(adminId: number, status: string, reason?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/${adminId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status, reason: reason || '' }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: '관리자 상태 변경에 실패했습니다.',
      }));
      throw new Error(error.message || '관리자 상태 변경에 실패했습니다.');
    }
  },

  /**
   * 복지관 목록 조회
   */
  async getInstitutions(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    search?: string;
  }): Promise<InstitutionDetail[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.search) queryParams.append('search', params.search);

    const url = `${API_BASE_URL}/institutions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    console.log('복지관 목록 조회 URL:', url);

    const response = await fetch(url, {
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('복지관 목록 조회에 실패했습니다.');
    }

    return response.json();
  },

  /**
   * 복지관 상세 조회
   */
  async getInstitution(institutionId: number): Promise<InstitutionDetail> {
    const response = await fetch(`${API_BASE_URL}/institutions/${institutionId}`, {
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('복지관 정보 조회에 실패했습니다.');
    }

    return response.json();
  },

  /**
   * 복지관 생성
   */
  async createInstitution(request: CreateInstitutionRequest): Promise<InstitutionDetail> {
    const response = await fetch(`${API_BASE_URL}/institutions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: '복지관 생성에 실패했습니다.',
      }));
      throw new Error(error.message || '복지관 생성에 실패했습니다.');
    }

    return response.json();
  },

  /**
   * 복지관 수정
   */
  async updateInstitution(
    institutionId: number,
    request: UpdateInstitutionRequest
  ): Promise<InstitutionDetail> {
    const response = await fetch(`${API_BASE_URL}/institutions/${institutionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: '복지관 수정에 실패했습니다.',
      }));
      throw new Error(error.message || '복지관 수정에 실패했습니다.');
    }

    return response.json();
  },

  /**
   * 복지관 삭제 (Soft Delete)
   */
  async deleteInstitution(institutionId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/institutions/${institutionId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: '복지관 삭제에 실패했습니다.',
      }));
      throw new Error(error.message || '복지관 삭제에 실패했습니다.');
    }
  },
};
