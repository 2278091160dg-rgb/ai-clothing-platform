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
 * 精致UI设计：
 * - 高级渐变和毛玻璃效果
 * - 优雅的圆角和阴影
 * - 清晰的视觉层次
 * - 流畅的交互动画
 */

'use client';

import { Download, Plus, Minus, RotateCcw, Layers, ImageIcon } from 'lucide-react';
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

  // 调试：验证按钮点击
  const debugZoomIn = () => {
    console.log('🔍 Zoom In clicked, current scale:', scale);
    handleZoomIn();
  };

  const debugZoomOut = () => {
    console.log('🔍 Zoom Out clicked, current scale:', scale);
    handleZoomOut();
  };

  const debugReset = () => {
    console.log('🔄 Reset clicked');
    resetView();
  };

  // 是否有多个对比源
  const hasMultipleCompareSources = hasOriginalImage && hasSceneImage;

  return (
    <>
      {/* 右上角下载按钮 - 精致设计 */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload();
          }}
          className="w-11 h-11 bg-gradient-to-br from-white/20 to-white/5 hover:from-white/30 hover:to-white/10 backdrop-blur-xl border border-white/30 rounded-xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xl group"
          title="下载图片"
        >
          <Download size={20} className="group-hover:stroke-white transition-colors" />
        </button>
      </div>

      {/* 底部控制栏 - 精致设计 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl px-6 py-4 flex items-center gap-4 text-white shadow-2xl ring-1 ring-white/10 ring-inset">
          {/* 缩小按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              debugZoomOut();
            }}
            disabled={scale <= minScale}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/15 to-white/5 hover:from-white/25 hover:to-white/10 flex items-center justify-center transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/20 border border-white/20 shadow-lg active:scale-95 group"
            title="缩小"
          >
            <Minus size={20} className="group-hover:stroke-white transition-colors" />
          </button>

          {/* 缩放比例显示 */}
          <div className="min-w-[80px] text-center bg-gradient-to-br from-white/10 to-white/5 rounded-xl px-4 py-2.5 border border-white/20 shadow-inner">
            <span className="text-sm font-bold tracking-wider">
              {Math.round(scale * 100)}%
            </span>
          </div>

          {/* 放大按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              debugZoomIn();
            }}
            disabled={scale >= maxScale}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/15 to-white/5 hover:from-white/25 hover:to-white/10 flex items-center justify-center transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/20 border border-white/20 shadow-lg active:scale-95 group"
            title="放大"
          >
            <Plus size={20} className="group-hover:stroke-white transition-colors" />
          </button>

          {/* 分隔线 */}
          <div className="w-px h-8 bg-gradient-to-b from-white/40 via-white/20 to-transparent" />

          {/* 重置按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              debugReset();
            }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-transparent hover:from-white/20 hover:to-white/5 border border-white/20 flex items-center justify-center transition-all duration-300 hover:border-white/30 active:scale-95 group"
            title="重置视图"
          >
            <RotateCcw size={18} className="group-hover:stroke-white transition-colors" />
          </button>

          {/* 分隔线 */}
          <div className="w-px h-8 bg-gradient-to-b from-white/40 via-white/20 to-transparent" />

          {/* 对比区域 */}
          {(hasOriginalImage || hasSceneImage) && (
            <div className="flex items-center gap-3">
              {/* 对比源切换 */}
              {hasMultipleCompareSources && onCompareSourceChange && (
                <div className="flex gap-2 bg-gradient-to-br from-white/5 to-transparent rounded-xl p-1.5 border border-white/15">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompareSourceChange('product');
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
                      compareSource === 'product'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg scale-105'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                    title="对比素材A"
                  >
                    <ImageIcon size={14} />
                    素材A
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompareSourceChange('scene');
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
                      compareSource === 'scene'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg scale-105'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                    title="对比素材B"
                  >
                    <Layers size={14} />
                    素材B
                  </button>
                </div>
              )}

              {/* 对比按钮 */}
              <button
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onCompareStart();
                }}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  onCompareEnd();
                }}
                onMouseLeave={(e) => {
                  e.stopPropagation();
                  onCompareEnd();
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  onCompareStart();
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  onCompareEnd();
                }}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 shadow-lg ${
                  isComparing
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white scale-105 shadow-emerald-500/50'
                    : 'bg-gradient-to-r from-white/15 to-white/5 hover:from-white/25 hover:to-white/10 text-white border border-white/30 hover:border-white/50 active:scale-95'
                }`}
                title={`按住对比${hasMultipleCompareSources ? (compareSource === 'product' ? '素材A' : '素材B') : '原图'}`}
              >
                {isComparing ? (
                  <>
                    <span className="animate-pulse">●</span>
                    松开恢复
                  </>
                ) : (
                  <>
                    <Layers size={16} />
                    按住对比
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 缩放提示 - 精致设计 */}
      {scale > 1 && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-blue-600/90 via-cyan-500/90 to-teal-500/90 backdrop-blur-xl rounded-full px-6 py-3 text-white text-sm font-semibold border border-white/30 shadow-2xl flex items-center gap-2">
            <span className="text-base">🔍</span>
            <span>{Math.round(scale * 100)}%</span>
            <span className="text-white/70">|</span>
            <span>滚轮缩放</span>
            <span className="text-white/70">|</span>
            <span>拖拽移动</span>
          </div>
        </div>
      )}
    </>
  );
}
