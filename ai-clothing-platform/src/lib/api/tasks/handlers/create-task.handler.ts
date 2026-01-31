/**
 * Create Task Handler
 * 处理任务创建请求 - 支持4种生成模式
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTaskRepository } from '@/lib/repositories/task.repository';
import { getN8nService } from '@/lib/services/n8n.service';
import { eventPublisher } from '@/lib/events/handlers';
import { initializeApp } from '@/lib/app-initialization';
import { ensureDefaultUser, getDefaultUserId, formatErrorResponse } from '../../tasks-api.utils';
import { validateRequestByMode } from '../utils/task-validation';
import { buildPromptByMode } from '../utils/task-prompt-builder';
import type { CreateTaskRequest, GenerationMode } from '../types/create-task.types';

// 导出类型供外部使用
export type { CreateTaskRequest, GenerationMode };

/**
 * 处理 POST /api/tasks 请求
 */
export async function handleCreateTask(req: NextRequest) {
  try {
    // 初始化应用（确保飞书监听器已注册）
    initializeApp();

    console.log('=== [API] 收到任务创建请求 ===');

    // 确保默认用户存在
    await ensureDefaultUser();
    const userId = getDefaultUserId();

    // 解析请求体
    console.log('[API] 解析请求体...');
    const body = await req.json();
    const { mode, aiModel = 'Gemini-3-Pro-Image', aspectRatio = '3:4' } = body;

    console.log('[API] 生成模式:', mode);

    // 验证mode参数
    if (!mode || !['scene', 'tryon', 'wear', 'combine'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid or missing mode parameter' }, { status: 400 });
    }

    // 根据mode验证必填字段
    const validation = validateRequestByMode(body);
    if (!validation.valid) {
      console.log('[API] ❌', validation.error);
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    console.log('[API] ✅ 请求验证通过');
    console.log('[API] 初始化 TaskRepository...');
    const taskRepo = getTaskRepository();
    console.log('[API] ✅ TaskRepository 初始化成功');

    console.log('[API] 创建数据库记录...');
    // 创建任务记录
    const task = await taskRepo.create({
      userId,
      mode,
      // 存储所有模式相关的字段
      ...body,
      aiModel,
      aspectRatio,
      imageCount: body.imageCount || 4,
      quality: body.quality || 'high',
      batchId: body.batchId,
    });
    console.log('[API] ✅ 任务创建成功:', { id: task.id, mode, status: task.status });

    // 发布任务创建事件
    try {
      eventPublisher.taskCreated({
        taskId: task.id,
        userId,
        data: { mode, ...body },
      });
      console.log('[API] ✅ 事件发布成功');
    } catch (eventError) {
      console.error('[API] ⚠️  事件发布失败:', eventError);
    }

    // 构建提示词
    const finalPrompt = buildPromptByMode(body);
    console.log('[API] 提示词长度:', finalPrompt.length);

    // 触发N8N工作流
    try {
      const n8nService = getN8nService();
      console.log('[API] N8N 服务初始化成功');

      // 确定回调 URL
      const finalCallbackUrl =
        body.callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/n8n/callback`;

      await n8nService.triggerGeneration({
        taskId: task.id,
        userId,
        mode,
        prompt: finalPrompt,
        // 传递所有原始参数
        ...body,
        aiModel,
        aspectRatio,
        imageCount: body.imageCount || 4,
        quality: body.quality || 'high',
        deerApiKey: body.deerApiKey,
        callbackUrl: finalCallbackUrl,
      });
      console.log('[API] ✅ N8N 工作流触发成功，mode:', mode);
    } catch (n8nError) {
      console.error('[API] ⚠️  N8N 工作流触发失败:', n8nError);
    }

    return NextResponse.json({
      success: true,
      task: {
        id: task.id,
        mode,
        status: task.status,
        createdAt: task.createdAt,
      },
    });
  } catch (error) {
    console.error('=== [API] ❌ 任务创建失败 ===');
    const errorResponse = formatErrorResponse(error, true);
    console.log('[API] 返回错误响应:', errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
