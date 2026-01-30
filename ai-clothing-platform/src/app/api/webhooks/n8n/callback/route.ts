/**
 * N8n Callback Webhook
 * 接收n8n工作流的回调
 */

import { NextRequest, NextResponse } from 'next/server';
import { getN8nService } from '@/lib/services/n8n.service';
import { initializeApp } from '@/lib/app-initialization';

/**
 * N8N回调体接口（原始格式，可能缺少某些字段）
 * N8N工作流可能不发送所有字段，需要适配层处理
 */
interface N8NCallbackBody {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  resultImageUrls?: string | string[]; // 可能是JSON字符串或数组
  resultImageTokens?: string | string[]; // 可选字段，N8N可能不发送
  error?: string; // 可选字段，N8N可能不发送
  progress?: number;
  [key: string]: string | number | string[] | undefined; // 允许额外字段
}

/**
 * 适配后的回调体接口（与handleCallback期望的格式一致）
 */
interface AdaptedCallbackBody {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  resultImageUrls: string[];
  resultImageTokens?: string[];
  error?: string;
  progress: number;
}

/**
 * 解析resultImageUrls字段（处理JSON字符串或数组格式）
 */
function parseImageUrls(urls: string | string[] | undefined): string[] {
  if (!urls) return [];

  // 如果是数组，直接返回
  if (Array.isArray(urls)) {
    return urls.filter(url => typeof url === 'string' && url.length > 0);
  }

  // 如果是字符串，尝试解析为JSON
  if (typeof urls === 'string') {
    try {
      const parsed = JSON.parse(urls);
      if (Array.isArray(parsed)) {
        return parsed.filter((url: unknown) => typeof url === 'string' && url.length > 0);
      }
      // 如果解析结果不是数组，将原字符串作为单个URL
      return [urls];
    } catch {
      // JSON解析失败，将原字符串作为单个URL
      return [urls];
    }
  }

  return [];
}

/**
 * 解析resultImageTokens字段（处理JSON字符串或数组格式）
 */
function parseImageTokens(tokens: string | string[] | undefined): string[] | null {
  if (!tokens) return null;

  // 如果是数组，直接返回
  if (Array.isArray(tokens)) {
    return tokens.filter(token => typeof token === 'string' && token.length > 0);
  }

  // 如果是字符串，尝试解析为JSON
  if (typeof tokens === 'string') {
    try {
      const parsed = JSON.parse(tokens);
      if (Array.isArray(parsed)) {
        return parsed.filter((token: unknown) => typeof token === 'string' && token.length > 0);
      }
      // 如果解析结果不是数组，将原字符串作为单个token
      return [tokens];
    } catch {
      // JSON解析失败，将原字符串作为单个token
      return [tokens];
    }
  }

  return null;
}

/**
 * 适配N8N回调格式
 * 将N8N可能发送的各种格式转换为统一的格式
 */
function adaptN8NCallback(body: N8NCallbackBody): AdaptedCallbackBody {
  const result: AdaptedCallbackBody = {
    taskId: body.taskId,
    status: body.status,
    progress: body.progress ?? 0,
    resultImageUrls: parseImageUrls(body.resultImageUrls),
  };

  // 只有在有值时才添加这些字段
  const tokens = parseImageTokens(body.resultImageTokens);
  if (tokens) {
    result.resultImageTokens = tokens;
  }

  if (body.error) {
    result.error = body.error;
  }

  return result;
}

/**
 * POST /api/webhooks/n8n/callback
 * n8n工作流完成后回调此端点
 */
export async function POST(req: NextRequest) {
  try {
    // 初始化应用（确保飞书监听器已注册）
    initializeApp();

    // 验证请求来源（使用API Key）
    const apiKey = req.headers.get('x-n8n-api-key');
    if (apiKey !== process.env.N8N_API_KEY) {
      console.warn('[Webhook] Invalid API key');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as N8NCallbackBody;

    // 验证必填字段
    if (!body.taskId || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields: taskId, status' },
        { status: 400 }
      );
    }

    console.log('[Webhook] Received n8n callback (raw):', {
      taskId: body.taskId,
      status: body.status,
      progress: body.progress,
      hasResultUrls: !!body.resultImageUrls,
      hasResultTokens: !!body.resultImageTokens,
      hasError: !!body.error,
    });

    // 适配N8N回调格式
    const adaptedBody = adaptN8NCallback(body);

    console.log('[Webhook] Adapted n8n callback:', {
      taskId: adaptedBody.taskId,
      status: adaptedBody.status,
      progress: adaptedBody.progress,
      urlsCount: adaptedBody.resultImageUrls.length,
      tokensCount: adaptedBody.resultImageTokens?.length ?? 0,
      error: adaptedBody.error,
    });

    const n8nService = getN8nService();
    await n8nService.handleCallback(adaptedBody);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Webhook] Failed to handle n8n callback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to process callback', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/n8n/callback
 * 健康检查端点
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'n8n-callback-webhook',
    timestamp: new Date().toISOString(),
  });
}
