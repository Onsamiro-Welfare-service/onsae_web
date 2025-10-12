import { apiClient } from './api';

import type { User, PaginatedResponse, CreateUserRequest } from '../types/api';
import { _careUsers } from '../_mock/_data';

const USE_MOCK_DATA = false; // API connected
const MOCK_LATENCY = 200;

type MockUser = (typeof _careUsers)[number];

// Backend API response type
interface BackendUser {
  id: number;
  usercode: string;
  name: string;
  phone: string | null;
  birthDate: string | null;
  severity: string;
  guardianName: string | null;
  guardianPhone: string | null;
  isActive: boolean;
  lastLogin: string | null;
  institutionId: number;
  institutionName: string;
  createdAt: string;
}

const ensureTimestamps = (date?: string) => date ?? new Date().toISOString();

const mapMockUser = (user: MockUser): User => ({
  ...user,
  status: user.status === 'active' ? 'active' : 'inactive',
  createdAt: ensureTimestamps((user as User).createdAt),
  updatedAt: ensureTimestamps((user as User).updatedAt),
});

// Map backend user response to frontend format
const mapBackendUser = (backendUser: BackendUser): User => ({
  id: backendUser.id.toString(),
  name: backendUser.name,
  code: backendUser.usercode,
  phoneNumber: backendUser.phone || '',
  guardianName: backendUser.guardianName || '',
  guardianRelation: '', // Not provided by backend
  guardianPhone: backendUser.guardianPhone || '',
  group: '', // Not provided by backend, might need to be fetched separately
  status: backendUser.isActive ? 'active' : 'inactive',
  avatarUrl: '/assets/images/avatar/avatar-1.webp', // Default avatar
  createdAt: backendUser.createdAt,
  updatedAt: backendUser.createdAt, // Backend doesn't provide updatedAt
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

      // Backend returns an array, not a paginated response
      const backendUsers = await apiClient.get<BackendUser[]>(`/user?${queryParams.toString()}`);

      // Map backend response to frontend format
      const users = backendUsers.map(mapBackendUser);

      // Convert array response to paginated format
      return {
        data: users,
        pagination: {
          page: params?.page ?? 1,
          limit: params?.limit ?? users.length,
          total: users.length,
          totalPages: 1,
        },
      };
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
      return apiClient.post<User>('/user/register', payload);
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



