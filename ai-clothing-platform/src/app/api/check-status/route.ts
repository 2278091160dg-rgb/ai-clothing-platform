/**
 * Check Status API Route
 * 查询任务状态
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRecordStatus } from '@/lib/services/lark.service';

/**
 * GET /api/check-status - 查询任务状态
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const recordId = searchParams.get('record_id');

    if (!recordId) {
      return NextResponse.json({ code: -1, msg: '缺少 record_id 参数' }, { status: 400 });
    }

    const { status, resultUrl } = await getRecordStatus(recordId);

    return NextResponse.json({
      code: 0,
      data: {
        status,
        result_url: resultUrl,
      },
    });
  } catch (error) {
    console.error('[API] Failed to check status:', error);
    return NextResponse.json(
      {
        code: -1,
        msg: '查询状态失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/check-status - 健康检查
 */
export async function POST() {
  return NextResponse.json({
    code: 0,
    service: 'check-status-api',
    version: '1.0',
    description: '查询任务状态 API - 飞书 Bitable',
  });
}
