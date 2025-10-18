/**
 * 인증 관련 유틸리티 함수
 */

const AUTH_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_INFO_KEY = 'userInfo';

/**
 * 액세스 토큰 가져오기
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * 액세스 토큰 저장
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);

  // 쿠키에도 저장 (middleware에서 접근 가능하도록)
  document.cookie = `accessToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7일
}

/**
 * 리프레시 토큰 가져오기
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * 리프레시 토큰 저장
 */
export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

/**
 * 사용자 정보 가져오기
 */
export function getUserInfo(): any | null {
  if (typeof window === 'undefined') return null;
  const userInfo = localStorage.getItem(USER_INFO_KEY);
  return userInfo ? JSON.parse(userInfo) : null;
}

/**
 * 사용자 정보 저장
 */
export function setUserInfo(userInfo: any): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
}

/**
 * 모든 인증 정보 삭제
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);

  // 쿠키에서도 삭제
  document.cookie = 'accessToken=; path=/; max-age=0';
  document.cookie = 'userType=; path=/; max-age=0';
}

/**
 * 로그인 상태 확인
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Authorization 헤더 생성
 */
export function getAuthHeader(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
