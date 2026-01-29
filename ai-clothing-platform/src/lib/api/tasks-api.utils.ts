/**
 * Tasks API 工具函数
 */

import { prisma } from '@/lib/prisma';

const DEFAULT_USER_ID = 'default-user';

/**
 * 确保默认用户存在
 */
export async function ensureDefaultUser(): Promise<void> {
  const existingUser = await prisma.user.findUnique({
    where: { id: DEFAULT_USER_ID },
  });

  if (!existingUser) {
    console.log('[API] Creating default user...');
    await prisma.user.create({
      data: {
        id: DEFAULT_USER_ID,
        name: 'Default User',
        email: 'default@example.com',
        role: 'ADMIN',
      },
    });
    console.log('[API] ✅ Default user created');
  }
}

/**
 * 获取默认用户 ID
 */
export function getDefaultUserId(): string {
  return DEFAULT_USER_ID;
}

/**
 * 验证任务创建请求体
 */
export interface CreateTaskRequestBody {
  productImageUrl: string;
  sceneImageUrl?: string;
  prompt: string;
  aiModel?: string;
  aspectRatio?: string;
  imageCount?: number;
  quality?: string;
  batchId?: string;
  deerApiKey?: string;
  callbackUrl?: string;
}

export function validateCreateTaskRequest(
  body: Partial<CreateTaskRequestBody>
): { valid: boolean; error?: string } {
  if (!body.productImageUrl || !body.prompt) {
    return { valid: false, error: 'Missing required fields: productImageUrl, prompt' };
  }

  if (body.imageCount !== undefined) {
    const count = Number(body.imageCount);
    if (isNaN(count) || count < 1 || count > 8) {
      return { valid: false, error: 'imageCount must be between 1 and 8' };
    }
  }

  return { valid: true };
}

/**
 * 解析查询参数
 */
export interface TaskQueryParams {
  status?: string;
  batchId?: string;
  page?: number;
  limit?: number;
}

export function parseTaskQueryParams(searchParams: URLSearchParams): TaskQueryParams {
  return {
    status: searchParams.get('status') || undefined,
    batchId: searchParams.get('batchId') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
  };
}

/**
 * 格式化错误响应
 */
export function formatErrorResponse(error: unknown, includeStack = false) {
  const errorObj =
    error instanceof Error ? error : new Error(String(error));

  const errorResponse = {
    error: errorObj.message,
    type: errorObj.constructor.name,
    ...(includeStack && process.env.NODE_ENV === 'development' && {
      stack: errorObj.stack,
    }),
  };

  console.log('[API] 返回错误响应:', errorResponse);
  return errorResponse;
}
