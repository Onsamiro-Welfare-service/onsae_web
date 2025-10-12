import { apiClient } from './api';

import type { PaginatedResponse, Response } from '../types/api';
import { _responses } from '../_mock/_data';

const USE_MOCK_DATA = true; // Backend API not implemented yet
const MOCK_LATENCY = 200;

type MockResponse = (typeof _responses)[number];

type ResponseQueryParams = {
  page?: number;
  limit?: number;
  userId?: string;
  status?: 'completed' | 'incomplete';
};

const normalizeResponseData = (
  responseData: MockResponse['responseData']
): Response['responseData'] => ({
  선택답변: responseData?.선택답변 ?? null,
  기타의견: responseData?.기타의견 ?? null,
});

const mapMockResponse = (item: MockResponse): Response => ({
  ...item,
  status: item.status === 'completed' ? 'completed' : 'incomplete',
  responseData: normalizeResponseData(item.responseData),
});

export const responseService = {
  async getResponses(params?: ResponseQueryParams): Promise<PaginatedResponse<Response>> {
    if (!USE_MOCK_DATA) {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.userId) queryParams.append('userId', params.userId);
      if (params?.status) queryParams.append('status', params.status);

      return apiClient.get<PaginatedResponse<Response>>(`/responses?${queryParams.toString()}`);
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;

    let filtered: MockResponse[] = [..._responses];
    if (params?.userId) {
      filtered = filtered.filter((item) => item.userId === params.userId);
    }
    if (params?.status) {
      filtered = filtered.filter((item) => item.status === params.status);
    }

    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit).map((item) => mapMockResponse(item));

    const response: PaginatedResponse<Response> = {
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
