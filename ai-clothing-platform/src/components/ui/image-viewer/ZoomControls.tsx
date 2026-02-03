/**
 * ZoomControls - 缩放控制组件
 */

import { Plus, Minus, RotateCcw } from 'lucide-react';
import type { ImageZoomState, ImageZoomActions } from '@/hooks/use-image-zoom';

interface ZoomControlsProps {
  zoomState: ImageZoomState;
  zoomActions: ImageZoomActions;
  minScale?: number;
  maxScale?: number;
  compact?: boolean;
}

export function ZoomControls({
  zoomState,
  zoomActions,
  minScale = 0.5,
  maxScale = 3,
  compact = false,
}: ZoomControlsProps) {
  const { scale } = zoomState;
  const { handleZoomIn, handleZoomOut, resetView } = zoomActions;

  const buttonClass = compact
    ? 'w-7 h-7 rounded-md text-xs'
    : 'w-7 h-7 rounded-md';

  const iconSize = compact ? 12 : 14;

  return (
    <>
      <button
        onClick={e => {
          e.stopPropagation();
          handleZoomOut();
        }}
        disabled={scale <= minScale}
        className={`${buttonClass} bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95`}
        title="缩小"
      >
        <Minus size={iconSize} />
      </button>

      <div className="min-w-[50px] text-center bg-white/5 rounded px-2 py-1 border border-white/10">
        <span className="text-xs font-semibold">{Math.round(scale * 100)}%</span>
      </div>

      <button
        onClick={e => {
          e.stopPropagation();
          handleZoomIn();
        }}
        disabled={scale >= maxScale}
        className={`${buttonClass} bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95`}
        title="放大"
      >
        <Plus size={iconSize} />
      </button>

      <div className="w-px h-4 bg-white/20" />

      <button
        onClick={e => {
          e.stopPropagation();
          resetView();
        }}
        className={`${buttonClass} bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-200 hover:border-white/20 active:scale-95`}
        title="重置"
      >
        <RotateCcw size={iconSize - 2} />
      </button>
    </>
  );
}
