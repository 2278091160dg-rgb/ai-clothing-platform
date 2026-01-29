/**
 * Batch Tasks API Route
 * 处理批量任务操作
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTaskRepository } from '@/lib/repositories/task.repository';
import { getN8nService } from '@/lib/services/n8n.service';
import { eventPublisher } from '@/lib/events/handlers';

/**
 * POST /api/tasks/batch - 批量创建任务
 */
export async function POST(req: NextRequest) {
  try {
    // 应用使用访问密码保护，API 跳过 OAuth 认证
    const defaultUserId = 'default-user';

    // 确保默认用户存在
    const { prisma } = await import('@/lib/prisma');
    const existingUser = await prisma.user.findUnique({
      where: { id: defaultUserId },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: defaultUserId,
          name: 'Default User',
          email: 'default@example.com',
          role: 'ADMIN',
        },
      });
    }

    const body = await req.json();
    const { tasks } = body;

    // 验证输入
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: 'tasks must be a non-empty array' }, { status: 400 });
    }

    if (tasks.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 tasks allowed per batch' }, { status: 400 });
    }

    // 生成批次ID
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const taskRepo = getTaskRepository();

    // 创建任务数据
    const taskData = tasks.map((task: any, index: number) => ({
      userId: defaultUserId,
      productImageUrl: task.productImageUrl,
      sceneImageUrl: task.sceneImageUrl,
      prompt: task.prompt,
      aiModel: task.aiModel || 'FLUX.1',
      aspectRatio: task.aspectRatio || '1:1',
      imageCount: task.imageCount || 4,
      quality: task.quality || 'high',
      batchId,
      batchIndex: index,
    }));

    // 批量创建任务
    const result = await taskRepo.createMany(taskData);

    // 查询创建的任务以获取它们的 IDs
    const createdTasks = await taskRepo.findMany({
      userId: defaultUserId,
      batchId,
    });

    // 发布每个任务的事件
    for (const task of createdTasks) {
      eventPublisher.taskCreated({
        taskId: task.id,
        userId: defaultUserId,
        data: {
          productImageUrl: task.productImageUrl || '',
          prompt: task.prompt || '',
          aiModel: task.aiModel,
          aspectRatio: task.aspectRatio,
          imageCount: task.imageCount,
          quality: task.quality,
        },
      });
    }

    // 触发n8n工作流
    try {
      const n8nService = getN8nService();
      await n8nService.triggerBatchGeneration(
        createdTasks.map(task => ({
          taskId: task.id,
          userId: defaultUserId,
          productImageUrl: task.productImageUrl || '',
          sceneImageUrl: task.sceneImageUrl || undefined,
          prompt: task.prompt || '',
          aiModel: task.aiModel,
          aspectRatio: task.aspectRatio,
          imageCount: task.imageCount,
          quality: task.quality,
        }))
      );
    } catch (error) {
      console.error('[API] Failed to trigger batch n8n workflows:', error);
    }

    return NextResponse.json({
      success: true,
      batchId,
      count: result.count,
    });
  } catch (error) {
    console.error('[API] Failed to create batch tasks:', error);
    return NextResponse.json({ error: 'Failed to create batch tasks' }, { status: 500 });
  }
}

/**
 * GET /api/tasks/batch - 查询批次任务
 */
export async function GET(req: NextRequest) {
  try {
    // 应用使用访问密码保护，API 跳过 OAuth 认证
    const defaultUserId = 'default-user';

    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get('batchId');

    if (!batchId) {
      return NextResponse.json({ error: 'batchId is required' }, { status: 400 });
    }

    const taskRepo = getTaskRepository();

    const tasks = await taskRepo.findMany({
      userId: defaultUserId,
      batchId,
    });

    return NextResponse.json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error('[API] Failed to fetch batch tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch batch tasks' }, { status: 500 });
  }
}
