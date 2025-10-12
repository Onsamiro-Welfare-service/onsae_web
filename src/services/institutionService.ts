const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface Institution {
  id: number;
  name: string;
  businessNumber: string | null;
  address: string | null;
  phone: string | null;
  directorName: string | null;
}

export const institutionService = {
  /**
   * 활성화된 기관 목록 조회
   */
  async getInstitutions(): Promise<Institution[]> {
    const response = await fetch(`${API_BASE_URL}/institutions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '기관 목록 조회에 실패했습니다.' }));
      throw new Error(error.message || '기관 목록 조회에 실패했습니다.');
    }

    return response.json();
  },
};
