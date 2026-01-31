/**
 * ResultPanel Subcomponents - 结果面板子组件
 */

import { Button } from '@/components/ui/button';
import { Sparkles, Download, X, Zap, Coins, Clock } from 'lucide-react';
import Image from 'next/image';
import { ImageComparison } from '@/components/ImageComparison';
import type { ImageModel } from '@/lib/types';

interface ResultDisplayProps {
  resultUrl: string;
  productImage?: string;
  onDownload: () => void;
  onReset?: () => void;
}

export function ResultDisplay({
  resultUrl,
  productImage,
  onDownload,
  onReset,
}: ResultDisplayProps) {
  const showComparison = productImage;

  return (
    <div className="flex-1 theme-card rounded-2xl p-8 flex flex-col items-start justify-start relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="relative text-center w-full min-h-[400px] flex flex-col items-center justify-center">
        {showComparison ? (
          <div className="w-full h-full min-h-[400px]">
            <ImageComparison before={productImage!} after={resultUrl} onDownload={onDownload} />
          </div>
        ) : (
          <>
            {/* 结果图片 */}
            <div className="relative mb-6">
              <Image
                src={resultUrl}
                alt="AI生成的图片"
                width={800}
                height={600}
                className="max-w-full max-h-[400px] rounded-lg shadow-2xl"
                unoptimized
              />
              {/* 完成标记 */}
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles size={24} className="text-white" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-3">生成完成!</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">您的AI生成图片已准备就绪</p>

            {/* 结果操作按钮 */}
            <div className="relative flex gap-3">
              <Button
                onClick={onDownload}
                variant="outline"
                className="bg-card/40 backdrop-blur-sm border-border/30 hover:bg-card/60 text-foreground rounded-full"
              >
                <Download size={16} className="mr-2" />
                下载图片
              </Button>
              <Button
                onClick={onReset}
                variant="outline"
                className="bg-card/40 backdrop-blur-sm border-border/30 hover:bg-card/60 text-foreground rounded-full"
              >
                <X size={16} className="mr-2" />
                清空结果
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface ResultStatusBarProps {
  imageModel: ImageModel;
  isPolling: boolean;
}

export function ResultStatusBar({ imageModel, isPolling }: ResultStatusBarProps) {
  return (
    <div className="theme-card-light rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">当前模型</p>
              <p className="text-sm font-semibold text-foreground">{imageModel}</p>
            </div>
          </div>

          <div className="h-8 w-px bg-border/30" />

          <div className="flex items-center gap-2">
            <Coins size={16} className="text-yellow-500" />
            <div>
              <p className="text-[10px] text-muted-foreground">Token消耗</p>
              <p className="text-sm font-semibold text-foreground">~1500</p>
            </div>
          </div>

          <div className="h-8 w-px bg-border/30" />

          <div className="flex items-center gap-2">
            <Clock size={16} className="text-blue-500" />
            <div>
              <p className="text-[10px] text-muted-foreground">预计耗时</p>
              <p className="text-sm font-semibold text-foreground">30-60秒</p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-muted-foreground">服务状态</p>
          <p className="text-sm font-semibold text-green-400">{isPolling ? '轮询中...' : '在线'}</p>
        </div>
      </div>
    </div>
  );
}
