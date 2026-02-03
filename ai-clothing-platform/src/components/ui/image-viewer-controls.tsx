/**
 * ImageViewerControls - 图片查看器控制栏组件
 *
 * 功能：
 * - 缩放控制（放大/缩小/重置）
 * - 下载按钮
 * - 对比按钮
 * - 对比源切换（素材A/素材B）
 * - 缩放提示
 *
 * 优化后的UI设计：
 * - 渐变背景和按钮效果
 * - 更精致的圆角和阴影
 * - 更好的视觉层次
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
      {/* 右上角下载按钮 - 优化样式 */}
      <button
        onClick={onDownload}
        className="absolute top-4 right-4 w-10 h-10 bg-gradient-to-br from-white/10 to-white/20 hover:from-white/20 hover:to-white/30 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 shadow-xl"
        title="下载图片"
      >
        <Download size={18} />
      </button>

      {/* 底部控制栏 - 优化设计 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-black/60 via-black/40 to-black/60 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3 text-white shadow-2xl ring-1 ring-white/10">
        {/* 缩小按钮 - 增强视觉 */}
        <button
          onClick={handleZoomOut}
          disabled={scale <= minScale}
          className="w-11 h-11 rounded-full bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/15 border border-white/20 shadow-md"
          title="缩小"
        >
          <Minus size={18} />
        </button>

        {/* 缩放比例显示 - 优化样式 */}
        <div className="min-w-[70px] text-center bg-white/10 rounded-lg px-3 py-1.5 border border-white/20">
          <span className="text-sm font-semibold tracking-wide">
            {Math.round(scale * 100)}%
          </span>
        </div>

        {/* 放大按钮 - 增强视觉 */}
        <button
          onClick={handleZoomIn}
          disabled={scale >= maxScale}
          className="w-11 h-11 rounded-full bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/15 border border-white/20 shadow-md"
          title="放大"
        >
          <Plus size={18} />
        </button>

        {/* 分隔线 - 优化样式 */}
        <div className="w-px h-7 bg-gradient-to-b from-white/30 to-transparent" />

        {/* 重置按钮 - 增强视觉 */}
        <button
          onClick={resetView}
          className="w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 flex items-center justify-center transition-all hover:border-white/30"
          title="重置视图"
        >
          <RotateCcw size={18} />
        </button>

        {/* 分隔线 - 优化样式 */}
        <div className="w-px h-7 bg-gradient-to-b from-white/30 to-transparent" />

        {/* 对比区域 - 精致设计 */}
        {(hasOriginalImage || hasSceneImage) && (
          <div className="flex items-center gap-2">
            {/* 对比源切换 - 当有多个对比源时显示 */}
            {hasMultipleCompareSources && onCompareSourceChange && (
              <div className="flex gap-1.5 bg-white/5 rounded-lg p-1 border border-white/10">
                <button
                  onClick={() => onCompareSourceChange('product')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    compareSource === 'product'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  title="对比素材A"
                >
                  素材A
                </button>
                <button
                  onClick={() => onCompareSourceChange('scene')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    compareSource === 'scene'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  title="对比素材B"
                >
                  素材B
                </button>
              </div>
            )}

            {/* 对比按钮 - 渐变效果 */}
            <button
              onMouseDown={onCompareStart}
              onMouseUp={onCompareEnd}
              onMouseLeave={onCompareEnd}
              onTouchStart={onCompareStart}
              onTouchEnd={onCompareEnd}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                isComparing
                  ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/30 hover:border-white/50'
              }`}
              title={`按住对比${hasMultipleCompareSources ? (compareSource === 'product' ? '素材A' : '素材B') : '原图'}`}
            >
              {isComparing ? '松开恢复' : '按住对比'}
            </button>
          </div>
        )}
      </div>

      {/* 缩放提示 - 优化样式 */}
      {scale > 1 && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500/80 to-cyan-500/80 backdrop-blur-md rounded-full px-5 py-2.5 text-white text-sm font-medium border border-white/20 shadow-xl">
          🔍 {Math.round(scale * 100)}% | 滚轮缩放 | 拖拽移动
        </div>
      )}
    </>
  );
}
