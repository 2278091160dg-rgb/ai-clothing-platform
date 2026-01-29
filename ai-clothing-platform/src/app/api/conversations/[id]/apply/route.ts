/**
 * PUT /api/conversations/[id]/apply
 * 应用最终提示词并创建任务生图
 */

import { NextRequest, NextResponse } from 'next/server';
import { getConversationRepository } from '@/lib/repositories/conversation.repository';
import { getTaskRepository } from '@/lib/repositories/task.repository';
import { getN8nService } from '@/lib/services/n8n.service';
import { initializeApp } from '@/lib/app-initialization';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    // 验证必填字段
    if (!body.finalPrompt) {
      return NextResponse.json(
        { error: 'Missing required field: finalPrompt' },
        { status: 400 }
      );
    }

    // 初始化应用
    initializeApp();

    const conversationRepo = getConversationRepository();
    const conversation = await conversationRepo.findById(id);

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // 1. 更新对话状态
    await conversationRepo.applyFinalPrompt(id, body.finalPrompt);

    // 2. 通过recordId查找对应的飞书记录信息
    // 这里需要从飞书获取记录信息来创建任务
    const taskData = body.taskData || {};

    // 3. 创建任务（使用优化后的提示词）
    const taskRepo = getTaskRepository();
    const task = await taskRepo.create({
      userId: taskData.userId || 'default-user',
      productImageUrl: taskData.productImageUrl,
      sceneImageUrl: taskData.sceneImageUrl,
      prompt: body.finalPrompt,
      originalPrompt: body.originalPrompt,
      optimizedPrompt: body.finalPrompt,
      promptSource: 'AI_OPTIMIZED',
      promptOptimizationEnabled: true,
      // ... 其他配置
      aiModel: taskData.aiModel || 'FLUX.1',
      aspectRatio: taskData.aspectRatio || '1:1',
      imageCount: taskData.imageCount || 4,
      quality: taskData.quality || 'high',
      syncStatus: 'PENDING',
    });

    // 如果有飞书记录ID，更新任务（通过UpdateTaskInput）
    if (conversation.recordId) {
      await taskRepo.update(task.id, {
        feishuRecordId: conversation.recordId,
      });
    }

    console.log('[API] Created task from conversation:', {
      conversationId: id,
      taskId: task.id,
      finalPrompt: body.finalPrompt,
    });

    // 4. 触发N8N工作流
    const n8nService = getN8nService();
    await n8nService.triggerGeneration({
      taskId: task.id,
      userId: task.userId,
      productImageUrl: taskData.productImageUrl || '',
      sceneImageUrl: taskData.sceneImageUrl,
      prompt: body.finalPrompt,
      aiModel: taskData.aiModel || 'FLUX.1',
      aspectRatio: taskData.aspectRatio || '1:1',
      imageCount: taskData.imageCount || 4,
      quality: taskData.quality || 'high',
    });

    // 5. 返回任务信息
    return NextResponse.json({
      success: true,
      data: {
        taskId: task.id,
        conversationId: id,
        message: '任务创建成功，正在生成图片',
      },
    });
  } catch (error) {
    console.error('[API] Failed to apply conversation:', error);
    return NextResponse.json(
      { error: 'Failed to apply conversation' },
      { status: 500 }
    );
  }
}
