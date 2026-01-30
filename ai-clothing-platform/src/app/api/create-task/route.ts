/**
 * Create Task API Route
 * 创建任务并触发 N8N 工作流
 */

import { NextRequest, NextResponse } from 'next/server';
import { createBitableRecord, triggerN8nWebhook } from '@/lib/services/lark.service';

/**
 * POST /api/create-task - 创建任务
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      product_token,
      scene_token,
      prompt,
      negative_prompt,
      ratio,
      model,
    } = body as {
      product_token: string;
      scene_token?: string;
      prompt: string;
      negative_prompt?: string;
      ratio: string;
      model: string;
    };

    // 参数验证
    if (!product_token || !prompt || !ratio || !model) {
      return NextResponse.json(
        { code: -1, msg: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 创建多维表格记录
    const { recordId } = await createBitableRecord({
      productToken: product_token,
      sceneToken: scene_token,
      prompt,
      negativePrompt: negative_prompt,
      ratio,
      model,
    });

    // 触发 N8N 工作流
    const baseId = process.env.NEXT_PUBLIC_LARK_BASE_ID || '';
    const tableId = process.env.NEXT_PUBLIC_LARK_TABLE_ID || '';

    await triggerN8nWebhook({
      recordId,
      appToken: baseId,
      tableId,
    });

    return NextResponse.json({
      code: 0,
      data: { record_id: recordId },
    });
  } catch (error) {
    console.error('[API] Failed to create task:', error);
    return NextResponse.json(
      {
        code: -1,
        msg: '创建任务失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/create-task - 健康检查
 */
export async function GET() {
  return NextResponse.json({
    code: 0,
    service: 'create-task-api',
    version: '1.0',
    description: '创建任务 API - 飞书 Bitable + N8N',
  });
}
