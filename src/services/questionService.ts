import { apiClient } from './api';

import type {
  Question,
  PaginatedResponse,
  CreateQuestionRequest,
  QuestionOptions,
  QuestionType,
} from '../types/api';
import { _questions } from '../_mock/_data';

const USE_MOCK_DATA = false; // API connected
const MOCK_LATENCY = 200;

type MockQuestion = (typeof _questions)[number];

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

const mapMockQuestion = (item: MockQuestion): Question => ({
  ...(item as any),
  status: (item as any).status === 'active' ? 'active' : 'inactive',
});

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
    if (!USE_MOCK_DATA) {
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
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;

    const filtered = ([_questions] as any[] as MockQuestion[]).filter((question: any) => {
      const matchCategory = params?.category ? (question as any).category === params.category : true;
      const matchStatus = params?.status ? (question as any).status === params.status : true;
      return matchCategory && matchStatus;
    });

    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit).map((item) => mapMockQuestion(item as any));

    const response: PaginatedResponse<Question> = {
      data: paginated,
    };

    return new Promise((resolve) => setTimeout(() => resolve(response), MOCK_LATENCY));
  },

  // 질문 생성
  async createQuestion(payload: CreateQuestionRequest): Promise<Question> {
    if (!USE_MOCK_DATA) {
      const created = await apiClient.post<BackendQuestion>('/questions', payload);
      return mapBackendQuestion(created);
    }

    const normalizedOptions: string[] = [];
    const now = new Date();

    const newQuestion: Question = {
      id: `Q${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      title: payload.title,
      content: payload.content,
      category: '-',
      type: payload.questionType,
      priority: '중간',
      status: 'active',
      options: normalizedOptions,
      createdAt: now.toISOString().slice(0, 10),
      createdBy: '시스템',
      totalResponses: 0,
      responseRate: 0,
      avgResponseTime: 0,
      lastResponse: '-',
    };

    (_questions as unknown as Question[]).unshift(newQuestion);

    return new Promise((resolve) => setTimeout(() => resolve(newQuestion), MOCK_LATENCY));
  },

  // 질문 단건 조회
  async getQuestion(id: string): Promise<Question> {
    if (!USE_MOCK_DATA) {
      const data = await apiClient.get<BackendQuestion>(`/questions/${id}`);
      return mapBackendQuestion(data);
    }

    const question = (_questions as any[]).find((item) => (item as any).id === id);

    if (!question) {
      throw new Error('Question not found');
    }

    return new Promise((resolve) => setTimeout(() => resolve(mapMockQuestion(question as any)), MOCK_LATENCY));
  },

  // 질문 수정
  async updateQuestion(id: number | string, payload: CreateQuestionRequest): Promise<Question> {
    if (!USE_MOCK_DATA) {
      const data = await apiClient.put<BackendQuestion>(`/questions/${id}`, payload);
      return mapBackendQuestion(data);
    }
    const existing = (_questions as any[]).find((q) => (q as any).id === id);
    if (!existing) throw new Error('Question not found');
    return mapMockQuestion(existing as any);
  },

  // 질문 삭제
  async deleteQuestion(id: number | string): Promise<void> {
    if (!USE_MOCK_DATA) {
      await apiClient.delete<void>(`/questions/${id}`);
      return;
    }
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
};

