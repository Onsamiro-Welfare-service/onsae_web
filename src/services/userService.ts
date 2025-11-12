import { apiClient } from './api';

import type { User, PaginatedResponse, CreateUserRequest, CreateUserResponse } from '../types/api';

// Profile types
export interface UserProfile {
  id: number;
  usercode: string;
  name: string;
  phone: string;
  address: string;
  birthDate: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  guardianName: string;
  guardianRelationship: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianAddress: string;
  emergencyContacts: Record<string, unknown>;
  careNotes: string;
  isActive: boolean;
  lastLogin: string;
  institutionId: number;
  institutionName: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name: string;
  phone: string;
  address: string;
  birthDate: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  guardianName: string;
  guardianRelationship: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianAddress: string;
  emergencyContacts: Record<string, unknown>;
  careNotes: string;
}

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
    const backendUsers = await apiClient.get<BackendUser[]>(`/user`);
    // Map backend response to frontend format
    const users = backendUsers.map(mapBackendUser);
    // Convert array response to paginated format
    return {
      data: users,
    };
  },

  async createUser(payload: CreateUserRequest): Promise<CreateUserResponse> {
    // Sanitize optional/empty fields
    const body: Record<string, unknown> = {
      institutionId: payload.institutionId,
      username: payload.username,
      password: payload.password,
      name: payload.name,
    };

    // Add optional fields only if provided
    if (payload.phone) {
      body.phone = payload.phone;
    }
    if (payload.birthDate) {
      body.birthDate = payload.birthDate;
    }

    // Call new signup endpoint without authentication (public endpoint)
    const response = await apiClient.post<CreateUserResponse>('/user/signup', body, true);
    return response;
  },

  // Profile management
  async getUserProfile(userId: number): Promise<UserProfile> {
    return await apiClient.get<UserProfile>(`/user/${userId}/profile`);
  },

  async updateUserProfile(userId: number, payload: UpdateProfileRequest): Promise<UserProfile> {
    return await apiClient.put<UserProfile>(`/user/${userId}/profile`, payload);
  },

  async deleteUser(userId: number): Promise<void> {
    await apiClient.delete<void>(`/user/${userId}`);
  },
};

