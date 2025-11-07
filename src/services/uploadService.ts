import { apiClient } from './api';

import type {
  UploadListResponse,
  UploadResponse,
  AdminResponseRequest,
} from '../types/api';

export const uploadService = {
  /**
   * 기관 전체 업로드 목록 조회
   * GET /api/admin/uploads
   * @param limit 최대 개수 (선택사항)
   * @param offset 시작 위치 (선택사항)
   */
  async getUploads(limit?: number, offset?: number): Promise<UploadListResponse[]> {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append('limit', limit.toString());
    if (offset !== undefined) params.append('offset', offset.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/admin/uploads?${queryString}` : '/admin/uploads';
    
    const response = await apiClient.get<UploadListResponse[]>(endpoint);
    return Array.isArray(response) ? response : [];
  },

  /**
   * 업로드 상세 조회
   * GET /api/admin/uploads/{uploadId}
   */
  async getUploadDetail(uploadId: number): Promise<UploadResponse> {
    return apiClient.get<UploadResponse>(`/admin/uploads/${uploadId}`);
  },

  /**
   * 관리자 응답
   * PUT /api/admin/uploads/{uploadId}/response
   */
  async submitAdminResponse(
    uploadId: number,
    request: AdminResponseRequest
  ): Promise<UploadResponse> {
    return apiClient.put<UploadResponse>(
      `/admin/uploads/${uploadId}/response`,
      request
    );
  },
};
