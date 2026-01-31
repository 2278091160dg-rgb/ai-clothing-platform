/**
 * Task Generation Utilities - 任务生成工具函数
 */

import type { ImageModel } from '@/lib/types';
import {
  DEFAULT_NEGATIVE_PROMPT,
  type HistoryTask,
  type TaskSource,
} from '@/lib/types/history.types';

export interface GenerateParams {
  mode: 'scene' | 'tryon' | 'wear' | 'combine';
  prompt: string;
  imageModel: ImageModel;
  aspectRatio: '1:1' | '3:4' | '16:9' | '9:16';
  productImage?: File | null;
  sceneImage?: File | null;
  productImagePreview?: string;
}

/**
 * 构建 FormData 用于 API 请求
 */
export function buildTaskFormData(params: GenerateParams): FormData {
  const { mode, prompt, imageModel, aspectRatio, productImage, sceneImage } = params;

  const formData = new FormData();
  formData.append('prompt', prompt);
  formData.append('negative_prompt', DEFAULT_NEGATIVE_PROMPT);
  formData.append('ratio', aspectRatio);
  formData.append('model', imageModel);
  formData.append('mode', mode);

  // 添加图片文件
  if (productImage) {
    formData.append('product_image', productImage);
  }
  if (sceneImage) {
    formData.append('scene_image', sceneImage);
  }

  return formData;
}

/**
 * 创建临时任务对象（Optimistic UI）
 */
export function createTempTask(params: GenerateParams, tempId: string): HistoryTask {
  const { prompt, imageModel, aspectRatio, productImagePreview } = params;

  return {
    id: tempId,
    recordId: tempId,
    productName: prompt.slice(0, 15) + (prompt.length > 15 ? '...' : ''),
    prompt,
    negativePrompt: DEFAULT_NEGATIVE_PROMPT,
    config: {
      imageModel,
      aspectRatio,
    },
    status: 'processing',
    progress: 0,
    resultImages: undefined,
    productImagePreview: productImagePreview || undefined,
    createdAt: new Date(),
    source: 'web' as TaskSource,
    type: 'web' as TaskSource,
  };
}

/**
 * 验证生成参数
 */
export function validateGenerateParams(params: GenerateParams): string | null {
  if (!params.prompt) {
    return '请输入提示词';
  }
  return null;
}
