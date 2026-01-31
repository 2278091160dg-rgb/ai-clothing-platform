/**
 * useTaskPolling - 任务轮询 Hook
 */

import { useState, useCallback, useRef } from 'react';

export interface Task {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultUrl?: string;
  error?: string;
  createdAt: Date;
}

type TaskStatusUpdate = (taskId: string) => Promise<{ status: string; resultUrl: string | null }>;

interface UseTaskPollingOptions {
  onStatusUpdate?: (status: string, resultUrl?: string) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export function useTaskPolling(options?: UseTaskPollingOptions) {
  const [pollingIntervalId, setPollingIntervalId] = useState<NodeJS.Timeout | null>(null);
  const pollingRecordIdRef = useRef<string | null>(null);

  // 开始轮询任务状态
  const startPolling = useCallback(
    (
      recordId: string,
      checkStatus: TaskStatusUpdate,
      updateTask: (updater: (prev: Task | null) => Task | null) => void
    ) => {
      // 清除之前的轮询
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
      }

      pollingRecordIdRef.current = recordId;

      const intervalId = setInterval(async () => {
        try {
          const { status, resultUrl } = await checkStatus(recordId);

          updateTask(prev => {
            if (!prev) return null;

            // 更新状态
            let newProgress = prev.progress;
            if (status === '处理中' || status === 'processing') {
              newProgress = Math.min(prev.progress + 10, 90);
            } else if (status === '完成' || status === 'completed') {
              newProgress = 100;
            }

            return {
              ...prev,
              status:
                status === '完成' || status === 'completed'
                  ? 'completed'
                  : status === '处理中' || status === 'processing'
                    ? 'processing'
                    : status === '失败' || status === 'failed'
                      ? 'failed'
                      : 'pending',
              progress: newProgress,
              ...(resultUrl && { resultUrl }),
            };
          });

          options?.onStatusUpdate?.(status, resultUrl || undefined);

          // 如果完成或失败，停止轮询
          if (
            status === '完成' ||
            status === 'completed' ||
            status === '失败' ||
            status === 'failed'
          ) {
            clearInterval(intervalId);
            setPollingIntervalId(null);
            pollingRecordIdRef.current = null;
            options?.onComplete?.();
          }
        } catch (error) {
          console.error('轮询任务状态失败:', error);
          updateTask(prev => {
            if (!prev) return null;
            return {
              ...prev,
              status: 'failed',
              error: error instanceof Error ? error.message : '未知错误',
            };
          });
          clearInterval(intervalId);
          setPollingIntervalId(null);
          pollingRecordIdRef.current = null;
          options?.onError?.(error as Error);
        }
      }, 3000); // 每3秒轮询一次

      setPollingIntervalId(intervalId);
    },
    [pollingIntervalId, options]
  );

  // 停止轮询
  const stopPolling = useCallback(() => {
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      setPollingIntervalId(null);
    }
    pollingRecordIdRef.current = null;
  }, [pollingIntervalId]);

  return {
    startPolling,
    stopPolling,
    isPolling: !!pollingIntervalId,
    currentRecordId: pollingRecordIdRef.current,
  };
}
