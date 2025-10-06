// API 응답 타입 정의
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 사용자 관련 타입
export interface User {
  id: string;
  name: string;
  code: string;
  phoneNumber: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  group: string;
  status: 'active' | 'inactive';
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  code?: string;
  name: string;
  phoneNumber: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  group: string;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  status?: 'active' | 'inactive';
}

// 질문 관련 타입
export interface CreateQuestionRequest {
  title: string;
  content: string;
  category: string;
  type: string;
  priority: string;
  options: string[];
}
export interface Question {
  id: string;
  title: string;
  content: string;
  category: string;
  type: string;
  priority: string;
  status: 'active' | 'inactive';
  options: string[];
  createdAt: string;
  createdBy: string;
  totalResponses: number;
  responseRate: number;
  avgResponseTime: number;
  lastResponse: string;
}

// 응답 관련 타입
export interface Response {
  id: string;
  userId: string;
  userName: string;
  userCode: string;
  questionId: string;
  questionTitle: string;
  responseData: {
    선택답변: string | string[] | null;
    기타의견: string | null;
  };
  responseSummary: string;
  responseText: string;
  submittedAt: string;
  responseTime: number;
  status: 'completed' | 'incomplete';
  detailedResponses: Array<{
    questionId: string;
    questionTitle: string;
    answer: string;
  }>;
}

// 관리자 관련 타입
export interface Admin {
  id: string;
  name: string;
  welfareCenter: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

export interface WelfareCenter {
  id: string;
  name: string;
  address: string;
  admin: string;
  userCount: number;
  status: 'active' | 'inactive';
  registeredAt: string;
}

// 업로드 관련 타입
export type UploadRecord = Response;

