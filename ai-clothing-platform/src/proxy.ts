/**
 * Next.js Proxy - 访问密码保护
 * Next.js 16 使用 proxy 替代 middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/access-auth';

// 不需要认证的路径
const publicPaths = ['/login', '/api/auth/login'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 如果是公开路径，直接放行
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return undefined;
  }

  // 检查是否已认证
  const isAuth = isAuthenticated(request);

  if (!isAuth) {
    // 未认证，重定向到登录页
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 已认证，继续请求
  return undefined;
}

export const config = {
  // 匹配所有路径除了静态资源
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
