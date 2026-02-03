/**
 * BeforeImagesPanel - 输入图片列组件
 *
 * 功能：
 * - 显示 BEFORE 输入图1（商品图）
 * - 显示 BEFORE 输入图2（场景图/素材B）
 * - 根据图片比例自适应布局
 * - 空状态提示
 */

'use client';

import Image from 'next/image';

interface BeforeImagesPanelProps {
  uploadedImage?: string | null;
  sceneImagePreview?: string | null;
  aspectRatio?: '1:1' | '3:4' | '9:16' | '16:9';
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

/**
 * 根据宽高比获取 CSS aspect-ratio 值
 */
function getCssAspectRatio(ratio: '1:1' | '3:4' | '9:16' | '16:9'): string {
  const ratioMap = {
    '1:1': '1 / 1',
    '3:4': '3 / 4',
    '9:16': '9 / 16',
    '16:9': '16 / 9',
  };
  return ratioMap[ratio];
}

/**
 * 根据宽高比判断是竖图、横图还是方图
 */
function getOrientation(ratio: '1:1' | '3:4' | '9:16' | '16:9'): 'vertical' | 'horizontal' | 'square' {
  if (ratio === '9:16' || ratio === '3:4') return 'vertical';
  if (ratio === '16:9') return 'horizontal';
  return 'square';
}

export function BeforeImagesPanel({
  uploadedImage,
  sceneImagePreview,
  aspectRatio = '3:4'
}: BeforeImagesPanelProps) {
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

  // 只有一张图片时，让它填充整个高度
  const hasOnlyOneImage = (hasUploadedImage && !hasSceneImage) || (!hasUploadedImage && hasSceneImage);

  // 获取图片方向和比例
  const orientation = getOrientation(aspectRatio);
  const cssAspectRatio = getCssAspectRatio(aspectRatio);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* BEFORE - 输入图1（商品图/素材A） */}
      {hasUploadedImage && (
        <div
          className={`theme-card rounded-xl p-3 ${hasOnlyOneImage ? 'flex-1' : ''}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
              BEFORE
            </span>
            <span className="text-xs text-muted-foreground">素材A</span>
            {aspectRatio && <span className="text-xs text-muted-foreground/50">({aspectRatio})</span>}
          </div>
          {/* 根据图片比例动态调整容器 */}
          <div
            className="rounded-lg overflow-hidden relative mx-auto"
            style={{
              aspectRatio: cssAspectRatio,
              maxHeight: hasOnlyOneImage ? '100%' : '300px',
              width: hasOnlyOneImage ? '100%' : 'auto',
              backgroundColor: 'rgba(17, 24, 39, 0.5)'
            }}
          >
            <Image
              src={getProxiedUrl(uploadedImage)}
              alt="BEFORE - 素材A"
              width={orientation === 'vertical' ? 300 : 400}
              height={orientation === 'vertical' ? 400 : 300}
              className="w-full h-full object-contain"
              unoptimized
            />
          </div>
        </div>
      )}

      {/* BEFORE - 输入图2（场景图/素材B） */}
      {hasSceneImage && (
        <div
          className={`theme-card rounded-xl p-3 ${hasOnlyOneImage ? 'flex-1' : ''}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
              BEFORE
            </span>
            <span className="text-xs text-muted-foreground">素材B</span>
            {aspectRatio && <span className="text-xs text-muted-foreground/50">({aspectRatio})</span>}
          </div>
          {/* 根据图片比例动态调整容器 */}
          <div
            className="rounded-lg overflow-hidden relative mx-auto"
            style={{
              aspectRatio: cssAspectRatio,
              maxHeight: hasOnlyOneImage ? '100%' : '300px',
              width: hasOnlyOneImage ? '100%' : 'auto',
              backgroundColor: 'rgba(17, 24, 39, 0.5)'
            }}
          >
            <Image
              src={getProxiedUrl(sceneImagePreview)}
              alt="BEFORE - 素材B"
              width={orientation === 'vertical' ? 300 : 400}
              height={orientation === 'vertical' ? 400 : 300}
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
