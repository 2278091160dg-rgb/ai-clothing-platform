/**
 * useFeishuTaskManagement - 飞书任务管理 Hook
 * 基于飞书Bitable + N8N的任务流程
 *
 * 拆分后的结构：
 * - use-task-polling.ts: 轮询逻辑
 * - feishu-task-api.ts: API 服务
 */

import { useState, useCallback } from 'react';
import { useTaskPolling } from './use-task-polling';
import { FeishuTaskAPI } from '@/lib/services/feishu-task-api';

export interface Task {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultUrl?: string;
  error?: string;
  createdAt: Date;
}

export function useFeishuTaskManagement() {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  // 轮询逻辑
  const { startPolling, stopPolling, isPolling } = useTaskPolling({
    onComplete: () => {
      console.log('[FeishuTaskManagement] Task completed');
    },
    onError: error => {
      console.error('[FeishuTaskManagement] Task error:', error);
    },
  });

  // 执行完整流程：上传 -> 创建任务 -> 轮询
  const executeGeneration = useCallback(
    async (
      productImage: File,
      sceneImage: File | null,
      prompt: string,
      negativePrompt: string,
      ratio: string,
      model: string
    ) => {
      try {
        // 重置当前任务状态
        setCurrentTask({
          id: Date.now().toString(),
          status: 'pending',
          progress: 0,
          createdAt: new Date(),
        });

        // 第一步：上传并创建任务
        const { recordId } = await FeishuTaskAPI.executeUploadAndCreate(
          productImage,
          sceneImage,
          prompt,
          negativePrompt,
          ratio,
          model
        );

        // 更新进度
        setCurrentTask(prev =>
          prev ? { ...prev, id: recordId, progress: 30, status: 'processing' } : null
        );

        // 第二步：开始轮询
        startPolling(recordId, FeishuTaskAPI.checkTaskStatus, setCurrentTask);

        return { success: true, recordId };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : '未知错误';
        setCurrentTask({
          id: Date.now().toString(),
          status: 'failed',
          progress: 0,
          error: errorMsg,
          createdAt: new Date(),
        });
        return { success: false, error: errorMsg };
      }
    },
    [startPolling]
  );

  // 重置任务
  const resetTask = useCallback(() => {
    stopPolling();
    setCurrentTask(null);
  }, [stopPolling]);

  return {
    currentTask,
    executeGeneration,
    resetTask,
    isPolling,
  };
}
