/**
 * Task Download Utils
 * 任务下载工具
 */

import type { TaskData } from '@/lib/types';

/**
 * 处理任务图片下载 - 使用代理避免飞书授权问题
 */
export async function handleTaskDownload(task: TaskData): Promise<void> {
  if (task.resultImages && task.resultImages.length > 0) {
    try {
      const imageUrl = task.resultImages[0];
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `task-${task.id}-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('下载失败:', error);
    }
  }
}
