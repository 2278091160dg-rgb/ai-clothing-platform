/**
 * useImageZoom - 图片缩放和拖拽逻辑 Hook
 *
 * 功能：
 * - 滚轮缩放
 * - 按钮缩放
 * - 拖拽移动（缩放>1时）
 * - 重置视图
 */

import { useState, useCallback, useEffect } from 'react';

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const SCALE_STEP = 0.25;

export interface ImageZoomState {
  scale: number;
  position: { x: number; y: number };
  isDragging: boolean;
}

export interface ImageZoomActions {
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleWheel: (e: React.WheelEvent) => void;
  handleDragStart: (e: React.MouseEvent) => void;
  handleDragMove: (e: React.MouseEvent) => void;
  handleDragEnd: () => void;
  resetView: () => void;
}

export function useImageZoom() {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 调试：监听 scale 变化
  useEffect(() => {
    console.log('🎯 Scale updated:', scale);
  }, [scale]);

  /**
   * 重置视图
   */
  const resetView = useCallback(() => {
    console.log('🔄 Resetting view');
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  /**
   * 缩放处理
   */
  const handleZoomIn = useCallback(() => {
    console.log('➕ handleZoomIn called');
    setScale(prev => {
      const newScale = Math.min(prev + SCALE_STEP, MAX_SCALE);
      console.log('➕ Scale changing from', prev, 'to', newScale);
      return newScale;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    console.log('➖ handleZoomOut called');
    setScale(prev => {
      const newScale = Math.max(prev - SCALE_STEP, MIN_SCALE);
      console.log('➖ Scale changing from', prev, 'to', newScale);
      return newScale;
    });
  }, []);

  /**
   * 滚轮缩放
   */
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    console.log('🖱️ Wheel event, deltaY:', e.deltaY);
    const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
    setScale(prev => {
      const newScale = Math.min(Math.max(prev + delta, MIN_SCALE), MAX_SCALE);
      console.log('🖱️ Scale changing from', prev, 'to', newScale);
      return newScale;
    });
  }, []);

  /**
   * 拖拽开始
   */
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (scale > 1) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      }
    },
    [scale, position]
  );

  /**
   * 拖拽移动
   */
  const handleDragMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart]
  );

  /**
   * 拖拽结束
   */
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    state: { scale, position, isDragging },
    actions: {
      handleZoomIn,
      handleZoomOut,
      handleWheel,
      handleDragStart,
      handleDragMove,
      handleDragEnd,
      resetView,
    },
    constants: { MIN_SCALE, MAX_SCALE, SCALE_STEP },
  };
}
