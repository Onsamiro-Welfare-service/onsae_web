import { apiClient } from './api';

import type { PaginatedResponse, UploadRecord } from '../types/api';
import { _responses } from '../_mock/_data';

const USE_MOCK_DATA = true; // TODO: set false when real API is ready
const MOCK_LATENCY = 200;

type MockUpload = (typeof _responses)[number];

type UploadQueryParams = {
  page?: number;
  limit?: number;
  userId?: string;
  status?: 'completed' | 'incomplete';
};

const normalizeResponseData = (
  responseData: MockUpload['responseData']
): UploadRecord['responseData'] => ({
  선택답변: responseData?.선택답변 ?? null,
  기타의견: responseData?.기타의견 ?? null,
});

const mapMockUpload = (item: MockUpload): UploadRecord => ({
  ...item,
  status: item.status === 'completed' ? 'completed' : 'incomplete',
  responseData: normalizeResponseData(item.responseData),
});

export const uploadService = {
  async getUploads(params?: UploadQueryParams): Promise<PaginatedResponse<UploadRecord>> {
    if (!USE_MOCK_DATA) {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.userId) queryParams.append('userId', params.userId);
      if (params?.status) queryParams.append('status', params.status);

      return apiClient.get<PaginatedResponse<UploadRecord>>(`/uploads?${queryParams.toString()}`);
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;

    let filtered: MockUpload[] = [..._responses];
    if (params?.userId) {
      filtered = filtered.filter((item) => item.userId === params.userId);
    }
    if (params?.status) {
      filtered = filtered.filter((item) => item.status === params.status);
    }

    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit).map((item) => mapMockUpload(item));

    const response: PaginatedResponse<UploadRecord> = {
      data: paginated,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
      },
    };

    return new Promise((resolve) => setTimeout(() => resolve(response), MOCK_LATENCY));
  },
};
