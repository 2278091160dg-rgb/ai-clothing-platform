/**
 * N8n Types - n8n 服务类型定义
 */

export interface N8nConfig {
  webhookUrl: string;
  apiKey: string;
}

export interface GenerationRequest {
  taskId: string;
  userId: string;
  mode: 'scene' | 'tryon' | 'wear' | 'combine';
  productImageUrl: string;
  sceneImageUrl?: string;
  prompt: string;
  negativePrompt?: string;
  aiModel: string;
  aspectRatio: string;
  imageCount: number;
  quality: string;
  deerApiKey?: string;
  callbackUrl?: string;
  clothingImageUrl?: string;
  clothingDescription?: string;
  tryonReferenceImageUrl?: string;
  tryonModelImageUrl?: string;
  modelDescription?: string;
  sceneDescription?: string;
  tryonMode?: 'single' | 'multi';
  wearProductImageUrl?: string;
  wearProductDescription?: string;
  wearReferenceImageUrl?: string;
  wearReferenceDescription?: string;
  productType?: 'shoes' | 'bag' | 'watch' | 'jewelry' | 'hat' | 'scarf';
  viewType?: 'single' | 'multi';
  materialImageUrls?: string[];
  combinationCount?: number;
  modelType?: 'any' | 'adult' | 'child' | 'male' | 'female';
  stylePreference?: 'casual' | 'formal' | 'sporty' | 'elegant' | 'minimalist';
  finalPrompt?: string;
  finalNegativePrompt?: string;
}

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface N8nCallback {
  taskId: string;
  status: GenerationStatus;
  resultImageUrls?: string[];
  resultImageTokens?: string[];
  error?: string;
  progress?: number;
}

export interface WorkflowStatusResponse {
  status: string;
  progress: number;
  result?: Record<string, unknown>;
}
