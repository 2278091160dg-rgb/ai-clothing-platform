/**
 * GET /api/conversations/[id]
 * 获取对话详情
 */

import { NextRequest, NextResponse } from 'next/server';
import { getConversationRepository } from '@/lib/repositories/conversation.repository';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const conversationRepo = getConversationRepository();
    const conversation = await conversationRepo.findById(id);

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('[API] Failed to get conversation:', error);
    return NextResponse.json({ error: 'Failed to get conversation' }, { status: 500 });
  }
}
