/**
 * useSidebarDownload - 侧边栏下载功能 Hook
 *
 * 负责批量下载和全部下载功能
 */

import { useCallback } from 'react';
import type { TaskData } from '@/lib/types';
import { BatchDownloadService } from '@/lib/services/batch-download.service';

interface UseSidebarDownloadOptions {
  webTasks: TaskData[];
}

interface UseSidebarDownloadReturn {
  handleBatchDownload: (selectedImageIds: string[]) => Promise<void>;
  handleDownloadAll: () => Promise<void>;
}

export function useSidebarDownload({
  webTasks,
}: UseSidebarDownloadOptions): UseSidebarDownloadReturn {
  const handleBatchDownload = useCallback(
    async (selectedImageIds: string[]) => {
      const selectedSet = new Set(selectedImageIds);
      if (selectedSet.size === 0) {
        alert('请先选择要下载的图片');
        return;
      }

      try {
        await BatchDownloadService.downloadAsZip(
          webTasks,
          selectedSet,
          count => alert(`✅ 成功下载 ${count} 张图片`),
          error => alert(`❌ 下载失败: ${error.message}`)
        );
      } catch (error) {
        console.error('批量下载失败:', error);
      }
    },
    [webTasks]
  );

  const handleDownloadAll = useCallback(async () => {
    const completedTaskIds = BatchDownloadService.getCompletedTaskIds(webTasks);
    if (completedTaskIds.length === 0) {
      alert('没有可下载的已完成图片');
      return;
    }

    const confirmed = confirm(`确定要下载全部 ${completedTaskIds.length} 张图片吗？`);
    if (!confirmed) return;

    try {
      await BatchDownloadService.downloadAsZip(
        webTasks,
        new Set(completedTaskIds),
        count => alert(`✅ 成功下载 ${count} 张图片`),
        error => alert(`❌ 下载失败: ${error.message}`)
      );
    } catch (error) {
      console.error('下载全部失败:', error);
    }
  }, [webTasks]);

  return { handleBatchDownload, handleDownloadAll };
}
