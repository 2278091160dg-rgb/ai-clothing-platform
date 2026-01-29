/**
 * 图片预览模态框组件
 * 在当前页面内预览图片，无需跳转
 */

'use client';

import { useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export function ImagePreview({ src, alt = '预览图片', onClose }: ImagePreviewProps) {
  // ESC键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 下载图片
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `preview-${Date.now()}.png`;
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full flex flex-col items-center justify-center p-8"
        onClick={e => e.stopPropagation()}
      >
        {/* 顶部工具栏 */}
        <div className="absolute top-6 left-0 right-0 flex items-center justify-center gap-3 z-10">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            className="bg-white/90 backdrop-blur-sm border border-white/20 hover:bg-white text-black"
          >
            <Download size={16} className="mr-2" />
            下载图片
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="bg-white/90 backdrop-blur-sm border border-white/20 hover:bg-white text-black"
          >
            <X size={16} className="mr-2" />
            关闭预览
          </Button>
        </div>

        {/* 图片容器 - 全屏居中 */}
        <div className="relative flex items-center justify-center w-full h-full">
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain"
            style={{
              maxHeight: 'calc(100vh - 120px)',
              maxWidth: 'calc(100vw - 64px)',
            }}
          />
        </div>

        {/* 底部提示 */}
        <div className="absolute bottom-6 left-0 right-0 text-center z-10">
          <p className="text-sm text-white/80 bg-black/50 inline-block px-4 py-2 rounded-full">
            按 ESC 键或点击背景关闭预览
          </p>
        </div>
      </div>
    </div>
  );
}
