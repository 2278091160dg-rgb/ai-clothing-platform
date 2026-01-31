/**
 * useResultPanel - 结果面板状态和逻辑 Hook
 */

import { useCallback } from 'react';
import type { TaskData } from '@/lib/types';

export interface ResultState {
  resultUrl: string | undefined;
  productImage: string | undefined;
  hasResult: boolean;
  showWelcome: boolean;
  showComparison: boolean;
}

export function useResultPanel(
  tasks: TaskData[],
  isGenerating: boolean
): ResultState & { handleDownload: () => void } {
  const currentTask = tasks[0];

  // 严格校验 resultUrl
  const rawResultUrl = currentTask?.resultImages?.[0];
  const resultUrl =
    rawResultUrl && typeof rawResultUrl === 'string' && rawResultUrl.trim().length > 0
      ? rawResultUrl
      : undefined;

  const productImage =
    typeof currentTask?.productImage === 'string' && currentTask.productImage.trim().length > 0
      ? currentTask.productImage
      : undefined;

  // 核心状态计算
  const isProcessing = isGenerating;
  const hasResult = !isProcessing && !!resultUrl;
  const showWelcome = !isProcessing && !hasResult;
  const showComparison = hasResult && !!resultUrl && !!productImage;

  // 调试日志
  console.log('[ResultPanel] Render state:', {
    isGenerating,
    isProcessing,
    hasResult,
    showWelcome,
    currentTaskId: currentTask?.id,
    currentTaskStatus: currentTask?.status,
    rawResultUrl,
    resultUrl,
    hasResultImages: !!currentTask?.resultImages?.[0],
    isResultUrlValid: !!resultUrl,
    tasksCount: tasks.length,
  });

  // 下载图片
  const handleDownload = useCallback(async () => {
    if (resultUrl) {
      try {
        // 使用 image-proxy 代理接口
        const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(resultUrl)}`;
        const response = await fetch(proxyUrl);
        const blob = await response.blob();

        // 创建下载链接
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ai-generated-${Date.now()}.png`;
        link.click();

        // 释放内存
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error('下载失败:', error);
        alert('下载失败，请重试');
      }
    }
  }, [resultUrl]);

  return {
    resultUrl,
    productImage,
    hasResult,
    showWelcome,
    showComparison,
    handleDownload,
  };
}
