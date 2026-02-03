/**
 * AI Conversation Types
 */

export interface AIConversationConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  message: string;
  suggestedPrompt?: string;
  suggestedNegativePrompt?: string;
}

export interface ChatContext {
  originalPrompt?: string;
  currentPrompt?: string;
}

export const SYSTEM_PROMPT = `你是一个专业的AI绘画提示词优化助手。你的任务是帮助用户改进和优化他们的AI绘画提示词。

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

export function buildSystemPrompt(context?: ChatContext): string {
  let prompt = SYSTEM_PROMPT;

  if (context?.originalPrompt) {
    prompt += `\n\n原始提示词：${context.originalPrompt}`;
  }

  if (context?.currentPrompt && context.currentPrompt !== context.originalPrompt) {
    prompt += `\n\n当前提示词：${context.currentPrompt}`;
  }

  return prompt;
}

export function parseAIResponse(response: string): AIResponse {
  const optimizedVersionMatch = response.match(
    /【优化版本】[\s\S]*?[:：]\s*([\s\S]+?)(?=\n\n|【反向提示词】|$)/
  );
  const suggestedPrompt = optimizedVersionMatch ? optimizedVersionMatch[1].trim() : undefined;

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

export const DEFAULT_NEGATIVE_PROMPT =
  'blurry, low quality, bad anatomy, distorted, watermark, text, logo, bad composition, oversaturated, ugly, duplicate';
