/**
 * ResultPanel - 结果展示面板
 */

import { Button } from '@/components/ui/button';
import { Sparkles, Palette, Download, RefreshCw, Database, Zap, Coins, Clock, Loader2 } from 'lucide-react';
import type { ImageModel, TaskData } from '@/lib/types';

interface ResultPanelProps {
  tasks: TaskData[];
  imageModel: ImageModel;
}

export function ResultPanel({ tasks, imageModel }: ResultPanelProps) {
  const isGenerating = tasks.some(t => t.status === 'generating' || t.status === 'processing');

  return (
    <>
      {/* 结果展示区 */}
      <div className="flex-1 theme-card rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

        {/* 根据是否有正在生成的任务显示不同内容 */}
        {isGenerating ? (
          <div className="relative text-center">
            {/* AI生成中动效 */}
            <div className="relative mb-6">
              <div className="w-32 h-32 mx-auto relative">
                {/* 外圈旋转 */}
                <div
                  className="absolute inset-0 rounded-full border-4 border-primary/20 animate-spin"
                  style={{ animationDuration: '3s' }}
                />
                <div
                  className="absolute inset-2 rounded-full border-4 border-transparent border-t-primary/60 animate-spin"
                  style={{ animationDuration: '2s' }}
                />
                <div
                  className="absolute inset-4 rounded-full border-4 border-transparent border-t-primary animate-spin"
                  style={{ animationDuration: '1s' }}
                />

                {/* 中心图标 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={48} className="text-primary animate-pulse" />
                </div>

                {/* 脉冲波纹 */}
                <div
                  className="absolute inset-0 rounded-full bg-primary/10 animate-ping"
                  style={{ animationDuration: '2s' }}
                />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-3">AI正在生成中...</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              请耐心等待，预计需要30-60秒完成生成
            </p>

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
              <span>正在调用DeerAPI进行图像生成...</span>
            </div>
          </div>
        ) : (
          <div className="relative text-center">
            <Palette
              size={64}
              className="mx-auto mb-5 float-animation opacity-30 text-primary"
            />
            <h3 className="text-2xl font-bold text-foreground mb-3">等待生成</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              上传商品图片并填写提示词后，点击生成按钮开始创作
            </p>
          </div>
        )}

        {/* 结果操作按钮 */}
        <div className="relative flex gap-3 mt-10">
          <Button
            variant="outline"
            className="bg-card/40 backdrop-blur-sm border-border/30 hover:bg-card/60 text-foreground rounded-full"
            disabled
          >
            <Download size={16} className="mr-2" />
            下载图片
          </Button>
          <Button
            variant="outline"
            className="bg-card/40 backdrop-blur-sm border-border/30 hover:bg-card/60 text-foreground rounded-full"
            disabled
          >
            <RefreshCw size={16} className="mr-2" />
            重新生成
          </Button>
          <Button className="btn-success rounded-full" disabled>
            <Database size={16} className="mr-2" />
            保存到飞书
          </Button>
        </div>
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
            <p className="text-[10px] text-muted-foreground">DeerAPI状态</p>
            <p className="text-sm font-semibold text-green-400">在线</p>
          </div>
        </div>
      </div>
    </>
  );
}
