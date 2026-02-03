/**
 * ImageViewerControls - 图片查看器控制栏组件
 *
 * 功能：
 * - 缩放控制（放大/缩小/重置）
 * - 下载按钮
 * - 对比按钮
 * - 缩放提示
 */

'use client';

import { Download, Plus, Minus, RotateCcw } from 'lucide-react';
import type { ImageZoomState, ImageZoomActions } from '@/hooks/use-image-zoom';

export interface ImageViewerControlsProps {
  zoomState: ImageZoomState;
  zoomActions: ImageZoomActions;
  hasOriginalImage: boolean;
  hasSceneImage?: boolean;
  isComparing: boolean;
  compareSource?: 'product' | 'scene';
  onCompareStart: () => void;
  onCompareEnd: () => void;
  onCompareSourceChange?: (source: 'product' | 'scene') => void;
  onDownload: () => void;
  minScale?: number;
  maxScale?: number;
}

export function ImageViewerControls({
  zoomState,
  zoomActions,
  hasOriginalImage,
  hasSceneImage = false,
  isComparing,
  compareSource = 'product',
  onCompareStart,
  onCompareEnd,
  onCompareSourceChange,
  onDownload,
  minScale = 0.5,
  maxScale = 3,
}: ImageViewerControlsProps) {
  const { scale } = zoomState;
  const { handleZoomIn, handleZoomOut, resetView } = zoomActions;

  // 是否有多个对比源
  const hasMultipleCompareSources = hasOriginalImage && hasSceneImage;

  return (
    <>
      {/* 右上角下载按钮 */}
      <button
        onClick={onDownload}
        className="absolute top-4 right-4 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 shadow-lg"
        title="下载图片"
      >
        <Download size={18} />
      </button>

      {/* 底部控制栏 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-2.5 flex items-center gap-3 text-white shadow-2xl">
        {/* 缩小按钮 */}
        <button
          onClick={handleZoomOut}
          disabled={scale <= minScale}
          className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          title="缩小"
        >
          <Minus size={18} />
        </button>

        {/* 缩放比例显示 */}
        <span className="text-sm font-mono min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>

        {/* 放大按钮 */}
        <button
          onClick={handleZoomIn}
          disabled={scale >= maxScale}
          className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          title="放大"
        >
          <Plus size={18} />
        </button>

        {/* 分隔线 */}
        <div className="w-px h-6 bg-white/20" />

        {/* 重置按钮 */}
        <button
          onClick={resetView}
          className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-all"
          title="重置视图"
        >
          <RotateCcw size={18} />
        </button>

        {/* 分隔线 */}
        <div className="w-px h-6 bg-white/20" />

        {/* 对比按钮 - 只有当有原图或场景图时才显示 */}
        {(hasOriginalImage || hasSceneImage) && (
          <div className="flex items-center gap-2">
            {/* 对比源切换 - 当有多个对比源时显示 */}
            {hasMultipleCompareSources && onCompareSourceChange && (
              <div className="flex gap-1">
                <button
                  onClick={() => onCompareSourceChange('product')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    compareSource === 'product'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title="对比素材A"
                >
                  素材A
                </button>
                <button
                  onClick={() => onCompareSourceChange('scene')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    compareSource === 'scene'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title="对比素材B"
                >
                  素材B
                </button>
              </div>
            )}

            {/* 对比按钮 */}
            <button
              onMouseDown={onCompareStart}
              onMouseUp={onCompareEnd}
              onMouseLeave={onCompareEnd}
              onTouchStart={onCompareStart}
              onTouchEnd={onCompareEnd}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                isComparing ? 'bg-blue-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={`按住对比${hasMultipleCompareSources ? (compareSource === 'product' ? '素材A' : '素材B') : '原图'}`}
            >
              {isComparing ? '松开恢复' : '按住对比'}
            </button>
          </div>
        )}
      </div>

      {/* 缩放提示 */}
      {scale > 1 && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
          缩放: {Math.round(scale * 100)}% | 滚轮缩放 | 拖拽移动
        </div>
      )}
    </>
  );
}
