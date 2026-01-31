/**
 * ImagePreviewModal - 全屏图片预览模态框组件
 *
 * 功能：
 * - 全屏显示图片
 * - 支持关闭
 * - 显示图片序号
 */

'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import type { ImageItem } from '@/hooks/use-canvas-view-mode';

interface ImagePreviewModalProps {
  image: ImageItem;
  currentIndex: number;
  totalImages: number;
  onClose: () => void;
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

export function ImagePreviewModal({
  image,
  currentIndex,
  totalImages,
  onClose,
}: ImagePreviewModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
      >
        <X size={24} className="text-white" />
      </button>

      <div className="relative max-h-[90vh] max-w-[90vw]" onClick={e => e.stopPropagation()}>
        <Image
          src={getProxiedUrl(image.url)}
          alt={`预览 ${currentIndex + 1}`}
          width={1200}
          height={1200}
          className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
          unoptimized
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
          <p className="text-white text-sm">
            {currentIndex + 1} / {totalImages}
          </p>
        </div>
      </div>
    </div>
  );
}

export { getProxiedUrl };
