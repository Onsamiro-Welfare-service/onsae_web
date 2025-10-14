// API 응답 타입 정의
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
}

// 사용자 관련 타입
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
  loginCode?: string;
  name: string;
  phone: string;
  birthDate: string;
  // guardianName: string;
  // guardianRelation: string;
  // guardianPhone: string;
  groupIds: number[];
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

// 대시보드 관련 타입
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

