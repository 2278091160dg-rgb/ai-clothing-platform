/**
 * GridView - 网格视图组件
 *
 * 用于表格端批量生成图片的网格展示
 *
 * 拆分后结构：
 * - GridImageCard: 单个图片卡片
 * - ImagePreviewModal: 全屏预览模态框
 */

'use client';

import { useState, useCallback } from 'react';
import { Download, X } from 'lucide-react';
import { type BatchObject } from '@/hooks/use-canvas-view-mode';
import { GridImageCard } from '@/components/ui/GridImageCard';
import { ImagePreviewModal } from '@/components/ui/ImagePreviewModal';

interface GridViewProps {
  batch: BatchObject;
  onClose?: () => void;
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

export function GridView({ batch, onClose }: GridViewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  /**
   * 下载图片
   */
  const handleDownload = useCallback(
    async (imageUrl: string, index: number) => {
      try {
        const proxyUrl = getProxiedUrl(imageUrl);
        const response = await fetch(proxyUrl);
        const blob = await response.blob();

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `batch-${batch.id}-${index + 1}-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error('下载失败:', error);
      }
    },
    [batch.id]
  );

  /**
   * 下载所有图片（打包）
   */
  const handleDownloadAll = useCallback(async () => {
    // 简单实现：逐个下载（实际可以使用 JSZip 打包）
    for (let i = 0; i < batch.images.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500)); // 延迟避免浏览器阻止
      await handleDownload(batch.images[i].url, i);
    }
  }, [batch.images, handleDownload]);

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-black relative">
      {/* 背景网格装饰 */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      {/* 头部 */}
      <div className="relative z-10 theme-card rounded-t-2xl p-4 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">批量生成结果</h2>
            <p className="text-sm text-muted-foreground mt-1">共 {batch.images.length} 张图片</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-md">{batch.prompt}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
            >
              <Download size={16} />
              下载全部
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-lg hover:bg-card/60 flex items-center justify-center transition-all"
                title="关闭"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 网格内容 */}
      <div className="flex-1 relative z-10 p-4 overflow-y-auto">
        {batch.images.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">暂无图片</p>
              <p className="text-xs text-muted-foreground mt-1">
                {batch.status === 'processing' ? '正在生成中...' : '等待生成...'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {batch.images.map((image, index) => (
              <GridImageCard
                key={image.id}
                image={image}
                index={index}
                onDownload={handleDownload}
                onPreview={() => setSelectedImageIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 全屏预览模态框 */}
      {selectedImageIndex !== null && (
        <ImagePreviewModal
          image={batch.images[selectedImageIndex]}
          currentIndex={selectedImageIndex}
          totalImages={batch.images.length}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}
    </div>
  );
}
