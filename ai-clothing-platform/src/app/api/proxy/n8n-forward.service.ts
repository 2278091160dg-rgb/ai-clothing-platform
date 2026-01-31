/**
 * N8N Forward Service
 * N8N转发服务
 */

import type { N8NWebhookPayload } from './proxy-types';
import { NextResponse } from 'next/server';

/**
 * 转发请求给N8N工作流
 */
export async function forwardToN8N(
  n8nPayload: N8NWebhookPayload
  // recordId: string (保留用于未来可能需要的记录追踪)
): Promise<{ success: boolean; n8nResponse: unknown; error?: string }> {
  console.log('转发请求给 N8N...');

  const n8nUrl = process.env.N8N_WEBHOOK_URL;
  if (!n8nUrl) {
    throw new Error('❌ 环境变量 N8N_WEBHOOK_URL 未配置');
  }

  console.log('  - N8N Webhook URL:', n8nUrl);
  console.log('  - 发送给 N8N 的数据:', n8nPayload);

  const n8nResponse = await fetch(n8nUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(n8nPayload),
  });

  const n8nResponseText = await n8nResponse.text();
  console.log('  - N8N 响应状态:', n8nResponse.status);
  console.log('  - N8N 响应内容:', n8nResponseText);

  if (!n8nResponse.ok) {
    console.error(`❌ N8N 返回错误 [${n8nResponse.status}]:`, n8nResponseText);
    return {
      success: false,
      n8nResponse: null,
      error: `N8N Error: ${n8nResponse.status} - ${n8nResponseText}`,
    };
  }

  // 解析 N8N 响应
  let n8nData;
  try {
    n8nData = JSON.parse(n8nResponseText);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_e) {
    n8nData = { message: n8nResponseText };
  }

  console.log('✅ N8N 请求成功');
  return { success: true, n8nResponse: n8nData };
}

/**
 * 创建N8N错误响应
 */
export function createN8NErrorResponse(
  n8nResponseStatus: number,
  n8nResponseText: string,
  recordId: string
) {
  return NextResponse.json(
    {
      error: `N8N Error: ${n8nResponseStatus}`,
      details: n8nResponseText,
      feishu_record_id: recordId,
    },
    { status: n8nResponseStatus }
  );
}
