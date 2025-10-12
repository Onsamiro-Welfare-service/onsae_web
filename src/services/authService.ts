const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface UserLoginRequest {
  loginCode: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
  institutionId: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: string;
  user: {
    id: number;
    userType: string;
    name: string;
    email: string | null;
    institutionId: number | null;
    institutionName: string | null;
    authorities: string[];
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  /**
   * 일반 사용자 로그인
   */
  async userLogin(request: UserLoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '로그인에 실패했습니다.' }));
      throw new Error(error.message || '로그인에 실패했습니다.');
    }

    return response.json();
  },

  /**
   * 관리자 로그인
   */
  async adminLogin(request: AdminLoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '로그인에 실패했습니다.' }));
      throw new Error(error.message || '로그인에 실패했습니다.');
    }

    return response.json();
  },

  /**
   * 토큰 갱신
   */
  async refreshToken(request: RefreshTokenRequest): Promise<TokenResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('토큰 갱신에 실패했습니다.');
    }

    return response.json();
  },

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // 로그아웃은 실패해도 클라이언트에서 처리
      console.error('Logout error:', error);
    }
  },
};
