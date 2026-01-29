/**
 * DeerAPI AI Conversation Service
 * DeerAPI版本的AI对话服务 - 替代OpenAI
 */

interface DeerAPIConversationConfig {
  endpoint: string;
  apiKey: string;
}

/**
 * DeerAPI响应消息
 */
interface DeerAPIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * DeerAPI响应
 */
interface DeerAPIResponse {
  success: boolean;
  data?: {
    message?: string;
    suggestedPrompt?: string;
  };
  error?: string;
}

/**
 * DeerAPI Conversation Service Class
 */
export class DeerAPIConversationService {
  private config: DeerAPIConversationConfig;

  constructor(config: DeerAPIConversationConfig) {
    this.config = config;
  }

  /**
   * 发送消息到DeerAPI并获取回复
   */
  async chat(
    messages: DeerAPIMessage[],
    context?: {
      originalPrompt?: string;
      currentPrompt?: string;
    }
  ): Promise<{ message: string; suggestedPrompt?: string }> {
    // 构建系统提示
    const systemPrompt = this.buildSystemPrompt(context);

    // 添加系统消息到对话历史
    const fullMessages: DeerAPIMessage[] = [{ role: 'system', content: systemPrompt }, ...messages];

    try {
      // 调用DeerAPI
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          messages: fullMessages,
          model: 'chat', // 使用DeerAPI的对话模型
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeerAPI error: ${response.status}`);
      }

      const data: DeerAPIResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'DeerAPI request failed');
      }

      // 解析AI响应
      return this.parseAIResponse(data.data?.message || '', context);
    } catch (error) {
      console.error('[DeerAPIConversation] Failed to get AI response:', error);
      throw new Error('AI对话失败，请稍后重试');
    }
  }

  /**
   * 快速优化提示词（单轮，无对话）
   */
  async quickOptimize(prompt: string): Promise<string> {
    const messages: DeerAPIMessage[] = [
      {
        role: 'user',
        content: `请帮我优化这个AI绘画提示词，使其更加详细和专业：\n\n${prompt}`,
      },
    ];

    const response = await this.chat(messages, { originalPrompt: prompt });
    return response.suggestedPrompt || response.message;
  }

  /**
   * 构建系统提示
   */
  private buildSystemPrompt(context?: { originalPrompt?: string; currentPrompt?: string }): string {
    let systemPrompt = `你是一个专业的AI绘画提示词优化助手。你的任务是帮助用户改进和优化他们的AI绘画提示词。

工作流程：
1. 理解用户的原始需求
2. 分析当前提示词的优缺点
3. 提供具体的优化建议
4. 如果用户同意，给出优化后的完整提示词

优化原则：
- 保持用户的原始意图
- 添加必要的细节描述（材质、光线、构图、风格等）
- 使用专业术语（如"hyperrealistic"、"cinematic lighting"等）
- 确保提示词简洁而有效

输出格式：
- 首先分析当前提示词
- 然后提供2-3个优化建议
- 最后，如果用户满意，给出完整的优化提示词（用【优化版本】标记）`;

    if (context?.originalPrompt) {
      systemPrompt += `\n\n原始提示词：${context.originalPrompt}`;
    }

    if (context?.currentPrompt && context.currentPrompt !== context.originalPrompt) {
      systemPrompt += `\n\n当前提示词：${context.currentPrompt}`;
    }

    return systemPrompt;
  }

  /**
   * 解析AI响应
   */
  private parseAIResponse(
    response: string,
    context?: {
      originalPrompt?: string;
      currentPrompt?: string;
    }
  ): { message: string; suggestedPrompt?: string } {
    // 检查是否包含优化版本标记
    const optimizedVersionMatch = response.match(
      /【优化版本】[\s\S]*?[:：]\s*([\s\S]+?)(?=\n\n|$)/
    );
    const suggestedPrompt = optimizedVersionMatch ? optimizedVersionMatch[1].trim() : undefined;

    return {
      message: response,
      suggestedPrompt,
    };
  }
}

// 单例实例
let deerApiConversationServiceInstance: DeerAPIConversationService | null = null;

export function getDeerAPIConversationService(): DeerAPIConversationService {
  if (!deerApiConversationServiceInstance) {
    const config = ConfigManager.getConfig();

    if (!config.deerApiEndpoint || !config.deerApiKey) {
      console.warn('[DeerAPIConversation] DeerAPI not configured');
      throw new Error('DeerAPI未配置，请在设置中配置API密钥');
    }

    deerApiConversationServiceInstance = new DeerAPIConversationService({
      endpoint: config.deerApiEndpoint,
      apiKey: config.deerApiKey,
    });
  }

  return deerApiConversationServiceInstance;
}

// 导入 ConfigManager
import { ConfigManager } from '@/lib/config';
