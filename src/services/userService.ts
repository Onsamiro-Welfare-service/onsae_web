import { apiClient } from './api';

import type { User, PaginatedResponse, CreateUserRequest } from '../types/api';
import { _careUsers } from '../_mock/_data';

const USE_MOCK_DATA = true; // TODO: flip to false once API is ready
const MOCK_LATENCY = 200;

type MockUser = (typeof _careUsers)[number];

const ensureTimestamps = (date?: string) => date ?? new Date().toISOString();

const mapMockUser = (user: MockUser): User => ({
  ...user,
  status: user.status === 'active' ? 'active' : 'inactive',
  createdAt: ensureTimestamps((user as User).createdAt),
  updatedAt: ensureTimestamps((user as User).updatedAt),
});

export const userService = {
  async getUsers(params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'inactive';
    group?: string;
  }): Promise<PaginatedResponse<User>> {
    if (!USE_MOCK_DATA) {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.group) queryParams.append('group', params.group);

      return apiClient.get<PaginatedResponse<User>>(`/users?${queryParams.toString()}`);
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;

    const filtered = _careUsers.filter((user) => {
      const matchStatus = params?.status ? user.status === params.status : true;
      const matchGroup = params?.group ? user.group === params.group : true;
      return matchStatus && matchGroup;
    });

    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit).map((item) => mapMockUser(item));

    const response: PaginatedResponse<User> = {
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

  async createUser(payload: CreateUserRequest): Promise<User> {
    if (!USE_MOCK_DATA) {
      return apiClient.post<User>('/users', payload);
    }

    const nowIso = new Date().toISOString();
    const fallbackCode = 'U' + Math.random().toString(36).slice(2, 8).toUpperCase();
    const providedCode = payload.code ? payload.code.trim() : '';
    const generatedCode = providedCode || fallbackCode;

    const newUser: User = {
      id: generatedCode,
      ...payload,
      code: generatedCode,
      status: 'active',
      avatarUrl: '/assets/images/avatar/avatar-1.webp',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    (_careUsers as unknown as User[]).unshift(newUser);

    return new Promise((resolve) => setTimeout(() => resolve(newUser), MOCK_LATENCY));
  },
};



