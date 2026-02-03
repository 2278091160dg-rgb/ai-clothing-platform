/**
 * AI Conversation Service - AI对话服务
 */

import type { AIConversationConfig, AIMessage, AIResponse, ChatContext } from './ai-conversation/ai-conversation.types';
import { buildSystemPrompt, parseAIResponse } from './ai-conversation/ai-conversation.types';
import { MockAIConversationService } from './ai-conversation/ai-conversation.mock';

export class AIConversationService {
  private config: AIConversationConfig;

  constructor(config: AIConversationConfig) {
    this.config = { ...config, model: config.model || 'gpt-4' };
  }

  async chat(messages: AIMessage[], context?: ChatContext): Promise<AIResponse> {
    const systemPrompt = buildSystemPrompt(context);
    const fullMessages: AIMessage[] = [{ role: 'system', content: systemPrompt }, ...messages];

    try {
      const response = await this.callAIAPI(fullMessages);
      return parseAIResponse(response);
    } catch (error) {
      console.error('[AIConversation] Failed to get AI response:', error);
      throw new Error('AI对话失败，请稍后重试');
    }
  }

  async quickOptimize(prompt: string): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'user',
        content: `请帮我优化这个AI绘画提示词，使其更加详细和专业：\n\n${prompt}`,
      },
    ];
    const response = await this.chat(messages, { originalPrompt: prompt });
    return response.suggestedPrompt || response.message;
  }

  private async callAIAPI(messages: AIMessage[]): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }
}

let aiConversationServiceInstance: AIConversationService | MockAIConversationService | null = null;

export function getAIConversationService(): AIConversationService | MockAIConversationService {
  if (!aiConversationServiceInstance) {
    const apiKey = process.env.OPENAI_API_KEY || '';
    const baseURL = process.env.OPENAI_BASE_URL;

    if (!apiKey) {
      console.warn('[AIConversation] OPENAI_API_KEY not configured, using mock service');
      aiConversationServiceInstance = new MockAIConversationService();
    } else {
      aiConversationServiceInstance = new AIConversationService({ apiKey, baseURL });
    }
  }

  return aiConversationServiceInstance;
}

export type { AIConversationConfig, AIMessage, AIResponse, ChatContext } from './ai-conversation/ai-conversation.types';
export { MockAIConversationService } from './ai-conversation/ai-conversation.mock';
