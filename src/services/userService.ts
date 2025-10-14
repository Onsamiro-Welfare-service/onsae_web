import { apiClient } from './api';

import type { User, PaginatedResponse, CreateUserRequest } from '../types/api';

// Backend API response type
interface BackendUser {
  id: number;
  usercode: string;
  name: string;
  phone: string | null;
  birthDate: string;
  groupIds: number[];
  severity: string;
  guardianName: string | null;
  guardianPhone: string | null;
  isActive: boolean;
  lastLogin: string | null;
  institutionId: number;
  institutionName: string;
  createdAt: string;
}

// Map backend user response to frontend format
// Be defensive: some create endpoints may not return full entity
const mapBackendUser = (backendUser: BackendUser): User => ({
  id: backendUser?.id != null ? backendUser.id.toString() : backendUser.usercode || '',
  name: backendUser.name || '',
  loginCode: backendUser.usercode || '',
  phone: backendUser.phone || '',
  guardianName: backendUser.guardianName || '',
  guardianRelation: '', // Not provided by backend
  guardianPhone: backendUser.guardianPhone || '',
  groupIds: backendUser.groupIds, // Not provided by backend, might need to be fetched separately
  status: backendUser.isActive ? 'active' : 'inactive',
  avatarUrl: '',//'/assets/images/avatar/avatar-1.webp', // Default avatar
  createdAt: backendUser.createdAt || '',
  updatedAt: backendUser.createdAt || '',
  birthDate: backendUser.birthDate || ''
});

export const userService = {
  async getUsers(): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();
    // Backend returns an array, not a paginated response
    const backendUsers = await apiClient.get<BackendUser[]>(`/user`);
    // Map backend response to frontend format
    const users = backendUsers.map(mapBackendUser);
    // Convert array response to paginated format
    return {
      data: users,
    };
  },

  async createUser(payload: CreateUserRequest): Promise<User> {
    // Sanitize optional/empty fields to reduce backend 500s from empty strings
    const body: any = { ...payload };
    if (!body.birthDate) delete body.birthDate;
    if (!body.guardianRelation) delete body.guardianRelation;
    if (!body.guardianPhone) delete body.guardianPhone;
    if (!body.guardianName) delete body.guardianName;
    if (!body.loginCode) delete body.loginCode;
    // Backend returns backend-shaped user, map it to frontend User
    // rename to backend expected key if needed
    const created = await apiClient.post<BackendUser>('/user/register', body);
    return mapBackendUser(created);
  },
};

