/**
 * CanvasView - 主画布容器组件
 *
 * 根据视图模式渲染不同的子组件：
 * - single: 单图预览模式
 * - grid: 网格查看模式（表格端批量）
 * - compare: 对比模式（多图并排）
 */

'use client';

import { type ViewMode, type ImageItem, type BatchObject } from '@/hooks/use-canvas-view-mode';
import { ResultImageViewer } from '@/components/ResultImageViewer';
import { GridView } from '@/components/GridView';
import { CompareView } from '@/components/CompareView';

interface CanvasViewProps {
  viewMode: ViewMode;
  // 单图模式
  singleImageUrl: string | null;
  originalImageUrl?: string | null;
  sceneImageUrl?: string | null;
  isLoading?: boolean;
  aspectRatio?: '1:1' | '3:4' | '16:9' | '9:16';
  // 网格模式
  activeBatch?: BatchObject | null;
  // 对比模式
  compareImages?: ImageItem[];
  // 回调
  onResetView?: () => void;
}

export function CanvasView({
  viewMode,
  singleImageUrl,
  originalImageUrl = null,
  sceneImageUrl = null,
  isLoading = false,
  aspectRatio,
  activeBatch,
  compareImages = [],
  onResetView,
}: CanvasViewProps) {
  /**
   * 渲染单图预览模式
   */
  if (viewMode === 'single') {
    return (
      <ResultImageViewer
        resultImageUrl={singleImageUrl}
        originalImageUrl={originalImageUrl}
        sceneImageUrl={sceneImageUrl}
        isLoading={isLoading}
        aspectRatio={aspectRatio}
        downloadFileName="ai-generated"
      />
    );
  }

  /**
   * 渲染网格查看模式（表格端批量）
   */
  if (viewMode === 'grid' && activeBatch) {
    return <GridView batch={activeBatch} onClose={onResetView} />;
  }

  /**
   * 渲染对比模式
   */
  if (viewMode === 'compare' && compareImages.length >= 2) {
    return <CompareView images={compareImages} onClose={onResetView} />;
  }

  /**
   * 默认：空状态
   */
  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      {/* 背景网格装饰 */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      {/* 空状态 */}
      <div className="text-center">
        <p className="text-lg text-muted-foreground">
          {viewMode === 'grid' ? '请选择一个批次查看详情' : '请选择图片进行对比'}
        </p>
      </div>
    </div>
  );
}
