/**
 * 共享类型定义
 */

// 模式类型
export type WorkMode = 'single' | 'batch';

// AI模型类型
export type TextModel =
  | 'gemini-1.5-flash'
  | 'gemini-1.5-pro'
  | 'gemini-2.0-flash-exp'
  | 'claude-3-5-sonnet'
  | 'gpt-4o';
export type ImageModel =
  | 'flux-1.1-pro'
  | 'flux-1.1-ultra'
  | 'flux-realism'
  | 'sd3'
  | 'mj-v6'
  | 'Gemini-3-Pro-Image'
  | 'Gemini-2-Flash';

// 任务状态
export type TaskStatus = 'pending' | 'processing' | 'generating' | 'completed' | 'failed';

// 生成步骤
export type GenerationStep =
  | 'analyzing' // 分析提示词和图片
  | 'preprocessing' // 预处理图片
  | 'generating' // AI生成中
  | 'upscaling' // 放大优化
  | 'finalizing'; // 最终处理

// 生成步骤信息
export interface StepInfo {
  id: GenerationStep;
  name: string;
  description: string;
  duration: number; // 预计耗时（秒）
}

// 任务配置
export interface TaskConfig {
  textModel?: TextModel;
  imageModel?: ImageModel;
  aspectRatio: '1:1' | '3:4' | '16:9' | '9:16';
  imageCount: number;
  quality: 'standard' | 'high';
}

// 任务数据
export interface TaskData {
  id: string;
  productName?: string;
  productImage?: File | string;
  sceneImage?: File | string;
  prompt: string;
  config: TaskConfig;
  status: TaskStatus;
  progress: number;
  currentStep?: GenerationStep; // 当前步骤
  estimatedTimeRemaining?: number; // 预计剩余时间（秒）
  resultImages?: string[];
  createdAt: Date;
}

// API配置
export interface ApiConfig {
  // 品牌配置（前端可见）
  brandTitle?: string;
  brandSubtitle?: string;
  brandIcon?: string; // Emoji 或文字图标
  brandLogoImage?: string; // Logo 图片（base64）

  // API配置（前端用户可配置）
  deerApiEndpoint?: string; // DeerAPI endpoint URL
  deerApiKey?: string; // DeerAPI key
  n8nWebhookUrl?: string; // N8N webhook URL（可选，用于自定义N8N实例）

  // 回调配置（用于n8n回调）
  callbackUrl?: string; // n8n回调URL（自动检测或手动配置）
}
