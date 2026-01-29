/**
 * Authentication Stub
 * This app uses access password protection, not NextAuth
 * 原应用使用访问密码保护，不需要 NextAuth OAuth 认证
 */

export const authOptions = {
  providers: [],
};

// Type stub for compatibility
export function getServerSession() {
  return null;
}
