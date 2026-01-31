/**
 * Create Task Types
 * 任务创建相关的类型定义
 */

/**
 * 生成模式类型
 */
export type GenerationMode = 'scene' | 'tryon' | 'wear' | 'combine';

/**
 * 创建任务请求 - 支持所有模式
 */
export interface CreateTaskRequest {
  // === 通用参数 ===
  mode: GenerationMode;
  userId?: string;
  callbackUrl?: string;

  // === 场景生图参数 ===
  productImageUrl?: string;
  sceneImageUrl?: string;
  prompt?: string;
  negativePrompt?: string;

  // === 虚拟试衣参数 ===
  clothingImageUrl?: string;
  clothingDescription?: string;
  tryonReferenceImageUrl?: string;
  tryonModelImageUrl?: string;
  modelDescription?: string;
  sceneDescription?: string;
  tryonMode?: 'single' | 'multi';

  // === 智能穿戴参数 ===
  wearProductImageUrl?: string;
  wearProductDescription?: string;
  wearReferenceImageUrl?: string;
  wearReferenceDescription?: string;
  productType?: 'shoes' | 'bag' | 'watch' | 'jewelry' | 'hat' | 'scarf';
  viewType?: 'single' | 'multi';

  // === 自由搭配参数 ===
  materialImageUrls?: string[];
  combinationCount?: number;
  modelType?: 'any' | 'adult' | 'child' | 'male' | 'female';
  stylePreference?: 'casual' | 'formal' | 'sporty' | 'elegant' | 'minimalist';

  // === 通用生成参数 ===
  aiModel?: string;
  aspectRatio?: string;
  imageCount?: number;
  quality?: string;
  batchId?: string;
  deerApiKey?: string;
}
