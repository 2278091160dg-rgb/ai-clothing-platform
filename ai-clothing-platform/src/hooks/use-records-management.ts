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

import { useState, useCallback, useRef, useEffect } from 'react';
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
  hideTask: (taskId: string) => void;
  unhideTask: (taskId: string) => void;
  isTaskHidden: (taskId: string) => boolean;
  hiddenTaskIds: Set<string>;
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
  const [hiddenTaskIds, setHiddenTaskIds] = useState<Set<string>>(new Set()); // 隐藏的任务ID

  const isLoadingRecords = useRef(false);
  const previousCompletedIds = useRef<Set<string>>(new Set());
  const isFirstFetch = useRef(true); // 标记是否是第一次获取
  const historyTasksRef = useRef<HistoryTask[]>([]); // 存储 historyTasks 的最新值，避免循环依赖
  const callbacksRef = useRef({
    onNewCompletedTask,
    onHistoryTasksChange,
  }); // 存储回调函数，避免它们成为依赖项

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
      // 只有在第一次获取完成后，才触发回调
      if (!isFirstFetch.current) {
        justCompletedTaskIds.forEach(taskId => {
          const completedTask = deduplicatedTasks.find(t => t.id === taskId);

          if (
            completedTask &&
            completedTask.resultImages &&
            completedTask.resultImages.length > 0
          ) {
            const newRecord: HistoryRecord = {
              id: completedTask.id,
              original: completedTask.productImagePreview || '',
              sceneImage: completedTask.sceneImagePreview,
              generated: completedTask.resultImages[0],
              timestamp: Date.now(),
              prompt: completedTask.prompt,
            };

            callbacksRef.current.onNewCompletedTask?.(completedTask, newRecord);
          }
        });
      } else {
        // 第一次获取时，只初始化 previousCompletedIds，不触发回调
        isFirstFetch.current = false;
      }

      // 更新已完成的任务集合
      previousCompletedIds.current = newCompletedIds;

      // 合并：Feishu 数据 + 本地处理中的任务（使用 ref 中的值）
      const mergedTasks = RecordsAPI.mergeLocalAndFeishuTasks(
        deduplicatedTasks,
        historyTasksRef.current
      );

      // 超严格的变化检测：不仅检查ID，还要检查每个任务的关键状态
      const shouldUpdate = (): boolean => {
        // 数量不同，必须更新
        if (historyTasksRef.current.length !== mergedTasks.length) return true;

        // 检查每个任务是否相同
        for (let i = 0; i < mergedTasks.length; i++) {
          const oldTask = historyTasksRef.current[i];
          const newTask = mergedTasks[i];

          // ID 不同，必须更新
          if (oldTask.id !== newTask.id) return true;

          // 状态不同，需要更新
          if (oldTask.status !== newTask.status) return true;

          // 进度变化超过 5%，需要更新
          if (Math.abs(oldTask.progress - newTask.progress) > 5) return true;

          // 结果图从无到有，需要更新
          const hadResult = oldTask.resultImages && oldTask.resultImages.length > 0;
          const hasResult = newTask.resultImages && newTask.resultImages.length > 0;
          if (!hadResult && hasResult) return true;
        }

        return false; // 没有实质性变化
      };

      if (shouldUpdate()) {
        console.log('🔄 [DEBUG] 任务列表实质性变化，触发更新');
        setHistoryTasks(mergedTasks);
        // callbacksRef.current.onHistoryTasksChange?.(mergedTasks);
      } else {
        console.log('✅ [DEBUG] 无实质性变化，跳过更新');
      }
    } catch (error) {
      console.error('❌ 获取记录失败:', error);
    } finally {
      isLoadingRecords.current = false;
    }
  }, [isHistoryCleared]); // 只依赖 isHistoryCleared，避免循环依赖

  // 同步更新 ref，避免闭包陷阱
  useEffect(() => {
    historyTasksRef.current = historyTasks;
  }, [historyTasks]);

  useEffect(() => {
    callbacksRef.current = {
      onNewCompletedTask,
      onHistoryTasksChange,
    };
  }, [onNewCompletedTask, onHistoryTasksChange]);

  // 检查是否有处理中的任务
  const hasProcessingTasks = historyTasks.some(
    t => t.status === 'processing' || t.status === 'pending'
  );

  // 初始获取：组件挂载时获取一次数据
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (!hasInitializedRef.current && historyTasks.length === 0 && !isHistoryCleared) {
      hasInitializedRef.current = true;
      fetchRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在挂载时执行一次

  // 轮询逻辑：只在有处理中任务时才启用轮询
  useRecordsPolling({
    onPoll: fetchRecords,
    interval: 5000,
    enabled: !isHistoryCleared && hasProcessingTasks,
  });

  /**
   * 清空历史
   */
  const clearHistory = useCallback(() => {
    setIsHistoryCleared(true);
    setHistoryTasks([]);
    historyTasksRef.current = [];
    callbacksRef.current.onHistoryTasksChange?.([]);
  }, []);

  /**
   * 重置历史
   */
  const resetHistory = useCallback(() => {
    setHistoryTasks([]);
    historyTasksRef.current = [];
    setIsHistoryCleared(false);
    callbacksRef.current.onHistoryTasksChange?.([]);
  }, []);

  /**
   * 添加任务到历史记录（用于临时任务）
   */
  const addTask = useCallback((task: HistoryTask) => {
    setHistoryTasks(prev => {
      const newTasks = [task, ...prev];
      historyTasksRef.current = newTasks;
      return newTasks;
    });
  }, []);

  /**
   * 隐藏任务
   */
  const hideTask = useCallback((taskId: string) => {
    setHiddenTaskIds(prev => new Set([...prev, taskId]));
    console.log('👁️ 隐藏任务:', taskId);
  }, []);

  /**
   * 取消隐藏任务
   */
  const unhideTask = useCallback((taskId: string) => {
    setHiddenTaskIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
    console.log('👁️ 显示任务:', taskId);
  }, []);

  /**
   * 检查任务是否被隐藏
   */
  const isTaskHidden = useCallback(
    (taskId: string) => {
      return hiddenTaskIds.has(taskId);
    },
    [hiddenTaskIds]
  );

  return {
    historyTasks,
    isHistoryCleared,
    fetchRecords,
    clearHistory,
    resetHistory,
    addTask,
    hideTask,
    unhideTask,
    isTaskHidden,
    hiddenTaskIds,
  };
}

export type { UseRecordsManagementOptions, UseRecordsManagementReturn };
