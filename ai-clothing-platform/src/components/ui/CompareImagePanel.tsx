/**
 * CompareImagePanel - 单个对比图片面板组件
 *
 * 功能：
 * - 显示单个对比图片
 * - 支持缩放和拖拽
 * - 下载功能
 * - 序号和提示信息显示
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { Download } from 'lucide-react';
import Image from 'next/image';
import { type ImageItem } from '@/hooks/use-canvas-view-mode';

const SCALE_STEP = 0.25;

interface CompareImagePanelProps {
  image: ImageItem;
  index: number;
  scale: number;
  onZoom: (delta: number) => void;
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

export function CompareImagePanel({ image, index, scale, onZoom }: CompareImagePanelProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * 滚轮缩放
   */
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
      onZoom(delta);
    },
    [onZoom]
  );

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
        e.preventDefault();
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

  /**
   * 下载图片
   */
  const handleDownload = async () => {
    try {
      const proxyUrl = getProxiedUrl(image.url);
      const response = await fetch(proxyUrl);
      const blob = await response.blob();

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `compare-${index + 1}-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-border/30"
      onWheel={handleWheel}
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      {/* 背景网格 */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* 图片容器 */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          className="relative"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
        >
          <Image
            src={getProxiedUrl(image.url)}
            alt={`对比图片 ${index + 1}`}
            width={800}
            height={800}
            className="max-w-full max-h-full object-contain shadow-2xl"
            draggable={false}
            unoptimized
          />
        </div>
      </div>

      {/* 左上角序号 */}
      <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
        <span className="text-white text-sm font-bold">{index + 1}</span>
      </div>

      {/* 右上角下载按钮 */}
      <button
        onClick={handleDownload}
        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all hover:scale-110"
        title="下载图片"
      >
        <Download size={18} className="text-white" />
      </button>

      {/* 底部信息 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <p className="text-white text-xs truncate">{image.prompt}</p>
      </div>

      {/* 缩放提示 */}
      {scale > 1 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 pointer-events-none">
          <p className="text-white text-xs">{Math.round(scale * 100)}%</p>
        </div>
      )}
    </div>
  );
}

export { getProxiedUrl };
