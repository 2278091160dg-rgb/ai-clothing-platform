/**
 * useCanvasViewMode - 主画布视图模式管理 Hook
 *
 * 管理主画布的三种视图模式：
 * - single: 单图预览模式
 * - grid: 网格查看模式（表格端批量生成）
 * - compare: 对比模式（多图并排）
 */

import { useState, useCallback } from 'react';

export type ViewMode = 'single' | 'grid' | 'compare';

export interface ImageItem {
  id: string;
  url: string;
  prompt?: string;
  productName?: string;
  createdAt?: Date;
  source?: 'web' | 'feishu' | 'api';
  batchId?: string; // 用于表格端的批次ID
}

export interface BatchObject {
  id: string;
  images: ImageItem[];
  prompt: string;
  status: 'pending' | 'processing' | 'completed';
  progress: number;
}

interface UseCanvasViewModeReturn {
  // 视图模式
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // 单图模式
  singleImage: ImageItem | null;
  setSingleImage: (image: ImageItem | null) => void;

  // 网格模式（表格端批次）
  activeBatch: BatchObject | null;
  setActiveBatch: (batch: BatchObject | null) => void;

  // 对比模式
  selectedImages: ImageItem[];
  toggleImageSelection: (image: ImageItem) => void;
  clearSelection: () => void;
  isInCompareMode: () => boolean;

  // 工具方法
  resetView: () => void;
}

export function useCanvasViewMode(): UseCanvasViewModeReturn {
  const [viewMode, setViewMode] = useState<ViewMode>('single');

  // 单图模式状态
  const [singleImage, setSingleImage] = useState<ImageItem | null>(null);

  // 网格模式状态（表格端批次）
  const [activeBatch, setActiveBatch] = useState<BatchObject | null>(null);

  // 对比模式状态
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([]);

  /**
   * 切换图片选中状态（用于对比模式）
   */
  const toggleImageSelection = useCallback((image: ImageItem) => {
    setSelectedImages(prev => {
      const exists = prev.some(img => img.id === image.id);
      if (exists) {
        // 移除
        const newSelection = prev.filter(img => img.id !== image.id);
        // 如果没有选中的图片，退出对比模式
        if (newSelection.length < 2) {
          setViewMode('single');
        }
        return newSelection;
      } else {
        // 添加（最多4张）
        const newSelection = [...prev, image];
        if (newSelection.length >= 2) {
          setViewMode('compare');
        }
        return newSelection.slice(0, 4); // 最多对比4张
      }
    });
  }, []);

  /**
   * 清空选中
   */
  const clearSelection = useCallback(() => {
    setSelectedImages([]);
    setViewMode('single');
  }, []);

  /**
   * 判断是否在对比模式
   */
  const isInCompareMode = useCallback(() => {
    return viewMode === 'compare' && selectedImages.length >= 2;
  }, [viewMode, selectedImages]);

  /**
   * 重置视图
   */
  const resetView = useCallback(() => {
    setViewMode('single');
    setSingleImage(null);
    setActiveBatch(null);
    setSelectedImages([]);
  }, []);

  return {
    viewMode,
    setViewMode,
    singleImage,
    setSingleImage,
    activeBatch,
    setActiveBatch,
    selectedImages,
    toggleImageSelection,
    clearSelection,
    isInCompareMode,
    resetView,
  };
}
