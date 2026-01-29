/**
 * NextAuth API Route
 * 处理所有认证相关的HTTP请求
 */

import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
