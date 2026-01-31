/**
 * CompareView - 对比视图组件
 *
 * 用于并排对比多张图片（2-4张）
 *
 * 拆分后结构：
 * - CompareImagePanel: 单个对比图片面板
 */

'use client';

import { useState, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { type ImageItem } from '@/hooks/use-canvas-view-mode';
import { CompareImagePanel } from '@/components/ui/CompareImagePanel';

interface CompareViewProps {
  images: ImageItem[];
  onClose?: () => void;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const SCALE_STEP = 0.25;

export function CompareView({ images, onClose }: CompareViewProps) {
  const [scale, setScale] = useState(1);

  /**
   * 统一缩放
   */
  const handleZoom = useCallback((delta: number) => {
    setScale(prev => Math.min(Math.max(prev + delta, MIN_SCALE), MAX_SCALE));
  }, []);

  /**
   * 重置视图
   */
  const handleReset = useCallback(() => {
    setScale(1);
  }, []);

  /**
   * 获取网格布局类
   */
  const getGridClass = () => {
    switch (images.length) {
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-2 grid-rows-2';
      default:
        return 'grid-cols-2';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-950 relative">
      {/* 背景网格 */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      {/* 头部控制栏 */}
      <div className="relative z-10 theme-card rounded-t-2xl p-4 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">图片对比</h2>
            <p className="text-sm text-muted-foreground mt-1">对比 {images.length} 张图片</p>
          </div>

          {/* 缩放控制 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleZoom(-SCALE_STEP)}
              disabled={scale <= MIN_SCALE}
              className="w-10 h-10 rounded-lg hover:bg-card/60 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="缩小"
            >
              <ZoomOut size={18} />
            </button>
            <span className="text-sm font-mono min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => handleZoom(SCALE_STEP)}
              disabled={scale >= MAX_SCALE}
              className="w-10 h-10 rounded-lg hover:bg-card/60 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="放大"
            >
              <ZoomIn size={18} />
            </button>
            <div className="w-px h-6 bg-border/30" />
            <button
              onClick={handleReset}
              className="w-10 h-10 rounded-lg hover:bg-card/60 flex items-center justify-center transition-all"
              title="重置视图"
            >
              <RotateCcw size={18} />
            </button>
            {onClose && (
              <>
                <div className="w-px h-6 bg-border/30" />
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-lg hover:bg-card/60 flex items-center justify-center transition-all"
                  title="关闭对比"
                >
                  <X size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 对比网格 */}
      <div className="flex-1 relative z-10 p-4 overflow-hidden">
        <div className={`grid ${getGridClass()} gap-4 h-full`}>
          {images.map((image, index) => (
            <CompareImagePanel
              key={image.id}
              image={image}
              index={index}
              scale={scale}
              onZoom={handleZoom}
            />
          ))}
        </div>
      </div>

      {/* 底部提示 */}
      <div className="relative z-10 theme-card-light rounded-b-2xl p-3 text-center">
        <p className="text-xs text-muted-foreground">
          💡 提示：滚轮缩放 | 拖拽移动 | 所有图片同步缩放
        </p>
      </div>
    </div>
  );
}
