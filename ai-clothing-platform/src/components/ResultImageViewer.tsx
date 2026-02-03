/**
 * ResultImageViewer - AI 生成结果查看器
 *
 * 功能：
 * - 自适应多尺寸图片显示
 * - 缩放交互（滚轮 + 按钮）
 * - Before/After 对比（按住按钮）
 * - 下载功能
 *
 * 拆分后结构：
 * - useImageZoom hook: 缩放和拖拽逻辑
 * - ImageViewerControls: 控制栏组件
 * - ImageDisplay: 图片显示组件
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Eye } from 'lucide-react';
import { useImageZoom } from '@/hooks/use-image-zoom';
import { ImageViewerControls } from '@/components/ui/image-viewer-controls';
import { ImageDisplay, getProxiedUrl } from '@/components/ui/image-display';

export interface ResultImageViewerProps {
  /** 生成后的图片链接 */
  resultImageUrl: string | null;
  /** 用于对比的原始底图链接（素材A） */
  originalImageUrl: string | null;
  /** 用于对比的场景图链接（素材B） */
  sceneImageUrl?: string | null;
  /** 生成状态 */
  isLoading?: boolean;
  /** 图片比例（可选） */
  aspectRatio?: '1:1' | '3:4' | '16:9' | '9:16';
  /** 下载文件名前缀 */
  downloadFileName?: string;
}

export function ResultImageViewer({
  resultImageUrl,
  originalImageUrl,
  sceneImageUrl = null,
  isLoading = false,
  aspectRatio,
  downloadFileName = 'ai-generated',
}: ResultImageViewerProps) {
  // 缩放和拖拽状态
  const { state: zoomState, actions: zoomActions, constants } = useImageZoom();
  const imageRef = useRef<HTMLImageElement>(null);

  // 对比状态
  const [isComparing, setIsComparing] = useState(false);
  // 对比源选择：'product' = 素材A, 'scene' = 素材B
  const [compareSource, setCompareSource] = useState<'product' | 'scene'>('product');

  /**
   * 当图片变化时重置视图
   */
  useEffect(() => {
    zoomActions.resetView();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultImageUrl]); // 只监听 resultImageUrl，不监听 zoomActions 对象

  /**
   * 判断当前应显示的图片
   */
  const displayImageUrl = isComparing
    ? compareSource === 'product'
      ? originalImageUrl || resultImageUrl
      : sceneImageUrl || resultImageUrl
    : resultImageUrl;

  /**
   * 是否有有效图片
   */
  const hasValidImage = !!displayImageUrl;

  /**
   * 是否有素材B可用于对比
   */
  const hasSceneImage = !!sceneImageUrl;

  /**
   * 下载图片
   */
  const handleDownload = useCallback(async () => {
    const imageUrl = resultImageUrl || originalImageUrl;
    if (!imageUrl) return;

    try {
      const proxyUrl = getProxiedUrl(imageUrl);
      const response = await fetch(proxyUrl);
      const blob = await response.blob();

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${downloadFileName}-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('下载失败:', error);
    }
  }, [resultImageUrl, originalImageUrl, downloadFileName]);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-gray-950 to-black rounded-2xl overflow-hidden">
      {/* 背景网格装饰 */}
      <div className="absolute inset-0 rounded-2xl bg-grid-pattern opacity-20 pointer-events-none" />

      {/* ===== 空状态 ===== */}
      {!isLoading && !hasValidImage && (
        <div className="absolute inset-0 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <Eye size={48} className="mx-auto mb-3 opacity-20 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {resultImageUrl === null ? '等待生成...' : '暂无图片'}
            </p>
          </div>
        </div>
      )}

      {/* ===== 图片显示区域 ===== */}
      {hasValidImage && (
        <>
          <ImageDisplay
            imageUrl={displayImageUrl}
            isComparing={isComparing}
            zoomState={zoomState}
            zoomActions={zoomActions}
            imageRef={imageRef}
          />

          {/* ===== 控制栏 ===== */}
          <ImageViewerControls
            zoomState={zoomState}
            zoomActions={zoomActions}
            hasOriginalImage={!!originalImageUrl}
            hasSceneImage={hasSceneImage}
            isComparing={isComparing}
            compareSource={compareSource}
            onCompareStart={() => setIsComparing(true)}
            onCompareEnd={() => setIsComparing(false)}
            onCompareSourceChange={setCompareSource}
            onDownload={handleDownload}
            minScale={constants.MIN_SCALE}
            maxScale={constants.MAX_SCALE}
          />

          {/* ===== 图片尺寸标签（可选） ===== */}
          {aspectRatio && (
            <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground">
              {aspectRatio}
            </div>
          )}
        </>
      )}
    </div>
  );
}
