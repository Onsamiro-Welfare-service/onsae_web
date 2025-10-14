import { apiClient } from './api';

export interface UserGroup {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  memberCount: number;
  institutionId: number;
  institutionName: string;
  createdById: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserGroupRequest {
  name: string;
  description: string;
}

export const userGroupService = {
  async getUserGroups(): Promise<UserGroup[]> {
    return apiClient.get<UserGroup[]>('/user-groups');
  },

  async createUserGroup(payload: CreateUserGroupRequest): Promise<UserGroup> {
    return apiClient.post<UserGroup>('/user-groups', payload);
  },
};

