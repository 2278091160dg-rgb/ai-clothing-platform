/**
 * LoadingAnimation - AI 生成加载动画组件
 *
 * 功能：
 * - 显示生成进度
 * - 动态切换状态文案
 * - 显示遥测数据（耗时、Token计数）
 */

'use client';

import { useEffect, useState } from 'react';
import { getLoadingStatusMessages, type LoadingStatusMessage } from '@/lib/types/history.types';

interface LoadingAnimationProps {
  isGenerating: boolean;
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

export function LoadingAnimation({ isGenerating }: LoadingAnimationProps) {
  const [statusIndex, setStatusIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    elapsedTime: 0,
    tokenCount: 0,
  });

  // 获取 loading 状态消息（避免循环依赖）
  const LOADING_STATUS_MESSAGES = getLoadingStatusMessages();

  // 重置状态（当生成停止时）
  useEffect(() => {
    if (!isGenerating) {
      setProgress(15);
      setTelemetry({ elapsedTime: 0, tokenCount: 0 });
      setStatusIndex(0);
    }
  }, [isGenerating]);

  // 定时切换 Loading 文案、进度、遥测数据（仅当生成中时运行）
  useEffect(() => {
    if (!isGenerating) {
      return;
    }

    // 切换文案（每 2 秒）
    const statusInterval = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % LOADING_STATUS_MESSAGES.length);
    }, 2000);

    // 模拟进度增长（每 500ms）
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 5 + 2;
      });
    }, 500);

    // 遥测数据更新（每 100ms）
    const telemetryInterval = setInterval(() => {
      setTelemetry(prev => ({
        elapsedTime: prev.elapsedTime + 0.1,
        tokenCount:
          prev.tokenCount >= 1500
            ? prev.tokenCount
            : prev.tokenCount + Math.floor(Math.random() * 50) + 10,
      }));
    }, 100);

    return () => {
      clearInterval(statusInterval);
      clearInterval(progressInterval);
      clearInterval(telemetryInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating]);

  if (!isGenerating) {
    return null;
  }

  const statusMessage: LoadingStatusMessage = LOADING_STATUS_MESSAGES[statusIndex];
  const StatusIcon = statusMessage.icon;

  return (
    <div className="theme-card rounded-xl p-6 text-center">
      {/* 进度圆环 */}
      <div className="relative w-24 h-24 mx-auto mb-4">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* 背景圆环 */}
          <circle cx="50" cy="50" r="45" fill="none" className="stroke-gray-700" strokeWidth="8" />
          {/* 进度圆环 */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            className="stroke-primary transition-all duration-300"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
          />
        </svg>
        {/* 中间百分比 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* 状态图标和文案 */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <StatusIcon className="w-6 h-6 text-primary animate-pulse" />
        <p className="text-sm font-medium text-foreground">{statusMessage.text}</p>
      </div>

      {/* 遥测数据 */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span>⏱️</span>
          <span>{formatTime(telemetry.elapsedTime)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🔥</span>
          <span>{telemetry.tokenCount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
