/**
 * HiddenTasksBanner - 隐藏任务提示横幅组件
 */

import { EyeOff } from 'lucide-react';

interface HiddenTasksBannerProps {
  hiddenCount: number;
  onShowAll: () => void;
}

export function HiddenTasksBanner({ hiddenCount, onShowAll }: HiddenTasksBannerProps) {
  if (hiddenCount === 0) return null;

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/10">
      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
        <EyeOff size={12} />
        <span>已隐藏 {hiddenCount} 个任务</span>
      </span>
      <button
        onClick={onShowAll}
        className="text-xs text-primary hover:underline"
      >
        全部显示
      </button>
    </div>
  );
}
