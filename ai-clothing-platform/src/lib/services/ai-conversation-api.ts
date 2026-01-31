/**
 * AIConversationAPI - AI对话 API 服务
 */

import type { Message } from '@/lib/types/ai-conversation.types';
import type {
  CreateConversationOptions,
  SendMessageOptions,
  ApplyConversationOptions,
} from '@/lib/types/ai-conversation.types';

export class AIConversationAPI {
  /**
   * 创建对话
   */
  static async createConversation(options: CreateConversationOptions): Promise<string> {
    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recordId: options.recordId,
        source: 'web',
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to create conversation');
    }

    return data.data.id;
  }

  /**
   * 发送消息
   */
  static async sendMessage(
    conversationId: string,
    options: SendMessageOptions
  ): Promise<{ message: string; suggestedPrompt?: string; suggestedNegativePrompt?: string }> {
    const response = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: options.content,
        role: 'user',
        originalPrompt: options.originalPrompt,
        currentPrompt: options.currentPrompt,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to send message');
    }

    return {
      message: data.data.message,
      suggestedPrompt: data.data.suggestedPrompt,
      suggestedNegativePrompt: data.data.suggestedNegativePrompt,
    };
  }

  /**
   * 应用对话结果
   */
  static async applyConversation(
    conversationId: string,
    options: ApplyConversationOptions
  ): Promise<boolean> {
    const response = await fetch(`/api/conversations/${conversationId}/apply`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });

    const data = await response.json();
    return data.success;
  }

  /**
   * 创建用户消息对象
   */
  static createUserMessage(content: string): Message {
    return {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
  }

  /**
   * 创建AI消息对象
   */
  static createAIMessage(content: string): Message {
    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
  }

  /**
   * 创建系统错误消息
   */
  static createSystemErrorMessage(error: string): Message {
    return {
      id: Date.now().toString(),
      role: 'system',
      content: `❌ ${error}`,
      timestamp: new Date(),
    };
  }

  /**
   * 创建系统消息
   */
  static createSystemMessage(message: string): Message {
    return {
      id: Date.now().toString(),
      role: 'system',
      content: message,
      timestamp: new Date(),
    };
  }
}
