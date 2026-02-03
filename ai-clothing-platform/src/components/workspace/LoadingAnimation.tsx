/**
 * LoadingAnimation - AI 生成加载动画组件
 *
 * 等待体验优化（方案A+C+D组合）：
 * - 渐进式反馈（分析→生成→渲染）
 * - 快速预览（3秒后显示低质量预览）
 * - 并行操作提示
 * - 进度可见 + 预估时间
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { Sparkles, Image as ImageIcon, Zap, Clock, Upload } from 'lucide-react';

interface LoadingAnimationProps {
  isGenerating: boolean;
  previewUrl?: string | null;
}

interface TelemetryData {
  elapsedTime: number;
  tokenCount: number;
}

/**
 * 格式化时间显示
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

/**
 * 阶段配置
 */
const STAGE_CONFIG = {
  0: { icon: Upload, text: '正在上传...', color: 'text-blue-400', maxProgress: 20 },
  1: { icon: Sparkles, text: 'AI正在分析图片...', color: 'text-purple-400', maxProgress: 40 },
  2: { icon: ImageIcon, text: '生成场景中...', color: 'text-pink-400', maxProgress: 70 },
  3: { icon: Zap, text: '渲染最终图片...', color: 'text-cyan-400', maxProgress: 95 },
  4: { icon: Sparkles, text: '完成！', color: 'text-green-400', maxProgress: 100 },
};

export function LoadingAnimation({ isGenerating, previewUrl }: LoadingAnimationProps) {
  const [statusIndex, setStatusIndex] = useState(0);
  const [progress, setProgress] = useState(5);
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    elapsedTime: 0,
    tokenCount: 0,
  });
  const [showQuickPreview, setShowQuickPreview] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(10); // 预估10秒

  // 重置状态 - 使用 useRef 跟踪上一次的 isGenerating 值，避免在 effect 中同步调用多个 setState
  const prevIsGeneratingRef = useRef(isGenerating);
  useEffect(() => {
    // 只在 isGenerating 从 true 变为 false 时重置状态
    if (prevIsGeneratingRef.current && !isGenerating) {
      // 使用 setTimeout 批量更新状态，避免级联渲染
      setTimeout(() => {
        setProgress(5);
        setTelemetry({ elapsedTime: 0, tokenCount: 0 });
        setStatusIndex(0);
        setShowQuickPreview(false);
        setEstimatedTime(10);
      }, 0);
    }
    prevIsGeneratingRef.current = isGenerating;
  }, [isGenerating]);

  // 定时更新
  useEffect(() => {
    if (!isGenerating) {
      return;
    }

    // 切换文案（每 2 秒）
    const statusInterval = setInterval(() => {
      setStatusIndex(prev => {
        const next = (prev + 1) % 5;
        // 更新预估时间
        if (next === 1) setEstimatedTime(8);
        if (next === 2) setEstimatedTime(5);
        if (next === 3) setEstimatedTime(2);
        return next;
      });
    }, 2000);

    // 模拟进度增长
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const stageConfig = STAGE_CONFIG[statusIndex as keyof typeof STAGE_CONFIG];
        const maxProgress = stageConfig?.maxProgress || 90;
        if (prev >= maxProgress) return prev;
        return prev + Math.random() * 3 + 1;
      });
    }, 300);

    // 遥测数据更新
    const telemetryInterval = setInterval(() => {
      setTelemetry(prev => ({
        elapsedTime: prev.elapsedTime + 0.1,
        tokenCount:
          prev.tokenCount >= 1500
            ? prev.tokenCount
            : prev.tokenCount + Math.floor(Math.random() * 30) + 5,
      }));
    }, 100);

    // 3秒后显示快速预览
    const previewTimeout = setTimeout(() => {
      if (previewUrl) {
        setShowQuickPreview(true);
      }
    }, 3000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(progressInterval);
      clearInterval(telemetryInterval);
      clearTimeout(previewTimeout);
    };
  }, [isGenerating, statusIndex, previewUrl]);

  if (!isGenerating) {
    return null;
  }

  const stageConfig = STAGE_CONFIG[statusIndex as keyof typeof STAGE_CONFIG] || STAGE_CONFIG[0];
  const StageIcon = stageConfig.icon;
  const progressPercent = Math.min(Math.round(progress), 100);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      {/* 内容容器：背景渐变 + 微边框 */}
      <div className="w-full max-w-3xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-sm rounded-3xl border border-white/10 p-10 shadow-2xl">
        {/* 顶部：图标和状态 */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
            <StageIcon size={32} className={stageConfig.color + ' animate-pulse'} />
          </div>
          <p className="text-xl font-semibold text-foreground">{stageConfig.text}</p>
        </div>

        {/* 进度条 */}
        <div className="w-full max-w-2xl mb-8">
          <div className="h-4 bg-gray-700/50 rounded-full overflow-hidden mb-3 backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out shadow-lg"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-semibold text-lg text-white">{progressPercent}%</span>
            <span>预计剩余 {Math.max(0, estimatedTime - Math.floor(telemetry.elapsedTime))}秒</span>
          </div>
        </div>

        {/* 快速预览 */}
        {showQuickPreview && previewUrl && (
          <div className="w-full max-w-md mb-8 animate-fadeIn">
            <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 backdrop-blur-sm">
              <p className="text-sm text-muted-foreground py-3 px-4 flex items-center gap-2 border-b border-white/10">
                <Zap size={16} className="text-yellow-400" />
                <span className="font-medium">快速预览（正在优化...）</span>
              </p>
              <div className="aspect-square relative bg-black/50 p-4">
                <img
                  src={previewUrl}
                  alt="预览"
                  className="w-full h-full object-contain opacity-80 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* 并行操作提示 */}
        <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10 backdrop-blur-sm max-w-lg">
          <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2 font-medium">
            <Clock size={16} />
            <span>您现在可以：</span>
          </p>
          <ul className="text-sm text-muted-foreground/80 space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-blue-400">•</span>
              <span>准备下一张图片</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-400">•</span>
              <span>调整生成参数</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-pink-400">•</span>
              <span>查看历史记录</span>
            </li>
          </ul>
        </div>

        {/* 遥测数据 */}
        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <span>⏱️</span>
            <span className="font-medium">{formatTime(telemetry.elapsedTime)}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <span>🔥</span>
            <span className="font-medium">{telemetry.tokenCount.toLocaleString()}</span>
          </div>
        </div>

        {/* 提示 */}
        <p className="text-sm text-muted-foreground/50 text-center mt-6">
          请勿关闭页面，生成完成后会自动显示
        </p>
      </div>
    </div>
  );
}
