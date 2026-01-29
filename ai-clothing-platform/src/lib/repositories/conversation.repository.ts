/**
 * Conversation Repository
 * 对话仓储 - 管理AI对话数据
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from '@/lib/prisma';
import { PromptConversation, Prisma } from '@prisma/client';

/**
 * 对话消息类型
 */
export type ConversationMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
};

/**
 * 创建对话输入
 */
export interface CreateConversationInput {
  recordId?: string;
  originalPrompt?: string;
  messages?: ConversationMessage[];
  finalPrompt?: string;
  source?: string;
  status?: string;
}

/**
 * 对话仓储类
 */
export class ConversationRepository {
  /**
   * 创建对话
   */
  async create(data: CreateConversationInput): Promise<PromptConversation> {
    return prisma.promptConversation.create({
      data: {
        recordId: data.recordId || '',
        source: data.source || 'web',
        status: data.status || 'active',
        finalPrompt: data.finalPrompt,
      },
    });
  }

  /**
   * 通过ID查找对话
   */
  async findById(id: string): Promise<PromptConversation | null> {
    return prisma.promptConversation.findUnique({
      where: { id },
    });
  }

  /**
   * 通过记录ID查找对话
   */
  async findByRecordId(recordId: string): Promise<PromptConversation | null> {
    return prisma.promptConversation.findFirst({
      where: { recordId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 通过任务ID查找对话（通过关联的任务记录）
   */
  async findByTaskId(taskId: string): Promise<PromptConversation | null> {
    // 这个方法需要通过Task表查找关联的recordId，然后查询Conversation
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { feishuRecordId: true },
    });
    if (task?.feishuRecordId) {
      return this.findByRecordId(task.feishuRecordId);
    }
    return null;
  }

  /**
   * 添加消息到对话
   */
  async addMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<PromptConversation> {
    const conversation = await this.findById(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    const newMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      role,
      content,
      createdAt: new Date(),
    };

    const currentMessages = (conversation.messages as unknown as ConversationMessage[]) || [];

    return prisma.promptConversation.update({
      where: { id: conversationId },
      data: {
        messages: [...currentMessages, newMessage] as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * 应用最终优化的提示词
   */
  async applyFinalPrompt(
    conversationId: string,
    finalPrompt: string,
    finalNegativePrompt?: string
  ): Promise<PromptConversation> {
    return prisma.promptConversation.update({
      where: { id: conversationId },
      data: {
        finalPrompt,
        ...(finalNegativePrompt && { finalNegativePrompt }),
      },
    });
  }

  /**
   * 更新选中的版本（暂不实现，模型中无此字段）
   */
  async updateSelectedVersion(
    conversationId: string,
    // version: number  // 暂未实现，预留参数
    _version: number
  ): Promise<PromptConversation> {
    // 模型中没有selectedVersion字段，暂时直接返回conversation
    return this.findById(conversationId) as Promise<PromptConversation>;
  }

  /**
   * 删除对话
   */
  async delete(id: string): Promise<PromptConversation> {
    return prisma.promptConversation.delete({
      where: { id },
    });
  }
}

// 单例实例
let conversationRepositoryInstance: ConversationRepository | null = null;

/**
 * 获取对话仓储实例
 */
export function getConversationRepository(): ConversationRepository {
  if (!conversationRepositoryInstance) {
    conversationRepositoryInstance = new ConversationRepository();
  }
  return conversationRepositoryInstance;
}
