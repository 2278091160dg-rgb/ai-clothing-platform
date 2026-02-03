/**
 * BatchDownloadService - 批量下载服务
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { TaskData } from '@/lib/types';

export class BatchDownloadService {
  /**
   * 单图下载
   */
  static async downloadSingleImage(imageUrl: string, filename?: string): Promise<void> {
    try {
      // 使用代理下载以避免CORS问题
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();
      const defaultFilename = `ai-generated-${Date.now()}.png`;
      const finalFilename = filename?.replace(/[^a-zA-Z0-9-_.]/g, '_') || defaultFilename;

      saveAs(blob, finalFilename);
    } catch (error) {
      console.error('❌ 单图下载失败:', error);
      throw error;
    }
  }

  /**
   * 批量下载图片为ZIP
   */
  static async downloadAsZip(
    tasks: TaskData[],
    selectedIds: Set<string>,
    onSuccess?: (count: number) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    if (selectedIds.size === 0) return;

    const zip = new JSZip();
    const folder = zip.folder('generated-images');
    let index = 0;

    try {
      for (const id of selectedIds) {
        const task = tasks.find(t => t.id === id);
        if (task?.resultImages?.[0]) {
          const response = await fetch(task.resultImages[0]);
          const blob = await response.blob();
          const filename = `${task.productName || 'image'}-${index + 1}.png`;
          folder?.file(filename.replace(/[^a-zA-Z0-9-_.]/g, '_'), blob);
          index++;
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `ai-generated-${Date.now()}.zip`);

      onSuccess?.(selectedIds.size);
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  }

  /**
   * 获取已完成的任务数量
   */
  static getCompletedTaskCount(tasks: TaskData[]): number {
    return tasks.filter(t => t.status === 'completed' && t.resultImages?.[0]).length;
  }

  /**
   * 获取已完成的任务ID列表
   */
  static getCompletedTaskIds(tasks: TaskData[]): string[] {
    return tasks.filter(t => t.status === 'completed' && t.resultImages?.[0]).map(t => t.id);
  }
}
