/**
 * Get History API Route
 * 获取最近的任务记录
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRecordStatus } from '@/lib/services/lark.service';

/**
 * GET /api/get-history - 获取最近的任务历史
 * 注意：飞书API不直接支持获取多条记录，这里通过返回最近的任务ID列表来模拟
 * 实际使用中，建议在飞书表格中维护一个"最近任务"视图或使用缓存
 */
export async function GET(req: NextRequest) {
  try {
    // 从环境变量获取配置的记录ID列表（如果有的话）
    // 这里返回一个示例实现，实际应该从飞书表格查询
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // 由于飞书API限制，这里返回空列表
    // 实际应该在前端维护一个本地存储的记录ID列表
    return NextResponse.json({
      code: 0,
      data: {
        records: [],
        message: '请使用本地存储维护历史记录ID列表',
      },
    });
  } catch (error) {
    console.error('[API] Failed to get history:', error);
    return NextResponse.json(
      {
        code: -1,
        msg: '获取历史失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
