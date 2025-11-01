import { apiClient } from './api';

import type { Response, DetailedResponse, UserResponsesResponse, RecentResponsesResponse } from '../types/api';

// ----------------------------------------------------------------------

// DetailedResponse를 Response 타입으로 변환하는 헬퍼 함수
const mapDetailedResponseToResponse = (detailed: DetailedResponse): Response => {
  // responseData에서 answer나 answers 추출
  const getAnswer = () => {
    if (detailed.responseData.answer) {
      // 단일 선택에서 "기타" 옵션을 선택한 경우 otherText 표시
      if (detailed.responseData.answer === 'other' && detailed.responseData.otherText) {
        return detailed.responseData.otherText;
      }
      return detailed.responseData.answer;
    }
    if (Array.isArray(detailed.responseData.answers)) {
      const answers = detailed.responseData.answers.filter(a => a !== 'other').join(', ');
      const hasOther = detailed.responseData.answers.includes('other');
      if (hasOther && detailed.responseData.otherText) {
        return answers ? `${answers}, ${detailed.responseData.otherText}` : detailed.responseData.otherText;
      }
      return answers;
    }
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
