import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 인증 토큰 및 사용자 타입 확인
  const token = request.cookies.get('accessToken')?.value;
  const userType = request.cookies.get('userType')?.value;

  // 시스템 관리자 페이지 접근 제어
  if (pathname.startsWith('/system-admin')) {
    if (!token) {
      // 로그인하지 않은 경우 시스템 관리자 로그인 페이지로 리다이렉트
      const loginUrl = new URL('/system-admin-login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 시스템 관리자가 아닌 경우 일반 대시보드로 리다이렉트
    if (userType !== 'SYSTEM_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 일반 dashboard 페이지 접근 제어
  if (pathname.startsWith('/dashboard') || pathname === '/') {
    if (!token) {
      // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
      const loginUrl = new URL('/sign-in', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 시스템 관리자는 일반 대시보드 접근 불가
    if (userType === 'SYSTEM_ADMIN') {
      return NextResponse.redirect(new URL('/system-admin', request.url));
    }
  }

  // 로그인 페이지 접근 시 이미 로그인되어 있으면 적절한 대시보드로
  if (pathname === '/sign-in' && token) {
    if (userType === 'SYSTEM_ADMIN') {
      return NextResponse.redirect(new URL('/system-admin', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname === '/system-admin-login' && token) {
    if (userType === 'SYSTEM_ADMIN') {
      return NextResponse.redirect(new URL('/system-admin', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
