/**
 * POST /api/conversations/[id]/messages
 * 发送消息到对话
 */

import { NextRequest, NextResponse } from 'next/server';
import { getConversationRepository } from '@/lib/repositories/conversation.repository';
import { getAIConversationService } from '@/lib/services/ai-conversation.service';
import type { ConversationMessage } from '@/lib/repositories/conversation.repository';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    console.log('[API] Received message request:', {
      conversationId: id,
      content: body.content,
      originalPrompt: body.originalPrompt,
    });

    // 验证必填字段
    if (!body.content) {
      return NextResponse.json(
        { error: 'Missing required field: content' },
        { status: 400 }
      );
    }

    const conversationRepo = getConversationRepository();
    const conversation = await conversationRepo.findById(id);

    if (!conversation) {
      console.error('[API] Conversation not found:', id);
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // 1. 获取对话历史
    const messages = (conversation.messages as unknown) as ConversationMessage[];

    // 2. 添加当前用户消息到对话历史（用于AI上下文）
    const messagesWithNewUserMessage = [
      ...messages,
      {
        role: 'user' as const,
        content: body.content,
        timestamp: new Date(),
      },
    ];

    // 3. 添加用户消息到数据库
    await conversationRepo.addMessage(id, {
      content: body.content,
      role: 'user',
    });

    // 4. 调用AI服务
    const aiService = getAIConversationService();
    const aiResponse = await aiService.chat(
      messagesWithNewUserMessage.map(m => ({
        role: m.role,
        content: m.content,
      })),
      {
        originalPrompt: body.originalPrompt,
        currentPrompt: body.currentPrompt,
      }
    );

    // 5. 添加AI回复消息
    await conversationRepo.addMessage(id, {
      content: aiResponse.message,
      role: 'assistant',
    });

    console.log('[API] AI response:', {
      messageLength: aiResponse.message.length,
      hasSuggestedPrompt: !!aiResponse.suggestedPrompt,
      suggestedPrompt: aiResponse.suggestedPrompt,
    });

    // 6. 返回AI响应
    return NextResponse.json({
      success: true,
      data: {
        message: aiResponse.message,
        suggestedPrompt: aiResponse.suggestedPrompt,
      },
    });
  } catch (error) {
    console.error('[API] Failed to send message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
