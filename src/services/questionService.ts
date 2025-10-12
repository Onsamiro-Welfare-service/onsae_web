import { apiClient } from './api';

import type { Question, PaginatedResponse, CreateQuestionRequest } from '../types/api';
import { _questions } from '../_mock/_data';

const USE_MOCK_DATA = false; // API connected
const MOCK_LATENCY = 200;

type MockQuestion = (typeof _questions)[number];

// Backend API response type
interface BackendQuestion {
  id: number;
  title: string;
  content: string;
  questionType: string;
  categoryId: number | null;
  categoryName: string | null;
  options: Record<string, any> | null;
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
  ...item,
  status: item.status === 'active' ? 'active' : 'inactive',
});

// Map backend question response to frontend format
const mapBackendQuestion = (backendQuestion: BackendQuestion): Question => ({
  id: backendQuestion.id.toString(),
  title: backendQuestion.title,
  content: backendQuestion.content,
  category: backendQuestion.categoryName || '기타',
  type: backendQuestion.questionType,
  priority: '중간', // Backend doesn't provide priority
  status: backendQuestion.isActive ? 'active' : 'inactive',
  options: backendQuestion.options ? Object.keys(backendQuestion.options) : [],
  createdAt: backendQuestion.createdAt,
  createdBy: backendQuestion.createdByName || '시스템',
  totalResponses: backendQuestion.responseCount,
  responseRate: backendQuestion.assignmentCount > 0
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
      // Backend doesn't filter by status in the same way, it returns all questions

      // Backend returns an array, not a paginated response
      const backendQuestions = await apiClient.get<BackendQuestion[]>(`/questions?${queryParams.toString()}`);

      // Map backend response to frontend format
      const questions = backendQuestions.map(mapBackendQuestion);

      // Filter by status if requested
      const filteredQuestions = params?.status
        ? questions.filter((q) => q.status === params.status)
        : questions;

      // Convert array response to paginated format
      return {
        data: filteredQuestions,
        pagination: {
          page: params?.page ?? 1,
          limit: params?.limit ?? filteredQuestions.length,
          total: filteredQuestions.length,
          totalPages: 1,
        },
      };
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;

    const filtered = _questions.filter((question) => {
      const matchCategory = params?.category ? question.category === params.category : true;
      const matchStatus = params?.status ? question.status === params.status : true;
      return matchCategory && matchStatus;
    });

    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit).map((item) => mapMockQuestion(item));

    const response: PaginatedResponse<Question> = {
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

  // 질문 생성
  async createQuestion(payload: CreateQuestionRequest): Promise<Question> {
    if (!USE_MOCK_DATA) {
      // TODO: Replace with real API call when backend is ready
      return apiClient.post<Question>('/questions', payload);
    }

    const normalizedOptions = payload.options.map((option) => option.trim()).filter(Boolean);
    const now = new Date();

    const newQuestion: Question = {
      id: `Q${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      title: payload.title,
      content: payload.content,
      category: payload.category || '기타',
      type: payload.type,
      priority: payload.priority,
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

  // 질문 상세 조회
  async getQuestion(id: string): Promise<Question> {
    if (!USE_MOCK_DATA) {
      // TODO: Replace with real API call when backend is ready
      return apiClient.get<Question>(`/questions/${id}`);
    }

    const question = _questions.find((item) => item.id === id);

    if (!question) {
      throw new Error('Question not found');
    }

    return new Promise((resolve) => setTimeout(() => resolve(mapMockQuestion(question)), MOCK_LATENCY));
  },
};
