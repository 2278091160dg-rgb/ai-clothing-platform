/**
 * GridImageCard - 网格图片卡片组件
 *
 * 用于批量生成结果的网格展示
 */

'use client';

import { Download } from 'lucide-react';
import Image from 'next/image';
import { type ImageItem } from '@/hooks/use-canvas-view-mode';

interface GridImageCardProps {
  image: ImageItem;
  index: number;
  onDownload: (imageUrl: string, index: number) => void;
  onPreview: () => void;
  downloadFileName?: string;
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

export function GridImageCard({ image, index, onDownload, onPreview }: GridImageCardProps) {
  const handleDownload = () => {
    onDownload(image.url, index);
  };

  return (
    <div className="group relative aspect-[3/4] bg-card/40 rounded-xl overflow-hidden border border-border/20 hover:border-border/40 transition-all">
      {/* 图片 */}
      <Image
        src={getProxiedUrl(image.url)}
        alt={`生成结果 ${index + 1}`}
        width={300}
        height={400}
        className="w-full h-full object-cover"
        loading="lazy"
        unoptimized
      />

      {/* 悬浮遮罩 */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
        <button
          onClick={handleDownload}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all"
          title="下载"
        >
          <Download size={18} className="text-white" />
        </button>
        <button
          onClick={onPreview}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all"
          title="预览"
        >
          <span className="text-white text-sm">🔍</span>
        </button>
      </div>

      {/* 序号 */}
      <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
        <span className="text-xs text-white font-medium">{index + 1}</span>
      </div>
    </div>
  );
}

export { getProxiedUrl };
