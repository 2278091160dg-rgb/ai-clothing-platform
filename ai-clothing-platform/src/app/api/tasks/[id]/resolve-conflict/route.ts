/**
 * Conflict Resolution API Route
 * 处理任务冲突解决的API端点
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTaskRepository } from '@/lib/repositories/task.repository';
import type { ConflictInfo } from '@/lib/repositories/task.repository.types';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/tasks/[id]/resolve-conflict
 * 解决版本冲突
 *
 * Body:
 * {
 *   "strategy": "use_local" | "use_remote" | "merge",
 *   "modifier": "web" | "feishu" | "api"
 * }
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    // 验证必填字段
    if (!body.strategy) {
      return NextResponse.json({ error: 'Missing required field: strategy' }, { status: 400 });
    }

    // 验证策略值
    if (!['use_local', 'use_remote', 'merge'].includes(body.strategy)) {
      return NextResponse.json(
        { error: 'Invalid strategy. Must be: use_local, use_remote, or merge' },
        { status: 400 }
      );
    }

    const strategy = body.strategy as 'use_local' | 'use_remote' | 'merge';
    const modifier = body.modifier || 'web';

    const taskRepo = getTaskRepository();
    const task = await taskRepo.findById(id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // 检查是否有冲突
    if (!task.conflictDetected) {
      return NextResponse.json({ error: 'No conflict detected for this task' }, { status: 400 });
    }

    console.log('[ConflictResolution] Resolving conflict:', {
      taskId: id,
      strategy,
      modifier,
    });

    // 处理不同的冲突解决策略
    switch (strategy) {
      case 'use_local': {
        // 保留本地修改，覆盖远程
        const resolvedTask = await taskRepo.updateWithVersion(
          id,
          {
            conflictDetected: false,
            syncStatus: 'PENDING', // 需要重新同步
          },
          task.version,
          modifier as 'web' | 'feishu' | 'api'
        );

        return NextResponse.json({
          success: true,
          message: 'Conflict resolved using local version',
          data: resolvedTask,
        });
      }

      case 'use_remote': {
        // 使用远程修改，覆盖本地
        const resolvedTask = await taskRepo.resolveConflict(
          id,
          'use_remote',
          modifier as 'web' | 'feishu' | 'api'
        );

        return NextResponse.json({
          success: true,
          message: 'Conflict resolved using remote version',
          data: resolvedTask,
        });
      }

      case 'merge': {
        // 手动合并 - 需要提供合并后的字段值
        if (!body.mergedFields) {
          return NextResponse.json(
            { error: 'mergedFields required for merge strategy' },
            { status: 400 }
          );
        }

        const resolvedTask = await taskRepo.updateWithVersion(
          id,
          {
            ...body.mergedFields,
            conflictDetected: false,
            syncStatus: 'PENDING', // 需要重新同步
          },
          task.version,
          modifier as 'web' | 'feishu' | 'api'
        );

        return NextResponse.json({
          success: true,
          message: 'Conflict resolved with merged values',
          data: resolvedTask,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid strategy' }, { status: 400 });
    }
  } catch (error) {
    console.error('[ConflictResolution] Failed to resolve conflict:', error);

    // 检查是否是版本冲突错误
    if (error instanceof Error && error.name === 'VersionConflictError') {
      // 尝试从 error 中获取 conflict 信息
      const conflictInfo =
        'conflict' in error ? (error as { conflict?: ConflictInfo }).conflict : undefined;
      return NextResponse.json(
        {
          error: 'Version conflict detected during resolution',
          conflict: conflictInfo,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: 'Failed to resolve conflict' }, { status: 500 });
  }
}

/**
 * GET /api/tasks/[id]/resolve-conflict
 * 获取冲突信息（不解决，只是查看）
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const taskRepo = getTaskRepository();
    const task = await taskRepo.findById(id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // 检查是否有冲突
    if (!task.conflictDetected) {
      return NextResponse.json({
        success: true,
        hasConflict: false,
        message: 'No conflict detected for this task',
      });
    }

    // 获取冲突详情
    const conflictInfo: ConflictInfo = {
      taskId: task.id,
      currentVersion: task.version,
      attemptedVersion: task.version,
      currentData: task,
      attemptedData: {},
      conflicts: [], // 需要从版本历史中获取实际冲突的字段
      localVersion: task.version,
      lastModifiedBy: task.lastModifiedBy || 'unknown',
      lastModifiedAt: task.lastModifiedAt,
    };

    return NextResponse.json({
      success: true,
      hasConflict: true,
      data: conflictInfo,
    });
  } catch (error) {
    console.error('[ConflictResolution] Failed to get conflict info:', error);
    return NextResponse.json({ error: 'Failed to get conflict info' }, { status: 500 });
  }
}
