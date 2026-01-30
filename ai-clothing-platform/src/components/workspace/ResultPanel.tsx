/**
 * ResultPanel - 结果展示面板
 */

import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Download,
  Zap,
  Coins,
  Clock,
  Loader2,
  X,
  Image as ImageIcon,
  Wand2,
  Cpu,
  Palette,
} from 'lucide-react';
import type { ImageModel, TaskData } from '@/lib/types';
import { useState, useEffect } from 'react';
import { ImageComparison } from '@/components/ImageComparison';

interface ResultPanelProps {
  tasks: TaskData[];
  imageModel: ImageModel;
  isPolling?: boolean;
  isGenerating?: boolean;
  onReset?: () => void;
}

// 生成状态文案轮播 - 更有趣味性
const GENERATION_STATUS_MESSAGES = [
  { text: '正在解析场景语义...', icon: Wand2, tip: 'AI 正在理解您的创意' },
  { text: '正在分配高性能GPU...', icon: Cpu, tip: '调动计算资源中' },
  { text: 'AI 正在构图与光影渲染...', icon: Palette, tip: '艺术家正在工作' },
  { text: '正在进行细节精修...', icon: Sparkles, tip: '让画面更完美' },
  { text: '即将完成，请稍候...', icon: Zap, tip: '最后几秒' },
];

// 趣味等待文案
const WAITING_TIPS = [
  '💡 提示：详细的描述词能生成更准确的效果',
  '🎨 提示：尝试不同的场景模式发现更多可能',
  '⚡ 提示：生成时间约30-60秒，请耐心等待',
  '✨ 提示：支持 1:1、3:4、16:9、9:16 多种尺寸',
];

export function ResultPanel({ tasks, imageModel, isPolling = false, isGenerating = false, onReset }: ResultPanelProps) {
  const currentTask = tasks[0];
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // 每 4 秒切换状态文案
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatusIndex((prev) => (prev + 1) % GENERATION_STATUS_MESSAGES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // 每 8 秒切换提示文案
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % WAITING_TIPS.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('[ResultPanel] isGenerating prop:', isGenerating, 'tasks.length:', tasks.length, 'currentTask:', currentTask?.id, currentTask?.status);
  }, [isGenerating, tasks.length, currentTask]);

  const isTaskGenerating = currentTask?.status === 'generating' || currentTask?.status === 'processing' || currentTask?.status === 'pending';
const shouldShowGenerating = isGenerating || isTaskGenerating;
  const isCompleted = currentTask?.status === 'completed' && currentTask?.resultImages?.[0];
  const resultUrl = currentTask?.resultImages?.[0];
  const productImage = typeof currentTask?.productImage === 'string' ? currentTask.productImage : undefined;
  const showComparison = isCompleted && resultUrl && productImage;

  // 下载图片
  const handleDownload = () => {
    if (resultUrl) {
      const link = document.createElement('a');
      link.href = resultUrl;
      link.download = `ai-generated-${Date.now()}.png`;
      link.click();
    }
  };

  return (
    <>
      {/* 结果展示区 */}
      <div className="flex-1 theme-card rounded-2xl p-8 flex flex-col items-start justify-start relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

        {/* 任务进行中 */}
        {shouldShowGenerating && (
          <div className="relative text-center w-full flex items-center justify-center min-h-[400px]">
            {/* AI生成中动效 - 更炫酷的版本 */}
            <div className="relative mb-8">
              <div className="w-40 h-40 mx-auto relative">
                {/* 外圈旋转光晕 */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 via-blue-500/30 to-purple-500/30 animate-spin blur-xl" style={{ animationDuration: '4s' }} />

                {/* 外圈 */}
                <div
                  className="absolute inset-0 rounded-full border-4 border-primary/30 animate-spin"
                  style={{ animationDuration: '3s' }}
                />
                {/* 中圈 */}
                <div
                  className="absolute inset-3 rounded-full border-4 border-transparent border-t-blue-400/60 animate-spin"
                  style={{ animationDuration: '2s' }}
                />
                {/* 内圈 */}
                <div
                  className="absolute inset-6 rounded-full border-4 border-transparent border-t-purple-400 animate-spin"
                  style={{ animationDuration: '1s' }}
                />

                {/* 中心图标 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <Sparkles size={56} className="text-primary animate-pulse" />
                    {/* 中心脉冲 */}
                    <div
                      className="absolute inset-0 rounded-full bg-primary/20 animate-ping"
                      style={{ animationDuration: '2s' }}
                    />
                  </div>
                </div>

                {/* 粒子效果 */}
                <div className="absolute top-0 left-1/2 w-1 h-1 bg-primary rounded-full animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0s' }} />
                <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.3s' }} />
                <div className="absolute left-0 top-1/2 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.6s' }} />
                <div className="absolute right-0 top-1/2 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.9s' }} />
              </div>
            </div>

            {/* 状态消息 */}
            <div className="mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                {(() => {
                  const StatusIcon = GENERATION_STATUS_MESSAGES[currentStatusIndex].icon;
                  return <StatusIcon size={20} className="text-primary animate-pulse" />;
                })()}
                <h3 className="text-2xl font-bold text-foreground">AI正在生成中...</h3>
              </div>
              <p className="text-sm font-semibold text-primary max-w-md mb-1">
                {GENERATION_STATUS_MESSAGES[currentStatusIndex].text}
              </p>
              <p className="text-xs text-muted-foreground">
                {GENERATION_STATUS_MESSAGES[currentStatusIndex].tip}
              </p>
            </div>

            {/* 趣味提示卡片 */}
            <div className="bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-primary/20 rounded-xl p-3 max-w-md mx-auto mb-4">
              <p className="text-xs text-foreground/80">
                {WAITING_TIPS[currentTipIndex]}
              </p>
            </div>

            {/* 进度条 */}
            {currentTask?.progress !== undefined && (
              <div className="w-64 mx-auto mb-4">
                <div className="h-2 bg-card/60 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-primary via-blue-500 to-purple-500 transition-all duration-500 relative"
                    style={{ width: `${currentTask.progress}%` }}
                  >
                    {/* 进度条光效 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-muted-foreground">总进度</p>
                  <p className="text-sm font-bold text-primary">{currentTask.progress}%</p>
                </div>
              </div>
            )}

            {/* 模型信息卡片 */}
            <div className="bg-card/60 backdrop-blur-xl border border-border/30 rounded-xl p-4 max-w-md mx-auto mb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-primary" />
                  <span className="text-muted-foreground">使用模型</span>
                </div>
                <span className="font-semibold text-primary">{imageModel}</span>
              </div>
            </div>

            {/* 进度提示 */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 size={14} className="animate-spin" />
              <span>{isPolling ? '正在轮询任务状态...' : '正在处理中...'}</span>
            </div>
          </div>
        )}

        {/* 任务完成 - 显示结果 */}
        {isCompleted && resultUrl && (
          <div className="relative text-center w-full min-h-[400px] flex flex-col items-center justify-center">
            {showComparison ? (
              <div className="w-full h-full min-h-[400px]">
                <ImageComparison
                  before={productImage!}
                  after={resultUrl}
                  onDownload={handleDownload}
                />
              </div>
            ) : (
              <>
                {/* 结果图片 */}
                <div className="relative mb-6">
                  <img
                    src={resultUrl}
                    alt="AI生成的图片"
                    className="max-w-full max-h-[400px] rounded-lg shadow-2xl"
                  />
                  {/* 完成标记 */}
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles size={24} className="text-white" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-3">生成完成!</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-6">
                  您的AI生成图片已准备就绪
                </p>

                {/* 结果操作按钮 */}
                <div className="relative flex gap-3">
                  <Button
                    onClick={handleDownload}
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
        )}

        {/* 等待状态 */}
        {!shouldShowGenerating && !isCompleted && (
          <div className="relative text-center w-full flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative mb-6">
              <ImageIcon size={80} className="mx-auto opacity-20 text-primary animate-pulse" />
              {/* 装饰圆环 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-primary/20 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-3">等待生成</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              上传商品图片并填写提示词后，点击生成按钮开始创作
            </p>

            {/* 趣味提示卡片 */}
            <div className="bg-gradient-to-r from-primary/5 via-blue-500/5 to-purple-500/5 backdrop-blur-xl border border-primary/10 rounded-xl p-4 max-w-md">
              <p className="text-xs text-foreground/70">
                {WAITING_TIPS[currentTipIndex]}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 模型信息和统计卡片 */}
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
            <p className="text-sm font-semibold text-green-400">
              {isPolling ? '轮询中...' : '在线'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
