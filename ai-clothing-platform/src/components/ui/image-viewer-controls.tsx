/**
 * ImageViewerControls - 图片查看器控制栏组件
 *
 * 精致交互设计：
 * - 默认：只显示对比按钮（核心功能）
 * - 悬停：显示完整控制栏
 * - 紧凑布局，减少视觉干扰
 */

'use client';

import { useState } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);

  // 是否有多个对比源
  const hasMultipleCompareSources = hasOriginalImage && hasSceneImage;

  return (
    <>
      {/* 右上角下载按钮 - 始终可见 */}
      <div className="absolute top-3 right-3 z-50">
        <button
          onClick={e => {
            e.stopPropagation();
            onDownload();
          }}
          className="w-9 h-9 bg-primary/90 hover:bg-primary text-white backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
          title="下载图片"
        >
          <Download size={16} />
        </button>
      </div>

      {/* 底部控制栏 - 悬停展开 */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 默认状态：只显示对比按钮 */}
        {!isHovered && (hasOriginalImage || hasSceneImage) && (
          <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-lg px-4 py-2 text-white shadow-xl flex items-center gap-2">
            {/* 素材切换（紧凑） */}
            {hasMultipleCompareSources && onCompareSourceChange && (
              <div className="flex gap-1 bg-white/5 rounded-md p-0.5 border border-white/10">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onCompareSourceChange('product');
                  }}
                  className={`w-7 h-7 rounded flex items-center justify-center transition-all ${
                    compareSource === 'product'
                      ? 'bg-blue-500 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                  title="素材A"
                >
                  <ImageIcon size={12} />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onCompareSourceChange('scene');
                  }}
                  className={`w-7 h-7 rounded flex items-center justify-center transition-all ${
                    compareSource === 'scene'
                      ? 'bg-blue-500 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                  title="素材B"
                >
                  <Layers size={12} />
                </button>
              </div>
            )}

            {/* 对比按钮 */}
            <button
              onMouseDown={e => {
                e.stopPropagation();
                onCompareStart();
              }}
              onMouseUp={e => {
                e.stopPropagation();
                onCompareEnd();
              }}
              onMouseLeave={e => {
                e.stopPropagation();
                onCompareEnd();
              }}
              onTouchStart={e => {
                e.stopPropagation();
                onCompareStart();
              }}
              onTouchEnd={e => {
                e.stopPropagation();
                onCompareEnd();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                isComparing
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              title={`按住对比${hasMultipleCompareSources ? (compareSource === 'product' ? 'A' : 'B') : ''}`}
            >
              <Layers size={14} />
              {isComparing ? '松开' : '对比'}
            </button>
          </div>
        )}

        {/* 悬停状态：显示完整控制栏 */}
        {isHovered && (
          <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 text-white shadow-xl">
            {/* 缩小按钮 */}
            <button
              onClick={e => {
                e.stopPropagation();
                handleZoomOut();
              }}
              disabled={scale <= minScale}
              className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              title="缩小"
            >
              <Minus size={14} />
            </button>

            {/* 缩放比例 */}
            <div className="min-w-[50px] text-center bg-white/5 rounded px-2 py-1 border border-white/10">
              <span className="text-xs font-semibold">{Math.round(scale * 100)}%</span>
            </div>

            {/* 放大按钮 */}
            <button
              onClick={e => {
                e.stopPropagation();
                handleZoomIn();
              }}
              disabled={scale >= maxScale}
              className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              title="放大"
            >
              <Plus size={14} />
            </button>

            {/* 分隔线 */}
            <div className="w-px h-4 bg-white/20" />

            {/* 重置按钮 */}
            <button
              onClick={e => {
                e.stopPropagation();
                resetView();
              }}
              className="w-7 h-7 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-200 hover:border-white/20 active:scale-95"
              title="重置"
            >
              <RotateCcw size={12} />
            </button>

            {/* 分隔线 */}
            <div className="w-px h-4 bg-white/20" />

            {/* 对比区域 */}
            {(hasOriginalImage || hasSceneImage) && (
              <div className="flex items-center gap-1.5">
                {/* 素材切换 */}
                {hasMultipleCompareSources && onCompareSourceChange && (
                  <div className="flex gap-1 bg-white/5 rounded-md p-0.5 border border-white/10">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onCompareSourceChange('product');
                      }}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                        compareSource === 'product'
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                      title="素材A"
                    >
                      <ImageIcon size={10} />
                      <span>A</span>
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onCompareSourceChange('scene');
                      }}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                        compareSource === 'scene'
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                      title="素材B"
                    >
                      <Layers size={10} />
                      <span>B</span>
                    </button>
                  </div>
                )}

                {/* 对比按钮 */}
                <button
                  onMouseDown={e => {
                    e.stopPropagation();
                    onCompareStart();
                  }}
                  onMouseUp={e => {
                    e.stopPropagation();
                    onCompareEnd();
                  }}
                  onMouseLeave={e => {
                    e.stopPropagation();
                    onCompareEnd();
                  }}
                  onTouchStart={e => {
                    e.stopPropagation();
                    onCompareStart();
                  }}
                  onTouchEnd={e => {
                    e.stopPropagation();
                    onCompareEnd();
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                    isComparing
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'bg-white/10 hover:bg-white/20 active:scale-95'
                  }`}
                  title={`按住对比${hasMultipleCompareSources ? (compareSource === 'product' ? 'A' : 'B') : ''}`}
                >
                  <Layers size={12} />
                  {isComparing ? '松开' : '对比'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 缩放提示 - 仅缩放时显示 */}
      {scale > 1 && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-blue-500/90 backdrop-blur-md rounded-full px-3 py-1.5 text-white text-xs font-medium border border-white/20 shadow-lg flex items-center gap-1.5">
            <span>🔍</span>
            <span>{Math.round(scale * 100)}%</span>
            <span className="text-white/50">|</span>
            <span>滚轮缩放</span>
          </div>
        </div>
      )}
    </>
  );
}
