/**
 * AI Chat Utils - AI对话工具函数
 */

/**
 * 从URL参数中提取提示词
 */
export function extractPromptFromURL(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('prompt');
}

/**
 * Feishu默认任务数据
 */
export const FEISHU_DEFAULT_TASK_DATA = {
  userId: 'default-user',
  aiModel: 'FLUX.1',
  aspectRatio: '3:4',
  imageCount: 4,
  quality: 'high',
} as const;
