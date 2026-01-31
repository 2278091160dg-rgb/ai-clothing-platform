/**
 * 历史记录相关类型定义
 */

import type { ImageModel } from './index';
import type { LucideIcon } from 'lucide-react';

/**
 * 历史任务状态
 */
export type HistoryTaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * 任务来源
 */
export type TaskSource = 'web' | 'feishu' | 'api';

/**
 * 历史任务（完整格式）
 */
export interface HistoryTask {
  id: string;
  recordId: string;
  productName: string;
  prompt: string;
  negativePrompt: string;
  config: {
    imageModel: ImageModel;
    aspectRatio: string;
  };
  status: HistoryTaskStatus;
  progress: number;
  resultImages?: string[];
  productImagePreview?: string;
  sceneImagePreview?: string;
  createdAt: Date;
  source?: TaskSource;
  type?: TaskSource;
}

/**
 * 简化的历史记录项格式
 */
export interface HistoryRecord {
  id: string;
  original: string; // 原始商品图 URL
  sceneImage?: string; // 场景图/第二张输入图 URL
  generated: string; // AI 生成结果图 URL
  timestamp: number; // 时间戳
  prompt: string; // 提示词
}

/**
 * 飞书记录格式（API 返回）
 */
export interface FeishuRecord {
  record_id: string;
  prompt: string;
  status: string;
  productImageUrl?: string;
  sceneImageUrl?: string;
  resultImageUrl?: string;
  negativePrompt?: string;
  ratio?: string;
  model?: string;
  created_time: number;
  source?: string; // '网页端' or '表格端'
}

/**
 * 默认反向提示词
 */
export const DEFAULT_NEGATIVE_PROMPT =
  'nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, multiple views';

/**
 * Loading 状态消息
 */
export interface LoadingStatusMessage {
  text: string;
  icon: LucideIcon;
}

/**
 * Loading 状态消息列表（延迟初始化，避免循环依赖）
 */
export const getLoadingStatusMessages = (): LoadingStatusMessage[] => [
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  { text: '正在解析图像语义...', icon: require('lucide-react').Wand2 },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  { text: '正在计算光影结构...', icon: require('lucide-react').Cpu },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  { text: '正在生成超清细节...', icon: require('lucide-react').Palette },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  { text: '即将完成...', icon: require('lucide-react').Sparkles },
];
