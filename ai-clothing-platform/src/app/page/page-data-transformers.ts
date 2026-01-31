/**
 * Page Data Transformers
 * 主页面数据转换函数
 */

import type { TaskData, TaskConfig } from '@/lib/types';
import type { HistoryTask } from '@/lib/types/history.types';
import type { TextModel } from '@/lib/types';

/**
 * 转换历史任务为显示格式
 */
export function transformTasksToDisplayFormat(
  historyTasks: (TaskData | HistoryTask)[],
  textModel: TextModel,
  quality: 'standard' | 'high'
) {
  return historyTasks.map(task => {
    // 处理TaskData和HistoryTask的不同属性
    const isHistoryTask = 'productImagePreview' in task;

    const productImage = isHistoryTask
      ? (task as HistoryTask).productImagePreview
      : typeof (task as TaskData).productImage === 'string'
        ? (task as TaskData).productImage
        : undefined;

    const sceneImage = isHistoryTask
      ? (task as HistoryTask).sceneImagePreview
      : typeof (task as TaskData).sceneImage === 'string'
        ? (task as TaskData).sceneImage
        : undefined;

    // 确保 config 包含所有必需属性
    const config: TaskConfig = {
      imageModel: task.config.imageModel,
      aspectRatio: task.config.aspectRatio as '1:1' | '3:4' | '16:9' | '9:16',
      imageCount: (task.config as TaskConfig).imageCount || 1,
      quality: (task.config as TaskConfig).quality || quality,
    };

    return {
      id: task.id,
      productName: task.productName,
      prompt: task.prompt,
      productImage,
      sceneImage,
      config: {
        textModel,
        ...config,
      },
      status: task.status as 'pending' | 'generating' | 'processing' | 'completed' | 'failed',
      progress: task.progress,
      resultImages: task.resultImages,
      createdAt: task.createdAt,
      source: (task.source || 'feishu') as 'web' | 'feishu' | 'api',
      type: (task.type || task.source || 'feishu') as 'web' | 'feishu' | 'api',
    };
  });
}
