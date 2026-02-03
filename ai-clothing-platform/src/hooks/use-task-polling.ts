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
  timeoutMs?: number; // 轮询超时时间（毫秒），默认 10 分钟
}

export function useTaskPolling(options?: UseTaskPollingOptions) {
  const [pollingIntervalId, setPollingIntervalId] = useState<NodeJS.Timeout | null>(null);
  const pollingRecordIdRef = useRef<string | null>(null);
  const pollingStartTimeRef = useRef<number | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  // 默认超时时间：10 分钟
  const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  // 开始轮询任务状态
  const startPolling = useCallback(
    (
      recordId: string,
      checkStatus: TaskStatusUpdate,
      updateTask: (updater: (prev: Task | null) => Task | null) => void
    ) => {
      // 清除之前的轮询和超时
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
      }
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }

      pollingRecordIdRef.current = recordId;
      pollingStartTimeRef.current = Date.now();

      // 设置超时定时器
      timeoutIdRef.current = setTimeout(() => {
        console.warn(`⚠️ 任务轮询超时 (${timeoutMs / 1000}秒): ${recordId}`);
        updateTask(prev => {
          if (!prev) return null;
          return {
            ...prev,
            status: 'failed',
            error: `任务超时 (${timeoutMs / 60000}分钟未完成)`,
          };
        });
        // 停止轮询
        if (pollingIntervalId) {
          clearInterval(pollingIntervalId);
          setPollingIntervalId(null);
        }
        pollingRecordIdRef.current = null;
        pollingStartTimeRef.current = null;
        timeoutIdRef.current = null;
        options?.onError?.(new Error(`任务轮询超时 (${timeoutMs / 60000}分钟)`));
      }, timeoutMs);

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

          // 如果完成或失败，停止轮询和超时定时器
          if (
            status === '完成' ||
            status === 'completed' ||
            status === '失败' ||
            status === 'failed'
          ) {
            clearInterval(intervalId);
            setPollingIntervalId(null);
            if (timeoutIdRef.current) {
              clearTimeout(timeoutIdRef.current);
              timeoutIdRef.current = null;
            }
            pollingRecordIdRef.current = null;
            pollingStartTimeRef.current = null;
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
          if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
            timeoutIdRef.current = null;
          }
          pollingRecordIdRef.current = null;
          pollingStartTimeRef.current = null;
          options?.onError?.(error as Error);
        }
      }, 3000); // 每3秒轮询一次

      setPollingIntervalId(intervalId);
    },
    [pollingIntervalId, options, timeoutMs]
  );

  // 停止轮询
  const stopPolling = useCallback(() => {
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      setPollingIntervalId(null);
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    pollingRecordIdRef.current = null;
    pollingStartTimeRef.current = null;
  }, [pollingIntervalId]);

  return {
    startPolling,
    stopPolling,
    isPolling: !!pollingIntervalId,
    currentRecordId: pollingRecordIdRef.current,
  };
}
