/**
 * 登出 API - 清除访问密码
 */

import { NextRequest, NextResponse } from 'next/server';
import { clearAccessCookie } from '@/lib/access-auth';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: '已退出登录',
  });

  clearAccessCookie(response);

  return response;
}
