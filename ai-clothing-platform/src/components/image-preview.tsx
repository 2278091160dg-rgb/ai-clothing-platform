/**
 * 图片预览模态框组件
 * 在当前页面内预览图片，无需跳转
 */

'use client';

import { useEffect } from 'react';
import { X, Download } from 'lucide-react';
import Image from 'next/image';

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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full flex flex-col items-center justify-center"
        onClick={e => e.stopPropagation()}
      >
        {/* 右上角操作按钮组 */}
        <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
          {/* 下载按钮 */}
          <button
            onClick={handleDownload}
            className="group flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 rounded-full transition-all hover:scale-105"
            title="下载图片"
          >
            <Download size={18} className="text-white" />
            <span className="text-sm text-white font-medium">下载</span>
          </button>

          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-red-500/50 rounded-full transition-all hover:scale-110"
            title="关闭预览 (ESC)"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* 左上角图片计数/信息（可选，预留） */}
        <div className="absolute top-6 left-6 z-10">
          <div className="px-3 py-1.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full">
            <p className="text-xs text-white/80">预览模式</p>
          </div>
        </div>

        {/* 图片容器 - 全屏居中 */}
        <div className="relative flex items-center justify-center w-full h-full px-20">
          <Image
            src={src}
            alt={alt}
            width={0}
            height={0}
            className="max-w-full max-h-full object-contain drop-shadow-2xl"
            style={{
              maxHeight: 'calc(100vh - 80px)',
              maxWidth: 'calc(100vw - 160px)',
              width: 'auto',
              height: 'auto',
            }}
            unoptimized
          />
        </div>

        {/* 底部提示 - 更优雅的样式 */}
        <div className="absolute bottom-8 left-0 right-0 text-center z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
            <div className="flex items-center gap-1.5 text-white/60 text-xs">
              <span>ESC</span>
              <span className="text-white/40">或</span>
              <span>点击背景</span>
              <span className="text-white/40">关闭</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
