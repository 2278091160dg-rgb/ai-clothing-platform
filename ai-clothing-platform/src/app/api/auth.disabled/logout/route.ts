/**
 * 登出 API - 清除访问密码
 */

import { NextRequest, NextResponse } from 'next/server';
import { clearAccessCookie } from '@/lib/access-auth';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: '已退出登录',
  });

  clearAccessCookie(response);

  return response;
}
