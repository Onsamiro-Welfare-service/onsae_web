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

export const questionAssignmentService = {
  async assignQuestion(payload: QuestionAssignmentPayload): Promise<void> {
    await apiClient.post<void>('/question-assignments', payload);
  },

  async assignQuestionsSequential(payloads: QuestionAssignmentPayload[]): Promise<void> {
    for (const p of payloads) {
      // eslint-disable-next-line no-await-in-loop
      await apiClient.post<void>('/question-assignments', p);
    }
  },

  async getAssignmentsByUser(userId: number | string): Promise<QuestionAssignmentRecord[]> {
    const idPath = encodeURIComponent(String(userId));
    return apiClient.get<QuestionAssignmentRecord[]>(`/question-assignments/by-user/${idPath}`);
  },

  async updateAssignment(assignmentId: number | string, payload: QuestionAssignmentPayload): Promise<void> {
    const idPath = encodeURIComponent(String(assignmentId));
    await apiClient.put<void>(`/question-assignments/${idPath}`, payload);
  },

  async deleteAssignment(assignmentId: number | string): Promise<void> {
    const idPath = encodeURIComponent(String(assignmentId));
    await apiClient.delete<void>(`/question-assignments/${idPath}`);
  },
};
