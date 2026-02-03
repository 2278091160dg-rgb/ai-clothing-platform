/**
 * usePageHandlers - 主页面事件处理 Hook
 *
 * 提取主页面的事件处理逻辑，包括：
 * - 图片点击处理
 * - 批次点击处理
 * - 登出处理
 * - 登录配置保存
 * - 生成任务处理
 */

import { useCallback } from 'react';
import type { ImageItem, BatchObject } from './use-canvas-view-mode';
import type { LoginConfig } from '@/config/login-defaults';
import type { GenerationMode } from '@/components/workspace/params-panel-constants';

interface UsePageHandlersResult {
  handleImageClick: (
    image: ImageItem,
    selectedImages: ImageItem[],
    callbacks: {
      toggleImageSelection: (image: ImageItem) => void;
      setSingleImage: (image: ImageItem) => void;
      setViewMode: (mode: 'single' | 'grid') => void;
    }
  ) => void;
  handleBatchClick: (
    batch: BatchObject,
    callbacks: {
      setActiveBatch: (batch: BatchObject) => void;
      setViewMode: (mode: 'single' | 'grid') => void;
      clearSelection: () => void;
    }
  ) => void;
  handleModeChange: (
    newMode: GenerationMode,
    callbacks: {
      setMode: (mode: GenerationMode) => void;
      setPrompt: (prompt: string) => void;
    }
  ) => void;
}

/**
 * 主页面事件处理 Hook
 */
export function usePageHandlers(): UsePageHandlersResult {
  /**
   * 处理图片点击事件
   */
  const handleImageClick = useCallback(
    (
      image: ImageItem,
      selectedImages: ImageItem[],
      callbacks: {
        toggleImageSelection: (image: ImageItem) => void;
        setSingleImage: (image: ImageItem) => void;
        setViewMode: (mode: 'single' | 'grid') => void;
      }
    ) => {
      const isSelected = selectedImages.some(img => img.id === image.id);
      callbacks.toggleImageSelection(image);

      if (!isSelected) {
        callbacks.setSingleImage(image);
        callbacks.setViewMode('single');
      } else if (selectedImages.length <= 1) {
        callbacks.setViewMode('single');
      }
    },
    []
  );

  /**
   * 处理批次点击事件
   */
  const handleBatchClick = useCallback(
    (
      batch: BatchObject,
      callbacks: {
        setActiveBatch: (batch: BatchObject) => void;
        setViewMode: (mode: 'single' | 'grid') => void;
        clearSelection: () => void;
      }
    ) => {
      callbacks.setActiveBatch(batch);
      callbacks.setViewMode('grid');
      callbacks.clearSelection();
    },
    []
  );

  /**
   * 处理模式切换事件
   */
  const handleModeChange = useCallback(
    (
      newMode: GenerationMode,
      callbacks: {
        setMode: (mode: GenerationMode) => void;
        setPrompt: (prompt: string) => void;
      }
    ) => {
      callbacks.setMode(newMode);
      callbacks.setPrompt('');
    },
    []
  );

  return {
    handleImageClick,
    handleBatchClick,
    handleModeChange,
  };
}

/**
 * 登出处理函数
 */
export async function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('登出失败:', error);
    }
    window.location.href = '/login';
  }
}

/**
 * 登录配置保存函数
 */
export async function saveLoginConfig(
  newConfig: LoginConfig,
  onSuccess?: (config: LoginConfig) => void,
  onError?: (message: string) => void
) {
  try {
    const res = await fetch('/api/login-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      const errorMsg = data.details || data.error || '保存失败，请重试';
      console.error('Save failed:', errorMsg);
      onError?.(errorMsg);
      return;
    }

    onSuccess?.(data.data);
    alert(`✅ ${data.message || '登录页面配置已保存成功！'}`);
  } catch (error) {
    console.error('Save login config error:', error);
    const errorMessage = `❌ 保存配置失败：${error instanceof Error ? error.message : '未知错误'}\n\n请检查网络连接或稍后重试。`;
    onError?.(errorMessage);
  }
}
