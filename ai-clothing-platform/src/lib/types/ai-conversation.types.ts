/**
 * AI Conversation Types - AI对话类型定义
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface SuggestedPrompts {
  prompt: string;
  negativePrompt?: string;
}

export interface TaskData {
  productImageUrl?: string;
  sceneImageUrl?: string;
  aiModel?: string;
  aspectRatio?: string;
  imageCount?: number;
  quality?: string;
}

export interface CreateConversationOptions {
  recordId?: string;
}

export interface SendMessageOptions {
  content: string;
  originalPrompt?: string;
  currentPrompt?: string;
}

export interface ApplyConversationOptions {
  finalPrompt: string;
  finalNegativePrompt?: string;
  originalPrompt?: string;
  originalNegativePrompt?: string;
  taskData?: TaskData;
}
