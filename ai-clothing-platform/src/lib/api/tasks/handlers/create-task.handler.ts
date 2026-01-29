/**
 * Create Task Handler
 * 处理任务创建请求
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTaskRepository } from '@/lib/repositories/task.repository';
import { getN8nService } from '@/lib/services/n8n.service';
import { eventPublisher } from '@/lib/events/handlers';
import { initializeApp } from '@/lib/app-initialization';
import {
  ensureDefaultUser,
  getDefaultUserId,
  validateCreateTaskRequest,
  formatErrorResponse,
} from '../../tasks-api.utils';

export interface CreateTaskRequest {
  productImageUrl: string;
  sceneImageUrl?: string;
  prompt: string;
  aiModel?: string;
  aspectRatio?: string;
  imageCount?: number;
  quality?: string;
  batchId?: string;
  deerApiKey?: string;
  callbackUrl?: string;
}

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
    const {
      productImageUrl,
      sceneImageUrl,
      prompt,
      aiModel = 'Gemini-3-Pro-Image',
      aspectRatio = '3:4',
      imageCount = 4,
      quality = 'high',
      batchId,
      deerApiKey,
      callbackUrl,
    } = body;

    console.log('[API] 请求体:', {
      productImageUrl: productImageUrl?.substring(0, 50) + '...',
      sceneImageUrl: sceneImageUrl?.substring(0, 50) + '...',
      prompt: prompt?.substring(0, 50) + '...',
      aiModel,
      aspectRatio,
      imageCount,
      quality,
      callbackUrl: callbackUrl || '使用默认',
    });

    // 验证请求体
    const validation = validateCreateTaskRequest(body);
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
      productImageUrl,
      sceneImageUrl,
      prompt,
      aiModel,
      aspectRatio,
      imageCount,
      quality,
      batchId,
    });
    console.log('[API] ✅ 任务创建成功:', { id: task.id, status: task.status });

    // 发布任务创建事件（会触发飞书同步）
    try {
      eventPublisher.taskCreated({
        taskId: task.id,
        userId,
        data: {
          productImageUrl,
          prompt,
          aiModel,
          aspectRatio,
          imageCount,
          quality,
        },
      });
      console.log('[API] ✅ 事件发布成功');
    } catch (eventError) {
      console.error('[API] ⚠️  事件发布失败:', eventError);
    }

    // 触发n8n工作流（如果服务可用）
    try {
      const n8nService = getN8nService();
      console.log('[API] N8N 服务初始化成功');

      // 确定回调 URL：优先使用前端配置，否则使用环境变量
      const finalCallbackUrl =
        callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/n8n/callback`;

      await n8nService.triggerGeneration({
        taskId: task.id,
        userId,
        productImageUrl,
        sceneImageUrl,
        prompt,
        aiModel,
        aspectRatio,
        imageCount,
        quality,
        deerApiKey,
        callbackUrl: finalCallbackUrl,
      });
      console.log('[API] ✅ N8N 工作流触发成功，回调URL:', finalCallbackUrl);
    } catch (n8nError) {
      console.error('[API] ⚠️  N8N 工作流触发失败:', n8nError);
    }

    return NextResponse.json({
      success: true,
      task: {
        id: task.id,
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
