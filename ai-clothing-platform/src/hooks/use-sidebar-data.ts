/**
 * useSidebarData - 侧边栏数据处理 Hook
 *
 * 负责任务的过滤、排序和分组
 */

import { useMemo } from 'react';
import type { TaskData } from '@/lib/types';
import type { BatchObject } from '@/hooks/use-canvas-view-mode';

interface UseSidebarDataOptions {
  tasks: TaskData[];
  hiddenTaskIds?: Set<string>;
}

interface UseSidebarDataReturn {
  webTasks: TaskData[];
  tableBatches: BatchObject[];
  hiddenWebTaskCount: number;
}

/**
 * 将表格端任务按批次分组
 */
function groupTasksIntoBatches(tasks: TaskData[]): BatchObject[] {
  return tasks.reduce((acc, task) => {
    const batchId =
      (task as TaskData & { batchId?: string }).batchId ||
      `${task.prompt}-${new Date(task.createdAt).getMinutes()}`;

    const existingBatch = acc.find(b => b.id === batchId);
    if (existingBatch) {
      const imageUrl =
        task.resultImages?.[0] ||
        (typeof task.productImage === 'string' ? task.productImage : undefined) ||
        '';
      if (imageUrl) {
        existingBatch.images.push({
          id: task.id,
          url: imageUrl,
          prompt: task.prompt,
          productName: task.productName,
          createdAt: task.createdAt,
          source: task.source,
          batchId,
        });
      }
      if (task.status === 'completed') {
        existingBatch.status = 'completed';
        existingBatch.progress = 100;
      } else if (task.status === 'processing') {
        existingBatch.status = 'processing';
        existingBatch.progress = Math.max(existingBatch.progress, task.progress);
      }
    } else {
      const imageUrl =
        task.resultImages?.[0] ||
        (typeof task.productImage === 'string' ? task.productImage : undefined) ||
        '';
      acc.push({
        id: batchId,
        prompt: task.prompt,
        status: task.status as 'pending' | 'processing' | 'completed',
        progress: task.progress,
        images: imageUrl
          ? [
              {
                id: task.id,
                url: imageUrl,
                prompt: task.prompt,
                productName: task.productName,
                createdAt: task.createdAt,
                source: task.source,
                batchId,
              },
            ]
          : [],
      });
    }
    return acc;
  }, [] as BatchObject[]);
}

export function useSidebarData({
  tasks,
  hiddenTaskIds = new Set(),
}: UseSidebarDataOptions): UseSidebarDataReturn {
  const webTasks = useMemo(() => {
    const filtered = tasks.filter(
      t => (t.source === 'web' || t.type === 'web') && !hiddenTaskIds.has(t.id)
    );

    const sorted = [...filtered].sort((a, b) => {
      const isProcessingA =
        a.status === 'processing' || a.status === 'generating' || a.status === 'pending';
      const isProcessingB =
        b.status === 'processing' || b.status === 'generating' || b.status === 'pending';

      if (isProcessingA && !isProcessingB) return -1;
      if (!isProcessingA && isProcessingB) return 1;

      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA;
    });

    return sorted;
  }, [tasks, hiddenTaskIds]);

  const tableTasks = useMemo(() => {
    return tasks.filter(t => t.source !== 'web' && t.type !== 'web');
  }, [tasks]);

  const hiddenWebTaskCount = useMemo(() => {
    return tasks.filter(t => (t.source === 'web' || t.type === 'web') && hiddenTaskIds.has(t.id))
      .length;
  }, [tasks, hiddenTaskIds]);

  const tableBatches = useMemo(() => groupTasksIntoBatches(tableTasks), [tableTasks]);

  return { webTasks, tableBatches, hiddenWebTaskCount };
}
