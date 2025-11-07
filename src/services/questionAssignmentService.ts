import { apiClient } from './api';

export interface QuestionAssignmentPayload {
  questionId: number;
  userId: number | null;
  groupId: number | null;
  priority: number;
}

export interface QuestionAssignmentRecord {
  id: number;
  questionId: number;
  questionTitle: string;
  questionContent: string;
  userId: number | null;
  userName: string | null;
  groupId: number | null;
  groupName: string | null;
  priority: number;
  assignedById: number | null;
  assignedByName: string | null;
  assignedAt: string;
  responseCount: number;
}

export interface AssignByCategoryPayload {
  categoryId: number;
  userId: number | null;
  groupId: number | null;
  priority: number;
}

export const questionAssignmentService = {
  // 질문 할당 상세 조회
  async getAssignment(assignmentId: number): Promise<QuestionAssignmentRecord> {
    return apiClient.get<QuestionAssignmentRecord>(`/question-assignments/${assignmentId}`);
  },

  // 질문 할당 목록 조회
  async getAssignments(): Promise<QuestionAssignmentRecord[]> {
    return apiClient.get<QuestionAssignmentRecord[]>('/question-assignments');
  },

  // 질문 할당 생성
  async assignQuestion(payload: QuestionAssignmentPayload): Promise<void> {
    await apiClient.post<void>('/question-assignments', payload);
  },

  // 순차적 할당 (기존 유지)
  async assignQuestionsSequential(payloads: QuestionAssignmentPayload[]): Promise<void> {
    for (const p of payloads) {
      // eslint-disable-next-line no-await-in-loop
      await apiClient.post<void>('/question-assignments', p);
    }
  },

  // 사용자별 질문 할당 조회
  async getAssignmentsByUser(userId: number | string): Promise<QuestionAssignmentRecord[]> {
    const idPath = encodeURIComponent(String(userId));
    return apiClient.get<QuestionAssignmentRecord[]>(`/question-assignments/by-user/${idPath}`);
  },

  // 그룹별 질문 할당 조회
  async getAssignmentsByGroup(groupId: number | string): Promise<QuestionAssignmentRecord[]> {
    const idPath = encodeURIComponent(String(groupId));
    return apiClient.get<QuestionAssignmentRecord[]>(`/question-assignments/by-group/${idPath}`);
  },

  // 카테고리별 질문 할당
  async assignByCategory(payload: AssignByCategoryPayload): Promise<void> {
    await apiClient.post<void>('/question-assignments/by-category', payload);
  },

  // 질문 할당 수정
  async updateAssignment(assignmentId: number | string, payload: QuestionAssignmentPayload): Promise<void> {
    const idPath = encodeURIComponent(String(assignmentId));
    await apiClient.put<void>(`/question-assignments/${idPath}`, payload);
  },

  // 질문 할당 삭제
  async deleteAssignment(assignmentId: number | string): Promise<void> {
    const idPath = encodeURIComponent(String(assignmentId));
    await apiClient.delete<void>(`/question-assignments/${idPath}`);
  },
};
