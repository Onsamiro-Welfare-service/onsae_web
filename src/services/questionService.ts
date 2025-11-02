import { apiClient } from './api';

import type {
  Question,
  PaginatedResponse,
  CreateQuestionRequest,
  QuestionOptions,
  QuestionType,
} from '../types/api';

// 질문 상세 조회 타입
export interface QuestionDetail {
  id: number;
  title: string;
  content: string;
  questionType: QuestionType;
  categoryId: number;
  categoryName: string;
  options: QuestionOptions;
  allowOtherOption: boolean;
  otherOptionLabel: string;
  otherOptionPlaceholder: string;
  isRequired: boolean;
  isActive: boolean;
  institutionId: number;
  institutionName: string;
  createdById: number;
  createdByName: string;
  assignmentCount: number;
  responseCount: number;
  createdAt: string;
  updatedAt: string;
}

// 질문 수정 요청 타입
export interface UpdateQuestionRequest {
  title: string;
  content: string;
  questionType: QuestionType;
  categoryId: number;
  options?: QuestionOptions | null;
  allowOtherOption?: boolean;
  otherOptionLabel?: string | null;
  otherOptionPlaceholder?: string | null;
  isRequired: boolean;
}

// 사용자별 질문 응답 통계 타입
export interface UserQuestionStatistics {
  userId: number;
  userName: string;
  totalAssignedQuestions: number;
  totalCompletedQuestions: number;
  completionRate: number;
  averageResponseTime: number;
  questionStatistics: Array<{
    questionId: number;
    questionTitle: string;
    questionType: QuestionType;
    categoryName: string | null;
    isCompleted: boolean;
    responseCount: number;
    lastResponseAt: string | null;
    responseTimeSeconds: number | null;
  }>;
}

// Backend API response type
interface BackendQuestion {
  id: number;
  title: string;
  content: string;
  questionType: QuestionType;
  categoryId: number | null;
  categoryName: string | null;
  options: QuestionOptions | null;
  allowOtherOption: boolean;
  otherOptionLabel: string;
  otherOptionPlaceholder: string | null;
  isRequired: boolean;
  isActive: boolean;
  institutionId: number;
  institutionName: string;
  createdById: number | null;
  createdByName: string | null;
  assignmentCount: number;
  responseCount: number;
  createdAt: string;
  updatedAt: string;
}

// Extract displayable option labels from backend options object
const extractDisplayOptions = (backend: BackendQuestion): string[] => {
  const o = backend.options as any;
  if (!o) {
    if (backend.questionType === 'YES_NO') return ['예', '아니오'];
    return [];
  }
  switch (o.type) {
    case 'single':
    case 'multiple':
      return (o.options || []).map((opt: any) => opt.label);
    case 'scale':
      return [
        `${o.min} ~ ${o.max}` +
          (o.minLabel || o.maxLabel ? ` (${o.minLabel ?? ''} ~ ${o.maxLabel ?? ''})` : ''),
      ];
    case 'text':
      return [o.placeholder ?? '텍스트 입력'];
    case 'date':
      return ['날짜 선택'];
    case 'time':
      return ['시간 선택'];
    default:
      return [];
  }
};

// Map backend question response to frontend format
const mapBackendQuestion = (backendQuestion: BackendQuestion): Question => ({
  id: backendQuestion.id.toString(),
  title: backendQuestion.title,
  content: backendQuestion.content,
  category: backendQuestion.categoryName || '-',
  type: backendQuestion.questionType,
  priority: '중간', // Backend doesn't provide priority
  status: backendQuestion.isActive ? 'active' : 'inactive',
  options: extractDisplayOptions(backendQuestion),
  createdAt: backendQuestion.createdAt,
  createdBy: backendQuestion.createdByName || '시스템',
  totalResponses: backendQuestion.responseCount,
  responseRate:
    backendQuestion.assignmentCount > 0
      ? Math.round((backendQuestion.responseCount / backendQuestion.assignmentCount) * 100)
      : 0,
  avgResponseTime: 0, // Backend doesn't provide this
  lastResponse: '-', // Backend doesn't provide this
});

export const questionService = {
  // 질문 목록 조회
  async getQuestions(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: 'active' | 'inactive';
  }): Promise<PaginatedResponse<Question>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('categoryId', params.category);

    // Backend returns an array
    const backendQuestions = await apiClient.get<BackendQuestion[]>(`/questions?${queryParams.toString()}`);

    const questions = backendQuestions.map(mapBackendQuestion);

    const filteredQuestions = params?.status
      ? questions.filter((q) => q.status === params.status)
      : questions;

    return {
      data: filteredQuestions,
    };
  },

  // 질문 생성
  async createQuestion(payload: CreateQuestionRequest): Promise<Question> {
    const created = await apiClient.post<BackendQuestion>('/questions', payload);
    return mapBackendQuestion(created);
  },

  // 질문 단건 조회
  async getQuestion(id: string): Promise<Question> {
    const data = await apiClient.get<BackendQuestion>(`/questions/${id}`);
    return mapBackendQuestion(data);
  },

  // 질문 수정
  async updateQuestion(id: number | string, payload: CreateQuestionRequest): Promise<Question> {
    const data = await apiClient.put<BackendQuestion>(`/questions/${id}`, payload);
    return mapBackendQuestion(data);
  },

  // 질문 삭제
  async deleteQuestion(id: number | string): Promise<void> {
    await apiClient.delete<void>(`/questions/${id}`);
  },

  // 질문 통계 조회
  async getStatistics<T = any>(): Promise<T> {
    return apiClient.get<T>('/questions/statistics');
  },

  // 질문 유형별 조회
  async getQuestionsByType(type: QuestionType): Promise<Question[]> {
    const list = await apiClient.get<BackendQuestion[]>(`/questions/by-type/${type}`);
    return list.map(mapBackendQuestion);
  },

  // 활성 질문 목록 조회
  async getActiveQuestions(): Promise<Question[]> {
    const list = await apiClient.get<BackendQuestion[]>('/questions/active');
    return list.map(mapBackendQuestion);
  },

  // 질문 상세 조회
  async getQuestionDetail(questionId: number): Promise<QuestionDetail> {
    return await apiClient.get<QuestionDetail>(`/questions/${questionId}`);
  },

  // 질문 수정
  async updateQuestionDetail(questionId: number, payload: UpdateQuestionRequest): Promise<QuestionDetail> {
    return await apiClient.put<QuestionDetail>(`/questions/${questionId}`, payload);
  },

  // 사용자별 질문 응답 통계 조회
  async getUserQuestionStatistics(userId: number | string): Promise<UserQuestionStatistics> {
    return await apiClient.get<UserQuestionStatistics>(`/questions/statistics/${userId}`);
  },
};

