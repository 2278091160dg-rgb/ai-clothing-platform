/**
 * Main Content Renderer
 * 主内容区域渲染组件
 */

import { CanvasView } from '@/components/CanvasView';
import { BeforeImagesPanel } from '@/components/workspace/BeforeImagesPanel';
import { WelcomeShowcase } from '@/components/workspace/WelcomeShowcase';
import type { ImageItem, BatchObject } from '@/hooks/use-canvas-view-mode';

interface MainContentRendererProps {
  viewMode: 'single' | 'grid' | 'compare';
  singleImage: ImageItem | null;
  generatedImage: string | null;
  uploadedImage: string | null;
  sceneImagePreview: string | null;
  aspectRatio: '1:1' | '3:4' | '16:9' | '9:16';
  activeBatch: BatchObject | null;
  selectedImages: ImageItem[];
  resetView: () => void;
}

export function MainContentRenderer({
  viewMode,
  singleImage,
  generatedImage,
  uploadedImage,
  sceneImagePreview,
  aspectRatio,
  activeBatch,
  selectedImages,
  resetView,
}: MainContentRendererProps) {
  const hasValidContent = viewMode !== 'single' || singleImage?.url || generatedImage;

  if (hasValidContent) {
    return (
      <div className="flex-1 flex gap-4 h-full">
        {/* 左侧栏 - 输入图列 */}
        <div className="w-64 flex-shrink-0">
          <BeforeImagesPanel
            uploadedImage={uploadedImage}
            sceneImagePreview={sceneImagePreview}
          />
        </div>

        {/* 右侧栏 - 主舞台 */}
        <CanvasView
          viewMode={viewMode}
          singleImageUrl={singleImage?.url || generatedImage || null}
          originalImageUrl={uploadedImage}
          sceneImageUrl={sceneImagePreview}
          isLoading={false}
          aspectRatio={aspectRatio}
          activeBatch={activeBatch}
          compareImages={selectedImages}
          onResetView={resetView}
        />
      </div>
    );
  }

  return <WelcomeShowcase />;
}
