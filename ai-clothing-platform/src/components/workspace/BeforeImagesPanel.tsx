/**
 * BeforeImagesPanel - 输入图片列组件
 *
 * 功能：
 * - 显示 BEFORE 输入图1（商品图）
 * - 显示 BEFORE 输入图2（场景图/素材B）
 * - 根据图片比例自适应布局
 * - 空状态提示
 * - 生成信息展示（单图时）
 */

'use client';

import Image from 'next/image';
import { Settings, Clock, Sparkles } from 'lucide-react';
import type { ImageModel } from '@/lib/types';

interface BeforeImagesPanelProps {
  uploadedImage?: string | null;
  sceneImagePreview?: string | null;
  aspectRatio?: '1:1' | '3:4' | '9:16' | '16:9';
  mode?: string;
  prompt?: string;
  imageModel?: ImageModel;
  quality?: 'standard' | 'high';
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
function getOrientation(
  ratio: '1:1' | '3:4' | '9:16' | '16:9'
): 'vertical' | 'horizontal' | 'square' {
  if (ratio === '9:16' || ratio === '3:4') return 'vertical';
  if (ratio === '16:9') return 'horizontal';
  return 'square';
}

export function BeforeImagesPanel({
  uploadedImage,
  sceneImagePreview,
  aspectRatio = '3:4',
  mode,
  prompt,
  imageModel = 'flux-1.1-pro',
  quality = 'standard',
}: BeforeImagesPanelProps) {
  const hasUploadedImage = !!uploadedImage;
  const hasSceneImage = !!sceneImagePreview && sceneImagePreview.trim() !== '';

  // 计算预估耗时（根据模式）
  const getEstimatedTime = (): string => {
    if (mode === 'tryon') return '~8秒';
    if (mode === 'wear') return '~6秒';
    if (mode === 'combine') return '~10秒';
    return '~5秒'; // scene
  };

  // 获取模型显示名称
  const getModelDisplayName = (): string => {
    if (imageModel === 'flux-1.1-pro') return 'Flux Pro';
    if (imageModel === 'flux-1.1-ultra') return 'Flux Ultra';
    if (imageModel === 'flux-realism') return 'Realism';
    if (imageModel === 'sd3') return 'Stable Diffusion 3';
    if (imageModel === 'mj-v6') return 'Midjourney v6';
    return imageModel;
  };

  // 获取质量显示名称
  const getQualityDisplayName = (): string => {
    return quality === 'high' ? '高质量' : '标准';
  };

  // 空状态提示
  if (!hasUploadedImage && !hasSceneImage) {
    return (
      <div className="theme-card rounded-xl p-4 text-center h-full flex items-center justify-center">
        <p className="text-xs text-muted-foreground">上传图片后在此显示</p>
      </div>
    );
  }

  // 只有一张图片时，让它填充整个高度
  const hasOnlyOneImage =
    (hasUploadedImage && !hasSceneImage) || (!hasUploadedImage && hasSceneImage);

  // 获取图片方向和比例
  const orientation = getOrientation(aspectRatio);
  const cssAspectRatio = getCssAspectRatio(aspectRatio);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* BEFORE - 输入图1（商品图/素材A） */}
      {hasUploadedImage && (
        <div className={`theme-card rounded-xl p-3 ${hasOnlyOneImage ? 'flex-1' : ''}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
              BEFORE
            </span>
            <span className="text-xs text-muted-foreground">素材A</span>
            {aspectRatio && (
              <span className="text-xs text-muted-foreground/50">({aspectRatio})</span>
            )}
          </div>
          {/* 根据图片比例动态调整容器 */}
          <div
            className="rounded-lg overflow-hidden relative mx-auto"
            style={{
              aspectRatio: cssAspectRatio,
              maxHeight: hasOnlyOneImage ? '100%' : '300px',
              width: hasOnlyOneImage ? '100%' : 'auto',
              backgroundColor: 'rgba(17, 24, 39, 0.5)',
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
        <div className={`theme-card rounded-xl p-3 ${hasOnlyOneImage ? 'flex-1' : ''}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
              BEFORE
            </span>
            <span className="text-xs text-muted-foreground">素材B</span>
            {aspectRatio && (
              <span className="text-xs text-muted-foreground/50">({aspectRatio})</span>
            )}
          </div>
          {/* 根据图片比例动态调整容器 */}
          <div
            className="rounded-lg overflow-hidden relative mx-auto"
            style={{
              aspectRatio: cssAspectRatio,
              maxHeight: hasOnlyOneImage ? '100%' : '300px',
              width: hasOnlyOneImage ? '100%' : 'auto',
              backgroundColor: 'rgba(17, 24, 39, 0.5)',
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

      {/* 只有一张图片时，显示生成信息卡片 */}
      {hasOnlyOneImage && (
        <>
          {/* 生成信息卡片 */}
          <div className="theme-card rounded-xl p-4 bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
              <Settings size={14} className="text-primary" />
              <span className="text-xs font-medium text-foreground">生成配置</span>
            </div>

            {/* 配置信息列表 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">图片比例</span>
                <span className="text-foreground font-medium">{aspectRatio || '3:4'}</span>
              </div>

              {mode && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">生成模式</span>
                  <span className="text-foreground font-medium">
                    {mode === 'scene' && '场景生图'}
                    {mode === 'tryon' && '虚拟试衣'}
                    {mode === 'wear' && '智能穿搭'}
                    {mode === 'combine' && '自由排版'}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock size={12} />
                  预估耗时
                </span>
                <span className="text-primary font-medium">{getEstimatedTime()}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">图片模型</span>
                <span className="text-foreground font-medium">{getModelDisplayName()}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Sparkles size={12} />
                  画质
                </span>
                <span className="text-foreground font-medium">{getQualityDisplayName()}</span>
              </div>

              {prompt && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <p className="text-[10px] text-muted-foreground mb-1">提示词</p>
                  <p className="text-xs text-foreground line-clamp-2">{prompt}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
