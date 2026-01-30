/**
 * 简单访问密码认证
 * 用于保护公开部署的应用
 */

import type { NextResponse } from 'next/server';

const SESSION_COOKIE = 'access_session';

/**
 * 验证访问密码是否正确 */
export function validateAccessToken(token: string): boolean {
  const validToken = process.env.ACCESS_TOKEN;
  if (!validToken) {
    console.warn('[AccessAuth] ACCESS_TOKEN not configured in environment');
    return false;
  }
  return token === validToken;
}

/**
 * 设置认证 Cookie */
export function setAccessCookie(response: NextResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';

  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

/**
 * 清除认证 Cookie */
export function clearAccessCookie(response: NextResponse): void {
  response.cookies.delete(SESSION_COOKIE);
}

/**
 * 检查请求是否已认证 */
export function isAuthenticated(request: Request): boolean {
  try {
    const cookieHeader = request.headers.get('cookie') || '';

    // 处理空 cookie
    if (!cookieHeader || cookieHeader.trim() === '') {
      return false;
    }

    // 安全地解析 cookies
    const cookies: Record<string, string> = {};
    cookieHeader.split('; ').forEach(cookie => {
      const [name, value] = cookie.split('=');
      if (name && value) {
        cookies[name] = value;
      }
    });

    const sessionToken = cookies[SESSION_COOKIE];
    if (!sessionToken) {
      return false;
    }

    // URL 解码 cookie 值（例如：DG%2BAB2026 → DG+AB2026）
    const decodedToken = decodeURIComponent(sessionToken);

    return validateAccessToken(decodedToken);
  } catch (error) {
    console.error('[AccessAuth] Error checking authentication:', error);
    return false;
  }
}

/**
 * 从请求中获取认证状态（服务端） */
export function getAuthStatus(request: Request): boolean {
  return isAuthenticated(request);
}
