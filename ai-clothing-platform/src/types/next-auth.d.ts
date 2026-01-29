/**
 * NextAuth 类型扩展
 */

import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      feishuUserId?: string;
      role: UserRole;
    };
  }

  interface User {
    feishuUserId?: string;
    feishuOpenId?: string;
    feishuUnionId?: string;
    role: UserRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    feishuUserId?: string;
    role: UserRole;
    accessToken?: string;
  }
}
