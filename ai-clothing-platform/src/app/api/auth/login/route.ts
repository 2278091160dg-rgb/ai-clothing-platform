/**
 * Login API Route
 * 处理访问密码验证
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAccessToken, setAccessCookie } from '@/lib/access-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: '密码不能为空' }, { status: 400 });
    }

    // 验证密码
    const isValid = validateAccessToken(password);

    if (!isValid) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 });
    }

    // 密码正确，设置 cookie
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
    });

    setAccessCookie(response, password);

    return response;
  } catch (error) {
    console.error('[API] Login error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
