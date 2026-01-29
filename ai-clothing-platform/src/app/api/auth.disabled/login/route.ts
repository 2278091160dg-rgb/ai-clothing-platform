/**
 * 登录 API - 验证访问密码
 */

import { NextRequest, NextResponse } from "next/server"
import { validateAccessToken, setAccessCookie } from "@/lib/access-auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { success: false, error: "请输入访问密码" },
        { status: 400 }
      )
    }

    // 验证密码
    const isValid = validateAccessToken(password)

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "密码错误" },
        { status: 401 }
      )
    }

    // 创建响应并设置 Cookie
    const response = NextResponse.json({
      success: true,
      message: "登录成功",
    })

    setAccessCookie(response, password)

    return response
  } catch (error) {
    console.error("[Auth] Login error:", error)
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    )
  }
}
