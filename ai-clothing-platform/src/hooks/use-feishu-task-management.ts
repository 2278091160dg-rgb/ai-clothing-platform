/**
 * useFeishuTaskManagement - 飞书任务管理 Hook
 * 基于飞书Bitable + N8N的任务流程
 */

import { useState, useCallback, useRef } from 'react';

interface Task {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultUrl?: string;
  error?: string;
  createdAt: Date;
}

interface FeishuTaskData {
  productToken: string;
  sceneToken?: string;
  prompt: string;
  negativePrompt?: string;
  ratio: string;
  model: string;
}

export function useFeishuTaskManagement() {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [pollingIntervalId, setPollingIntervalId] = useState<NodeJS.Timeout | null>(null);
  const pollingRecordIdRef = useRef<string | null>(null);

  // 上传单个文件
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || data.code !== 0) {
      throw new Error(data.msg || '上传失败');
    }

    return data.data.file_token;
  };

  // 创建任务
  const createTask = async (taskData: FeishuTaskData): Promise<string> => {
    const response = await fetch('/api/create-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_token: taskData.productToken,
        scene_token: taskData.sceneToken,
        prompt: taskData.prompt,
        negative_prompt: taskData.negativePrompt,
        ratio: taskData.ratio,
        model: taskData.model,
      }),
    });

    const data = await response.json();
    if (!response.ok || data.code !== 0) {
      throw new Error(data.msg || '创建任务失败');
    }

    return data.data.record_id;
  };

  // 查询任务状态
  const checkTaskStatus = async (
    recordId: string
  ): Promise<{ status: string; resultUrl: string | null }> => {
    const response = await fetch(`/api/check-status?record_id=${recordId}`);
    const data = await response.json();

    if (!response.ok || data.code !== 0) {
      throw new Error(data.msg || '查询状态失败');
    }

    return {
      status: data.data.status,
      resultUrl: data.data.result_url,
    };
  };

  // 开始轮询任务状态
  const startPolling = useCallback(
    (recordId: string) => {
      // 清除之前的轮询
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
      }

      pollingRecordIdRef.current = recordId;

      const intervalId = setInterval(async () => {
        try {
          const { status, resultUrl } = await checkTaskStatus(recordId);

          setCurrentTask(prev => {
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
          }
        } catch (error) {
          console.error('轮询任务状态失败:', error);
          setCurrentTask(prev => {
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
        }
      }, 3000); // 每3秒轮询一次

      setPollingIntervalId(intervalId);
    },
    [pollingIntervalId]
  );

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

        // 第一步：并行上传图片
        const [productToken, sceneToken] = await Promise.all([
          uploadFile(productImage),
          sceneImage ? uploadFile(sceneImage) : Promise.resolve(undefined),
        ]);

        // 更新进度
        setCurrentTask(prev => (prev ? { ...prev, progress: 20 } : null));

        // 第二步：创建任务
        const recordId = await createTask({
          productToken,
          sceneToken,
          prompt,
          negativePrompt,
          ratio,
          model,
        });

        // 更新进度
        setCurrentTask(prev =>
          prev ? { ...prev, id: recordId, progress: 30, status: 'processing' } : null
        );

        // 第三步：开始轮询
        startPolling(recordId);

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

  // 停止轮询
  const stopPolling = useCallback(() => {
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      setPollingIntervalId(null);
    }
    pollingRecordIdRef.current = null;
  }, [pollingIntervalId]);

  // 重置任务
  const resetTask = useCallback(() => {
    stopPolling();
    setCurrentTask(null);
  }, [stopPolling]);

  return {
    currentTask,
    executeGeneration,
    resetTask,
    isPolling: !!pollingIntervalId,
  };
}
