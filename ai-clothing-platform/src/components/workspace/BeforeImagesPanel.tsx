/**
 * BeforeImagesPanel - 输入图片列组件
 *
 * 功能：
 * - 显示 BEFORE 输入图1（商品图）
 * - 显示 BEFORE 输入图2（场景图/素材B）
 * - 空状态提示
 */

'use client';

import Image from 'next/image';

interface BeforeImagesPanelProps {
  uploadedImage?: string | null;
  sceneImagePreview?: string | null;
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

export function BeforeImagesPanel({ uploadedImage, sceneImagePreview }: BeforeImagesPanelProps) {
  const hasUploadedImage = !!uploadedImage;
  const hasSceneImage = !!sceneImagePreview && sceneImagePreview.trim() !== '';

  // 空状态提示
  if (!hasUploadedImage && !hasSceneImage) {
    return (
      <div className="theme-card rounded-xl p-4 text-center h-full flex items-center justify-center">
        <p className="text-xs text-muted-foreground">上传图片后在此显示</p>
      </div>
    );
  }

  // 只有一张图片时，只渲染有图片的卡片
  const hasOnlyOneImage = (hasUploadedImage && !hasSceneImage) || (!hasUploadedImage && hasSceneImage);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* BEFORE - 输入图1（商品图/素材A） - 只在有图片时显示 */}
      {hasUploadedImage && (
        <div className={`theme-card rounded-xl p-3 flex flex-col ${hasOnlyOneImage ? 'flex-1' : ''}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
              BEFORE
            </span>
            <span className="text-xs text-muted-foreground">素材A</span>
          </div>
          <div className="flex-1 bg-gray-900/50 rounded-lg overflow-hidden relative min-h-[200px]">
            <Image
              src={getProxiedUrl(uploadedImage)}
              alt="BEFORE - 素材A"
              width={300}
              height={400}
              className="w-full h-full object-contain"
              unoptimized
            />
          </div>
        </div>
      )}

      {/* BEFORE - 输入图2（场景图/素材B） - 只在有图片时显示 */}
      {hasSceneImage && (
        <div className={`theme-card rounded-xl p-3 flex flex-col ${hasOnlyOneImage ? 'flex-1' : ''}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
              BEFORE
            </span>
            <span className="text-xs text-muted-foreground">素材B</span>
          </div>
          <div className="flex-1 bg-gray-900/50 rounded-lg overflow-hidden relative min-h-[200px]">
            <Image
              src={getProxiedUrl(sceneImagePreview)}
              alt="BEFORE - 素材B"
              width={300}
              height={400}
              className="w-full h-full object-contain"
              unoptimized
              onError={() => {
                console.error('素材B图片加载失败:', sceneImagePreview);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
