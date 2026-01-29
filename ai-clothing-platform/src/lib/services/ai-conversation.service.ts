/**
 * AI Conversation Service
 * AI对话服务 - 处理多轮AI对话
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
interface AIConversationConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
}

/**
 * AI响应消息
 */
interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * AI响应
 */
interface AIResponse {
  message: string;
  suggestedPrompt?: string;
  suggestedNegativePrompt?: string;
}

/**
 * AI Conversation Service Class
 */
export class AIConversationService {
  private config: AIConversationConfig;

  constructor(config: AIConversationConfig) {
    this.config = {
      ...config,
      model: config.model || 'gpt-4',
    };
  }

  /**
   * 发送消息到AI并获取回复
   */
  async chat(
    messages: AIMessage[],
    context?: {
      originalPrompt?: string;
      currentPrompt?: string;
    }
  ): Promise<AIResponse> {
    // 构建系统提示
    const systemPrompt = this.buildSystemPrompt(context);

    // 添加系统消息到对话历史
    const fullMessages: AIMessage[] = [{ role: 'system', content: systemPrompt }, ...messages];

    try {
      // 调用AI API
      const response = await this.callAIAPI(fullMessages);

      // 解析AI响应
      return this.parseAIResponse(response, context);
    } catch (error) {
      console.error('[AIConversation] Failed to get AI response:', error);
      throw new Error('AI对话失败，请稍后重试');
    }
  }

  /**
   * 快速优化提示词（单轮，无对话）
   */
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

  /**
   * 构建系统提示
   */
  private buildSystemPrompt(context?: { originalPrompt?: string; currentPrompt?: string }): string {
    let systemPrompt = `你是一个专业的AI绘画提示词优化助手。你的任务是帮助用户改进和优化他们的AI绘画提示词。

工作流程：
1. 理解用户的原始需求
2. 分析当前提示词的优缺点
3. 提供具体的优化建议
4. 如果用户同意，给出优化后的完整提示词和反向提示词

优化原则：
- 保持用户的原始意图
- 添加必要的细节描述（材质、光线、构图、风格等）
- 使用专业术语（如"hyperrealistic"、"cinematic lighting"等）
- 确保提示词简洁而有效

输出格式：
- 首先分析当前提示词
- 然后提供2-3个优化建议
- 最后，如果用户满意，给出完整的优化提示词（用【优化版本】标记）
- 同时给出推荐的反向提示词（用【反向提示词】标记）

反向提示词应包含常见的需要避免的元素：
blurry, low quality, bad anatomy, distorted, watermark, text, logo, bad composition, oversaturated, ugly, duplicate, mutation`;

    if (context?.originalPrompt) {
      systemPrompt += `\n\n原始提示词：${context.originalPrompt}`;
    }

    if (context?.currentPrompt && context.currentPrompt !== context.originalPrompt) {
      systemPrompt += `\n\n当前提示词：${context.currentPrompt}`;
    }

    return systemPrompt;
  }

  /**
   * 调用AI API
   */
  private async callAIAPI(messages: AIMessage[]): Promise<string> {
    // 这里使用OpenAI API作为示例
    // 可以根据实际使用的AI服务调整
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

  /**
   * 解析AI响应
   */
  private parseAIResponse(
    response: string,
    _context?: {
      originalPrompt?: string;
      currentPrompt?: string;
    }
  ): AIResponse {
    // 检查是否包含优化版本标记
    const optimizedVersionMatch = response.match(
      /【优化版本】[\s\S]*?[:：]\s*([\s\S]+?)(?=\n\n|【反向提示词】|$)/
    );
    const suggestedPrompt = optimizedVersionMatch ? optimizedVersionMatch[1].trim() : undefined;

    // 检查是否包含反向提示词标记
    const negativePromptMatch = response.match(
      /【反向提示词】[\s\S]*?[:：]\s*([\s\S]+?)(?=\n\n|$)/
    );
    const suggestedNegativePrompt = negativePromptMatch ? negativePromptMatch[1].trim() : undefined;

    return {
      message: response,
      suggestedPrompt,
      suggestedNegativePrompt,
    };
  }
}

// 单例实例
let aiConversationServiceInstance: AIConversationService | MockAIConversationService | null = null;

export function getAIConversationService(): AIConversationService | MockAIConversationService {
  if (!aiConversationServiceInstance) {
    const apiKey = process.env.OPENAI_API_KEY || '';
    const baseURL = process.env.OPENAI_BASE_URL;

    if (!apiKey) {
      console.warn('[AIConversation] OPENAI_API_KEY not configured, using mock service');
      // 返回一个模拟服务
      aiConversationServiceInstance = new MockAIConversationService();
    } else {
      aiConversationServiceInstance = new AIConversationService({
        apiKey,
        baseURL,
      });
    }
  }

  return aiConversationServiceInstance;
}

/**
 * Mock AI Conversation Service (用于测试)
 */
class MockAIConversationService {
  async chat(
    messages: AIMessage[],
    context?: {
      originalPrompt?: string;
      currentPrompt?: string;
    }
  ): Promise<AIResponse> {
    console.log('[MockAI] Received chat request:', {
      messageCount: messages.length,
      context,
    });

    const lastUserMessage = messages.filter(m => m.role === 'user').pop();

    if (!lastUserMessage) {
      const response = {
        message: '你好！我是AI提示词优化助手。请告诉我你想优化什么提示词？',
        suggestedPrompt: undefined,
        suggestedNegativePrompt: undefined,
      };
      console.log('[MockAI] Returning welcome message');
      return response;
    }

    // 检查是否是初始优化请求
    const isInitialRequest = lastUserMessage.content.includes('请帮我优化这个提示词：');
    const promptToOptimize = isInitialRequest
      ? lastUserMessage.content.replace('请帮我优化这个提示词：', '').trim()
      : context?.originalPrompt || lastUserMessage.content;

    // 生成详细的Mock响应
    const response = `我已经分析了你的提示词："${promptToOptimize}"

**分析结果：**
✅ 你的提示词表达了基本场景
💡 建议可以添加更多细节来提升效果

**优化建议：**
1. 添加光线描述：如自然光、柔和光线
2. 明确拍摄角度：如正面、侧面、俯视
3. 增加风格描述：如极简主义、时尚摄影
4. 补充构图元素：如背景虚化、主体突出

【优化版本】：${promptToOptimize}，professional fashion photography, soft natural lighting, clean background, high detail, commercial product shot, 8k quality, studio lighting

【反向提示词】：blurry, low quality, bad anatomy, distorted, watermark, text, logo, bad composition, oversaturated, ugly, duplicate`;

    const result = {
      message: response,
      suggestedPrompt: `${promptToOptimize}，professional fashion photography, soft natural lighting, clean background, high detail, commercial product shot, 8k quality, studio lighting`,
      suggestedNegativePrompt: 'blurry, low quality, bad anatomy, distorted, watermark, text, logo, bad composition, oversaturated, ugly, duplicate',
    };

    console.log('[MockAI] Returning optimization response:', {
      messageLength: result.message.length,
      suggestedPromptLength: result.suggestedPrompt?.length,
      suggestedNegativePromptLength: result.suggestedNegativePrompt?.length,
    });

    return result;
  }

  async quickOptimize(prompt: string): Promise<string> {
    const response = await this.chat([
      { role: 'user', content: `请帮我优化这个提示词：${prompt}` },
    ]);
    return response.suggestedPrompt || response.message;
  }
}
