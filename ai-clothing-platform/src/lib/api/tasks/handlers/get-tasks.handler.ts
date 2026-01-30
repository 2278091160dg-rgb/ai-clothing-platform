/**
 * Get Tasks Handler
 * 处理任务查询请求
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTaskRepository } from '@/lib/repositories/task.repository';
import { ensureDefaultUser, getDefaultUserId, parseTaskQueryParams } from '../../tasks-api.utils';
import { TaskStatus } from '@prisma/client';

/**
 * 处理 GET /api/tasks 请求
 */
export async function handleGetTasks(req: NextRequest) {
  try {
    // 确保默认用户存在
    await ensureDefaultUser();
    const userId = getDefaultUserId();

    // 解析查询参数
    const { searchParams } = new URL(req.url);
    const params = parseTaskQueryParams(searchParams);

    // 提供默认值
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    const taskRepo = getTaskRepository();

    // 查询任务
    const tasks = await taskRepo.findMany(
      {
        userId,
        status: params.status as TaskStatus | undefined,
        batchId: params.batchId,
      },
      {
        skip: (page - 1) * limit,
        take: limit,
      }
    );

    // 获取总数
    const total = await taskRepo.count({
      userId,
      status: params.status as TaskStatus | undefined,
      batchId: params.batchId,
    });

    // 获取统计信息
    const stats = await taskRepo.getUserStats(userId);

    return NextResponse.json({
      success: true,
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error('[API] Failed to fetch tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
