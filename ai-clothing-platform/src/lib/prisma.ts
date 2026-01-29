/**
 * Prisma Client Instance
 * 单例模式，避免开发环境热重载时创建多个实例
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// 开发环境将实例保存到全局，避免热重载时创建多个连接
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
