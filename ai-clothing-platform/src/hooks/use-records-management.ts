/**
 * useRecordsManagement - 记录管理 Hook
 *
 * 功能：
 * - 获取飞书记录列表
 * - 轮询检查任务状态
 * - 检测新完成的任务
 * - 管理历史任务列表
 *
 * 拆分后的结构：
 * - use-records-polling.ts: 轮询逻辑
 * - records-api.ts: API 服务
 */

import { useState, useCallback, useRef } from 'react';
import type { HistoryTask, HistoryRecord } from '@/lib/types/history.types';
import { RecordsAPI } from '@/lib/services/records-api';
import { useRecordsPolling } from './use-records-polling';

interface UseRecordsManagementOptions {
  onNewCompletedTask?: (task: HistoryTask, record: HistoryRecord) => void;
  onHistoryTasksChange?: (tasks: HistoryTask[]) => void;
}

interface UseRecordsManagementReturn {
  historyTasks: HistoryTask[];
  isHistoryCleared: boolean;
  fetchRecords: () => Promise<void>;
  clearHistory: () => void;
  resetHistory: () => void;
  addTask: (task: HistoryTask) => void;
}

/**
 * 记录管理 Hook
 */
export function useRecordsManagement({
  onNewCompletedTask,
  onHistoryTasksChange,
}: UseRecordsManagementOptions = {}): UseRecordsManagementReturn {
  const [historyTasks, setHistoryTasks] = useState<HistoryTask[]>([]);
  const [isHistoryCleared, setIsHistoryCleared] = useState(false);

  const isLoadingRecords = useRef(false);
  const previousCompletedIds = useRef<Set<string>>(new Set());

  /**
   * 获取记录列表
   */
  const fetchRecords = useCallback(async () => {
    if (isLoadingRecords.current || isHistoryCleared) {
      return;
    }

    isLoadingRecords.current = true;

    try {
      const deduplicatedTasks = await RecordsAPI.fetchAndTransformRecords();

      // 检测新完成的任务
      const { newCompletedIds, justCompletedTaskIds } = RecordsAPI.detectNewCompletedTasks(
        deduplicatedTasks,
        previousCompletedIds.current
      );

      // 处理新完成的任务
      justCompletedTaskIds.forEach(taskId => {
        const completedTask = deduplicatedTasks.find(t => t.id === taskId);

        if (completedTask && completedTask.resultImages && completedTask.resultImages.length > 0) {
          const newRecord: HistoryRecord = {
            id: completedTask.id,
            original: completedTask.productImagePreview || '',
            sceneImage: completedTask.sceneImagePreview,
            generated: completedTask.resultImages[0],
            timestamp: Date.now(),
            prompt: completedTask.prompt,
          };

          onNewCompletedTask?.(completedTask, newRecord);
        }
      });

      // 更新已完成的任务集合
      previousCompletedIds.current = newCompletedIds;

      // 合并：Feishu 数据 + 本地处理中的任务
      const mergedTasks = RecordsAPI.mergeLocalAndFeishuTasks(deduplicatedTasks, historyTasks);

      setHistoryTasks(mergedTasks);
      onHistoryTasksChange?.(mergedTasks);
    } catch (error) {
      console.error('❌ 获取记录失败:', error);
    } finally {
      isLoadingRecords.current = false;
    }
  }, [isHistoryCleared, historyTasks, onNewCompletedTask, onHistoryTasksChange]);

  // 轮询逻辑
  useRecordsPolling({
    onPoll: fetchRecords,
    interval: 5000,
    enabled: !isHistoryCleared,
  });

  /**
   * 清空历史
   */
  const clearHistory = useCallback(() => {
    setIsHistoryCleared(true);
    setHistoryTasks([]);
    onHistoryTasksChange?.([]);
  }, [onHistoryTasksChange]);

  /**
   * 重置历史
   */
  const resetHistory = useCallback(() => {
    setHistoryTasks([]);
    setIsHistoryCleared(false);
    onHistoryTasksChange?.([]);
  }, [onHistoryTasksChange]);

  /**
   * 添加任务到历史记录（用于临时任务）
   */
  const addTask = useCallback((task: HistoryTask) => {
    setHistoryTasks(prev => [task, ...prev]);
  }, []);

  return {
    historyTasks,
    isHistoryCleared,
    fetchRecords,
    clearHistory,
    resetHistory,
    addTask,
  };
}

export type { UseRecordsManagementOptions, UseRecordsManagementReturn };
