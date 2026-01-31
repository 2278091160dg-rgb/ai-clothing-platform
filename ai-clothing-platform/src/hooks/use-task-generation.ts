/**
 * useTaskGeneration - 任务生成 Hook
 *
 * 功能：
 * - 处理生成按钮点击
 * - 构建 FormData 并发送到 API
 * - Optimistic UI: 立即添加临时任务
 * - 管理生成状态和超时
 *
 * 拆分后的结构：
 * - task-generation-utils.ts: 工具函数
 */

import { useState, useCallback, useRef } from 'react';
import {
  buildTaskFormData,
  createTempTask,
  validateGenerateParams,
  type GenerateParams,
} from '@/lib/utils/task-generation-utils';
import type { HistoryTask } from '@/lib/types/history.types';

interface UseTaskGenerationOptions {
  onTaskStart?: (tempTask: HistoryTask) => void;
  onTaskSuccess?: (recordId: string, tempId: string) => void;
  onTaskError?: (tempId: string, error: string) => void;
  onTaskComplete?: (recordId: string) => void;
}

interface UseTaskGenerationReturn {
  isGenerating: boolean;
  pendingTaskId: string | null;
  generateTask: (params: GenerateParams) => Promise<void>;
  clearPendingTask: () => void;
}

/**
 * 任务生成 Hook
 */
export function useTaskGeneration({
  onTaskStart,
  onTaskSuccess,
  onTaskError,
  onTaskComplete,
}: UseTaskGenerationOptions = {}): UseTaskGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 清除超时定时器
   */
  const clearTimeoutRef = useCallback(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  }, []);

  /**
   * 生成任务
   */
  const generateTask = useCallback(
    async (params: GenerateParams) => {
      // 验证参数
      const validationError = validateGenerateParams(params);
      if (validationError) {
        alert(validationError);
        return;
      }

      // 清除之前的超时定时器
      clearTimeoutRef();

      // 立即设置 loading 状态
      setIsGenerating(true);

      // Optimistic UI: 立即在历史记录顶部添加一个占位任务
      const tempId = `temp-${Date.now()}`;
      const tempTask = createTempTask(params, tempId);

      // 调用回调添加临时任务
      onTaskStart?.(tempTask);

      try {
        // 构建 FormData
        const formData = buildTaskFormData(params);

        // 发送 fetch 请求
        const response = await fetch('/api/proxy', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          const recordId = data.feishu_record_id;
          setPendingTaskId(recordId);

          // 调用回调处理成功
          onTaskSuccess?.(recordId, tempId);

          // 设置安全超时：如果2分钟后任务还没完成，自动解除 loading 状态
          loadingTimeoutRef.current = setTimeout(() => {
            console.warn('⚠️ Loading 状态超时，自动解除');
            setIsGenerating(false);
            setPendingTaskId(null);
            onTaskComplete?.(recordId);
          }, 120000); // 2 分钟超时
        } else {
          // 失败时解除所有状态
          setIsGenerating(false);
          const errorMsg = data.details || data.error || '未知错误';
          onTaskError?.(tempId, errorMsg);
          alert(`❌ 请求失败: ${errorMsg}`);
        }
      } catch (error) {
        console.error('❌ 请求失败:', error);
        setIsGenerating(false);
        const errorMsg = error instanceof Error ? error.message : '未知错误';
        onTaskError?.(tempId, errorMsg);
        alert(`请求失败: ${errorMsg}`);
      }
    },
    [onTaskStart, onTaskSuccess, onTaskError, onTaskComplete, clearTimeoutRef]
  );

  /**
   * 清除待处理任务
   */
  const clearPendingTask = useCallback(() => {
    setPendingTaskId(null);
    setIsGenerating(false);
    clearTimeoutRef();
  }, [clearTimeoutRef]);

  return {
    isGenerating,
    pendingTaskId,
    generateTask,
    clearPendingTask,
  };
}

export type { GenerateParams, UseTaskGenerationOptions, UseTaskGenerationReturn };
