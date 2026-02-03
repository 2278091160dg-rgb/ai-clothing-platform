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

        {/* 对比模式标签 */}
        {isComparing && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-500/90 to-cyan-500/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg pointer-events-none">
            <p className="text-xs font-bold text-white tracking-wider">BEFORE</p>
          </div>
        )}

        {/* 正常模式标签 */}
        {!isComparing && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500/90 to-emerald-500/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg pointer-events-none">
            <p className="text-xs font-bold text-white tracking-wider">AFTER</p>
          </div>
        )}
      </div>
    </div>
  );
}

export { getProxiedUrl };
