/**
 * Task Detail API Route
 * 处理单个任务的查询、更新和删除
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTaskRepository } from '@/lib/repositories/task.repository';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/tasks/[id] - 获取任务详情
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const taskRepo = getTaskRepository();

    const task = await taskRepo.findById(id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('[API] Failed to fetch task:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

/**
 * PATCH /api/tasks/[id] - 更新任务
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const taskRepo = getTaskRepository();
    const task = await taskRepo.findById(id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // 只允许更新特定字段
    const allowedUpdates = ['prompt', 'aiModel', 'aspectRatio', 'imageCount', 'quality'] as const;

    type TaskUpdates = {
      [K in (typeof allowedUpdates)[number]]?: string | number;
    };

    const updates: TaskUpdates = {};
    for (const key of allowedUpdates) {
      if (key in body) {
        updates[key] = body[key];
      }
    }

    // 只允许在PENDING状态下更新
    if (task.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cannot update task that is already processing' },
        { status: 400 }
      );
    }

    const updatedTask = await taskRepo.update(id, updates);

    return NextResponse.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    console.error('[API] Failed to update task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

/**
 * DELETE /api/tasks/[id] - 删除任务
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const taskRepo = getTaskRepository();

    const task = await taskRepo.findById(id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await taskRepo.delete(id);

    // 发布删除事件
    const { eventPublisher } = await import('@/lib/events/handlers');
    eventPublisher.taskFailed({
      taskId: id,
      userId: task.userId,
      errorMessage: 'Task deleted by user',
    });

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('[API] Failed to delete task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
