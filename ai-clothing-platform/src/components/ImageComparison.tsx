'use client';

import { ReactCompareSlider, ReactCompareSliderHandle } from 'react-compare-slider';
import Image from 'next/image';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageComparisonProps {
  before: string; // 原始商品图
  after: string; // AI 生成结果
  onDownload?: () => void;
}

// 🔧 判断 URL 是否需要代理（非 blob URL 需要代理）
function needsProxy(url: string): boolean {
  return !url.startsWith('blob:') && !url.startsWith('data:');
}

// 🔧 获取代理 URL（如果需要）
function getProxiedUrl(url: string): string {
  if (needsProxy(url)) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export function ImageComparison({ before, after, onDownload }: ImageComparisonProps) {
  return (
    <div className="relative w-full h-full">
      <ReactCompareSlider
        itemOne={<ComparisonImage src={before} label="原始图" />}
        itemTwo={<ComparisonImage src={after} label="AI生成" />}
        portrait
        className="rounded-xl overflow-hidden shadow-2xl"
      >
        <ReactCompareSliderHandle
          className="shadow-2xl ring-2 ring-white/80 hover:ring-white transition-shadow"
          buttonStyle={{
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        />
      </ReactCompareSlider>

      {onDownload && (
        <Button
          onClick={onDownload}
          variant="outline"
          size="sm"
          className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm border-border/30 hover:bg-card/90"
        >
          <Download size={14} className="mr-2" />
          下载对比图
        </Button>
      )}
    </div>
  );
}

function ComparisonImage({ src, label }: { src: string; label: string }) {
  return (
    <div className="relative w-full h-full">
      <Image
        src={getProxiedUrl(src)}
        alt={label}
        fill
        className="object-contain"
        unoptimized
      />
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium border border-white/20">
        {label}
      </div>
    </div>
  );
}
