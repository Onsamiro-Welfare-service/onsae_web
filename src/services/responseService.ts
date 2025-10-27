import { apiClient } from './api';

import type { Response, DetailedResponse, UserResponsesResponse, RecentResponsesResponse } from '../types/api';

// ----------------------------------------------------------------------

// DetailedResponse를 Response 타입으로 변환하는 헬퍼 함수
const mapDetailedResponseToResponse = (detailed: DetailedResponse): Response => {
  // responseData에서 answer나 answers 추출
  const getAnswer = () => {
    if (detailed.responseData.answer) return detailed.responseData.answer;
    if (Array.isArray(detailed.responseData.answers)) return detailed.responseData.answers.join(', ');
    return detailed.responseText || '';
  };

  return {
    id: detailed.responseId.toString(),
    userId: detailed.userId.toString(),
    userName: detailed.userName,
    userCode: detailed.userId.toString().padStart(3, '0'),
    questionId: detailed.questionId.toString(),
    questionTitle: detailed.questionTitle,
    responseData: {
      선택답변: getAnswer(),
      기타의견: detailed.responseData.otherText || null,
    },
    responseSummary: detailed.responseText || getAnswer(),
    responseText: detailed.responseText || getAnswer(),
    submittedAt: detailed.submittedAt,
    responseTime: detailed.responseTimeSeconds || 0,
    status: 'completed' as const,
    detailedResponses: [
      {
        questionId: detailed.questionId.toString(),
        questionTitle: detailed.questionTitle,
        answer: detailed.responseText || getAnswer(),
      },
    ],
  };
};

export const responseService = {
  async getRecentResponses(limit: number = 20): Promise<Response[]> {
    const data = await apiClient.get<RecentResponsesResponse>(`/responses/recent?limit=${limit}`);
    return data.map(mapDetailedResponseToResponse);
  },

  async getResponsesByUser(userId: number): Promise<UserResponsesResponse> {
    return apiClient.get<UserResponsesResponse>(`/responses/user/${userId}`);
  },
};
