/**
 * ImageDisplay - 图片显示容器组件
 *
 * 功能：
 * - 显示图片（支持代理）
 * - Before/After 标签
 * - 缩放和拖拽支持
 * - 滚轮缩放
 */

'use client';

import { type ImageZoomState, type ImageZoomActions } from '@/hooks/use-image-zoom';
import Image from 'next/image';

export interface ImageDisplayProps {
  imageUrl: string | null;
  isComparing: boolean;
  zoomState: ImageZoomState;
  zoomActions: ImageZoomActions;
  imageRef?: React.RefObject<HTMLImageElement | null>;
}

/**
 * 获取代理 URL
 */
function getProxiedUrl(url: string): string {
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

export function ImageDisplay({
  imageUrl,
  isComparing,
  zoomState,
  zoomActions,
  imageRef,
}: ImageDisplayProps) {
  const { scale, position, isDragging } = zoomState;
  const { handleDragStart, handleDragMove, handleDragEnd, handleWheel } = zoomActions;

  if (!imageUrl) {
    return (
      <div className="absolute inset-0 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">暂无图片</p>
        </div>
      </div>
    );
  }

  const proxiedUrl = getProxiedUrl(imageUrl);

  return (
    <div
      className="absolute inset-0 rounded-2xl flex items-center justify-center overflow-visible"
      onWheel={handleWheel}
    >
      <div
        ref={imageRef}
        className="relative select-none"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
        }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        <Image
          src={proxiedUrl}
          alt="AI 生成结果"
          width={1200}
          height={1200}
          className="max-w-full max-h-full object-contain shadow-2xl rounded-lg pointer-events-none"
          unoptimized
          draggable={false}
          style={{
            maxHeight: '100%',
            maxWidth: '100%',
          }}
        />

        {/* 对比模式标签 - BEFORE（醒目橙色） */}
        {isComparing && (
          <div className="absolute -top-2 -left-2 bg-gradient-to-r from-orange-500 to-amber-500 backdrop-blur-md rounded-lg px-4 py-2 shadow-xl pointer-events-none border-2 border-white/30">
            <p className="text-sm font-black text-white tracking-widest drop-shadow-lg">BEFORE</p>
          </div>
        )}

        {/* 正常模式标签 - AFTER（醒目绿色，突出显示） */}
        {!isComparing && (
          <div className="absolute -top-2 -left-2 bg-gradient-to-r from-emerald-500 to-green-500 backdrop-blur-md rounded-lg px-4 py-2 shadow-xl pointer-events-none border-2 border-white/30">
            <p className="text-sm font-black text-white tracking-widest drop-shadow-lg">AFTER</p>
          </div>
        )}
      </div>
    </div>
  );
}

export { getProxiedUrl };
