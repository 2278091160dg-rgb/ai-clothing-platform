/**
 * POST /api/conversations
 * 创建新的AI对话
 */

import { NextRequest, NextResponse } from 'next/server';
import { getConversationRepository } from '@/lib/repositories/conversation.repository';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 如果没有recordId，生成一个临时ID（用于Web端直接使用）
    const recordId = body.recordId || `web-${Date.now()}-${crypto.randomUUID()}`;

    const conversationRepo = getConversationRepository();
    const conversation = await conversationRepo.create({
      recordId,
      source: body.source || 'web',
    });

    console.log('[API] Created conversation:', {
      id: conversation.id,
      recordId: conversation.recordId,
      source: body.source || 'web',
    });

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('[API] Failed to create conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
