import { apiClient } from './api';

// Group types
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

export interface GroupMember {
  id: number;
  groupId: number;
  groupName: string;
  userId: number;
  usercode: string;
  userName: string;
  joinedAt: string;
  isActive: boolean;
  addedById: number;
  addedByName: string;
}

export interface CreateGroupRequest {
  name: string;
  description: string;
}

export interface UpdateGroupRequest {
  name: string;
  description: string;
}

export interface AddMembersRequest {
  userIds: number[];
}

export const groupService = {
  // 그룹 목록 조회
  async getGroups(): Promise<UserGroup[]> {
    return await apiClient.get<UserGroup[]>('/user-groups');
  },

  // 활성 그룹 목록 조회
  async getActiveGroups(): Promise<UserGroup[]> {
    return await apiClient.get<UserGroup[]>('/user-groups/active');
  },

  // 그룹 상세 조회
  async getGroup(groupId: number): Promise<UserGroup> {
    return await apiClient.get<UserGroup>(`/user-groups/${groupId}`);
  },

  // 그룹 생성
  async createGroup(payload: CreateGroupRequest): Promise<UserGroup> {
    return await apiClient.post<UserGroup>('/user-groups', payload);
  },

  // 그룹 수정
  async updateGroup(groupId: number, payload: UpdateGroupRequest): Promise<UserGroup> {
    return await apiClient.put<UserGroup>(`/user-groups/${groupId}`, payload);
  },

  // 그룹 삭제
  async deleteGroup(groupId: number): Promise<void> {
    return await apiClient.delete<void>(`/user-groups/${groupId}`);
  },

  // 그룹 멤버 목록 조회
  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    return await apiClient.get<GroupMember[]>(`/user-groups/${groupId}/members`);
  },

  // 그룹에 멤버 추가
  async addGroupMembers(groupId: number, payload: AddMembersRequest): Promise<void> {
    return await apiClient.post<void>(`/user-groups/${groupId}/members`, payload);
  },

  // 그룹에서 멤버 제거
  async removeGroupMember(groupId: number, userId: number): Promise<void> {
    return await apiClient.delete<void>(`/user-groups/${groupId}/members/${userId}`);
  },
};
