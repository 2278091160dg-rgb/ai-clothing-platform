/**
 * Mock AI Conversation Service (用于测试)
 */

import type { AIResponse, AIMessage, ChatContext } from './ai-conversation.types';
import { parseAIResponse } from './ai-conversation.types';

export class MockAIConversationService {
  async chat(messages: AIMessage[], context?: ChatContext): Promise<AIResponse> {
    console.log('[MockAI] Received chat request:', { messageCount: messages.length, context });

    const lastUserMessage = messages.filter(m => m.role === 'user').pop();

    if (!lastUserMessage) {
      return {
        message: '你好！我是AI提示词优化助手。请告诉我你想优化什么提示词？',
      };
    }

    const isInitialRequest = lastUserMessage.content.includes('请帮我优化这个提示词：');
    const promptToOptimize = isInitialRequest
      ? lastUserMessage.content.replace('请帮我优化这个提示词：', '').trim()
      : context?.originalPrompt || lastUserMessage.content;

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

    return parseAIResponse(response);
  }

  async quickOptimize(prompt: string): Promise<string> {
    const response = await this.chat([{ role: 'user', content: `请帮我优化这个提示词：${prompt}` }]);
    return response.suggestedPrompt || response.message;
  }
}
