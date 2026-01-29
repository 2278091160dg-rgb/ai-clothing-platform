/**
 * Conversation Repository
 * 对话仓储 - 管理AI对话数据
 */

import { prisma } from '@/lib/prisma';

/**
 * 对话消息类型
 */
export type ConversationMessageRole = 'user' | 'assistant' | 'system';

export interface ConversationMessage {
  id: string;
  role: ConversationMessageRole;
  content: string;
  timestamp: Date;
  promptSnapshot?: string; // AI回复时的提示词快照
}

/**
 * 创建对话输入
 */
export interface CreateConversationInput {
  recordId: string;
  source?: 'web' | 'feishu';
}

/**
 * 添加消息输入
 */
export interface AddMessageInput {
  content: string;
  role: ConversationMessageRole;
}

/**
 * 对话状态
 */
export type ConversationStatus = 'active' | 'completed' | 'discarded';

/**
 * Conversation Repository Class
 */
export class ConversationRepository {
  /**
   * 创建新对话
   */
  async create(input: CreateConversationInput) {
    return prisma.promptConversation.create({
      data: {
        recordId: input.recordId,
        source: input.source || 'web',
        status: 'active',
        messages: [],
      },
    });
  }

  /**
   * 通过ID获取对话
   */
  async findById(id: string) {
    return prisma.promptConversation.findUnique({
      where: { id },
    });
  }

  /**
   * 通过recordId获取对话
   */
  async findByRecordId(recordId: string) {
    return prisma.promptConversation.findFirst({
      where: {
        recordId,
        status: 'active',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 添加消息到对话
   */
  async addMessage(conversationId: string, message: AddMessageInput) {
    const conversation = await this.findById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const messages = this.parseMessages(conversation.messages);
    const newMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      role: message.role,
      content: message.content,
      timestamp: new Date(),
    };

    messages.push(newMessage);

    return prisma.promptConversation.update({
      where: { id: conversationId },
      data: {
        messages: messages as any, // Prisma JSON存储
        messageCount: messages.length,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * 更新对话状态和应用最终提示词
   */
  async applyFinalPrompt(conversationId: string, finalPrompt: string) {
    return prisma.promptConversation.update({
      where: { id: conversationId },
      data: {
        finalPrompt,
        status: 'completed',
        appliedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * 更新对话状态
   */
  async updateStatus(conversationId: string, status: ConversationStatus) {
    return prisma.promptConversation.update({
      where: { id: conversationId },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * 删除对话
   */
  async delete(conversationId: string) {
    return prisma.promptConversation.delete({
      where: { id: conversationId },
    });
  }

  /**
   * 解析消息JSON
   */
  private parseMessages(messages: unknown): ConversationMessage[] {
    if (typeof messages === 'string') {
      try {
        return JSON.parse(messages);
      } catch {
        return [];
      }
    }
    if (Array.isArray(messages)) {
      return messages as ConversationMessage[];
    }
    return [];
  }
}

// 单例实例
let conversationRepositoryInstance: ConversationRepository | null = null;

export function getConversationRepository(): ConversationRepository {
  if (!conversationRepositoryInstance) {
    conversationRepositoryInstance = new ConversationRepository();
  }

  return conversationRepositoryInstance;
}
