'use client';

import { useState } from 'react';
import type { ImageZoomState, ImageZoomActions } from '@/hooks/use-image-zoom';
import { ZoomControls } from './image-viewer/ZoomControls';
import { SourceToggleButtons } from './image-viewer/SourceToggleButtons';
import { CompareButton } from './image-viewer/CompareButton';
import { DownloadButton } from './image-viewer/DownloadButton';
import { ZoomTooltip } from './image-viewer/ZoomTooltip';

export interface ImageViewerControlsProps {
  zoomState: ImageZoomState;
  zoomActions: ImageZoomActions;
  hasOriginalImage: boolean;
  hasSceneImage?: boolean;
  isComparing: boolean;
  compareSource?: 'product' | 'scene';
  onCompareStart: (e?: React.MouseEvent | React.TouchEvent) => void;
  onCompareEnd: (e?: React.MouseEvent | React.TouchEvent) => void;
  onCompareSourceChange?: (source: 'product' | 'scene') => void;
  onDownload: () => void;
  minScale?: number;
  maxScale?: number;
}

export function ImageViewerControls({
  zoomState,
  zoomActions,
  hasOriginalImage,
  hasSceneImage = false,
  isComparing,
  compareSource = 'product',
  onCompareStart,
  onCompareEnd,
  onCompareSourceChange,
  onDownload,
  minScale = 0.5,
  maxScale = 3,
}: ImageViewerControlsProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hasMultipleCompareSources = hasOriginalImage && hasSceneImage;

  return (
    <>
      <div className="absolute top-3 right-3 z-50">
        <DownloadButton onDownload={onDownload} />
      </div>

      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {!isHovered && (hasOriginalImage || hasSceneImage) && (
          <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-lg px-4 py-2 text-white shadow-xl flex items-center gap-2">
            {hasMultipleCompareSources && onCompareSourceChange && (
              <SourceToggleButtons
                compareSource={compareSource}
                onSourceChange={onCompareSourceChange}
                compact
              />
            )}
            <CompareButton
              isComparing={isComparing}
              onCompareStart={e => onCompareStart(e)}
              onCompareEnd={e => onCompareEnd(e)}
              hasMultipleSources={hasMultipleCompareSources}
              compareSource={compareSource}
              compact
            />
          </div>
        )}

        {isHovered && (
          <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 text-white shadow-xl">
            <ZoomControls
              zoomState={zoomState}
              zoomActions={zoomActions}
              minScale={minScale}
              maxScale={maxScale}
            />
            <div className="w-px h-4 bg-white/20" />
            {(hasOriginalImage || hasSceneImage) && (
              <div className="flex items-center gap-1.5">
                {hasMultipleCompareSources && onCompareSourceChange && (
                  <SourceToggleButtons
                    compareSource={compareSource}
                    onSourceChange={onCompareSourceChange}
                  />
                )}
                <CompareButton
                  isComparing={isComparing}
                  onCompareStart={e => onCompareStart(e)}
                  onCompareEnd={e => onCompareEnd(e)}
                  hasMultipleSources={hasMultipleCompareSources}
                  compareSource={compareSource}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <ZoomTooltip scale={zoomState.scale} />
    </>
  );
}
