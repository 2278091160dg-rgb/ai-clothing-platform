/**
 * SSE API Route
 * 实时事件推送端点
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSSEStream } from '@/lib/services/realtime.service';

export async function GET(_request: Request) {
  try {
    // 应用使用访问密码保护，SSE 使用默认用户ID
    const defaultUserId = 'default-user';

    // 创建SSE流
    return createSSEStream(defaultUserId);
  } catch (error) {
    console.error('[API] SSE stream error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
