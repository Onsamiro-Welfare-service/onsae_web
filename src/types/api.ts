// API 타입 정의
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
}

// 사용자 타입
export interface User {
  id: string;
  name: string;
  loginCode: string;
  phone: string;
  birthDate: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  groupIds: number[];
  status: 'active' | 'inactive';
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  institutionId: number;
  username: string;
  password: string;
  name: string;
  phone?: string;
  birthDate?: string;
}

export interface CreateUserResponse {
  userId: number;
  username: string;
  name: string;
  institutionId: number;
  institutionName: string;
  createdAt: string;
  message: string;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  status?: 'active' | 'inactive';
}

// 질문 타입 및 옵션 스키마 (백엔드 포맷)
export type QuestionType =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'TEXT'
  | 'SCALE'
  | 'YES_NO'
  | 'DATE'
  | 'TIME';

export type ChoiceOption = { value: string; label: string };

export type SingleMultipleOptions = {
  type: 'single' | 'multiple';
  options: ChoiceOption[];
};

export type ScaleOptions = {
  type: 'scale';
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
};

export type TextOptions = {
  type: 'text';
  maxLength?: number;
  placeholder?: string;
};

export type DateOptions = {
  type: 'date';
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  defaultToday?: boolean;
};

export type TimeOptions = {
  type: 'time';
};

export type QuestionOptions =
  | SingleMultipleOptions
  | ScaleOptions
  | TextOptions
  | DateOptions
  | TimeOptions;

// 질문 생성 요청 (백엔드 포맷)
export interface CreateQuestionRequest {
  title: string;
  content: string;
  questionType: QuestionType;
  categoryId: number | null;
  options?: QuestionOptions | null;
  allowOtherOption?: boolean;
  otherOptionLabel?: string | null;
  otherOptionPlaceholder?: string | null;
  isRequired: boolean;
}

// 프런트에서 사용하는 질문 표시용 타입
export interface Question {
  id: string; // 백엔드 number를 문자열로 매핑
  title: string;
  content: string;
  category: string; // categoryName
  type: QuestionType; // questionType
  priority: string; // 백엔드 미제공 → 기본값 세팅
  status: 'active' | 'inactive'; // isActive
  options: string[]; // 표시용 옵션 라벨 목록
  createdAt: string;
  createdBy: string;
  totalResponses: number;
  responseRate: number;
  avgResponseTime: number;
  lastResponse: string;
}

// 카테고리 타입
export interface Category {
  id: number;
  name: string;
  description: string;
  imagePath: string;
  isActive: boolean;
  institutionId: number;
  institutionName: string;
  createdById: number;
  createdByName: string;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  imagePath?: string;
}

// 응답 타입
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

// 관리자 타입
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

// 시스템 관리자 타입
export interface SystemAdmin {
  id: number;
  email: string;
  name: string;
  role: 'SYSTEM_ADMIN';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin: string | null;
}

export interface SystemAdminLoginRequest {
  email: string;
  password: string;
}

// 복지관 관리자 상세 타입 (시스템 관리자용)
export interface AdminDetail {
  id: number;
  email: string;
  name: string;
  phone: string;
  institutionId: number;
  institutionName: string;
  role: 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  createdAt: string;
  lastLogin: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  rejectionReason: string | null;
}

// 복지관 상세 타입 (시스템 관리자용)
export interface InstitutionDetail {
  id: number;
  name: string;
  businessNumber: string;
  registrationNumber: string;
  address: string;
  phone: string;
  email: string;
  directorName: string;
  website?: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  adminCount?: number;
  userCount?: number;
  status?: 'active' | 'inactive';
  isActive?: boolean;
  timezone?: string;
  locale?: string;
  createdAt: string;
  updatedAt: string;
}

// 관리자 승인/거부 요청
export interface ApproveAdminRequest {
  adminId: number;
  approved: boolean;
  reason?: string;
}

// 관리자 상태 변경 요청
export interface UpdateAdminStatusRequest {
  adminId: number;
  status: 'active' | 'inactive';
}

// 복지관 생성 요청
export interface CreateInstitutionRequest {
  name: string;
  businessNumber: string;
  registrationNumber: string;
  address: string;
  phone: string;
  email: string;
  directorName: string;
  website?: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
}

// 복지관 수정 요청
export interface UpdateInstitutionRequest extends Partial<CreateInstitutionRequest> {
  status?: 'active' | 'inactive';
}

// 업로드 레코드 타입
export type UploadRecord = Response;

// 대시보드 타입
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalUsersChange: ChangeInfo;
  activeUsersChange: ChangeInfo;
  todayResponses: TodayResponseInfo;
  pendingUploads: PendingInfo;
  pendingApprovals: ApprovalInfo;
}

export interface ChangeInfo {
  value: number;
  period: string;
}

export interface TodayResponseInfo {
  total: number;
  assigned: number;
  rate: number;
  change: number;
}

export interface PendingInfo {
  count: number;
  change: number;
}

export interface ApprovalInfo {
  admins: number;
  welfareCenters: number;
}

export interface ResponseTrends {
  period: string;
  data: DailyResponseData[];
  summary: TrendSummary;
}

export interface DailyResponseData {
  date: string;
  totalResponses: number;
  completedResponses: number;
  responseRate: number;
  byCategory: Record<string, number>;
}

export interface TrendSummary {
  avgResponseRate: number;
  totalResponses: number;
  trend: 'up' | 'down' | 'stable';
}

export interface UserGroupsStats {
  groups: GroupInfo[];
  totalMembers: number;
  ungroupedMembers: number;
}

export interface GroupInfo {
  groupId: number;
  groupName: string;
  memberCount: number;
  activeMembers: number;
  assignedQuestions: number;
  completedResponses: number;
  responseRate: number;
  color: string;
}

export interface RecentActivities {
  activities: ActivityInfo[];
  pagination: PaginationInfo;
}

export interface ActivityInfo {
  id: string;
  type: 'response' | 'upload' | 'approval';
  user: UserBasicInfo;
  question?: QuestionBasicInfo;
  upload?: UploadBasicInfo;
  timestamp: string;
  status: string;
  priority: string;
}

export interface UserBasicInfo {
  id: number;
  name: string;
  code: string;
}

export interface QuestionBasicInfo {
  id: number;
  title: string;
}

export interface UploadBasicInfo {
  id: number;
  type: string;
  fileName: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
}

// 응답 상세 타입 (백엔드용)
export interface DetailedResponse {
  responseId: number;
  assignmentId: number;
  questionId: number;
  questionTitle: string;
  questionContent: string;
  questionType: QuestionType;
  userId: number;
  userName: string;
  responseData: Record<string, any>;
  responseText: string | null;
  otherResponse: string | null;
  responseTimeSeconds: number | null;
  submittedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceInfo: Record<string, any> | null;
  isModified: boolean;
  modificationCount: number;
}

// 사용자별 응답 조회 응답 타입
export interface UserResponsesResponse {
  userId: number;
  userName: string;
  totalResponses: number;
  latestResponseAt: string;
  responses: DetailedResponse[];
}

// 최근 응답 조회 응답 타입
export type RecentResponsesResponse = DetailedResponse[];