/**
 * SidebarActionButtons - 侧边栏操作按钮组件
 */

import { Download } from 'lucide-react';

interface SidebarActionButtonsProps {
  selectedCount: number;
  onBatchDownload: () => void;
  onDownloadAll: () => void;
}

export function SidebarActionButtons({
  selectedCount,
  onBatchDownload,
  onDownloadAll,
}: SidebarActionButtonsProps) {
  return (
    <div className="flex gap-2 p-3 border-b border-border/20">
      <button
        onClick={onBatchDownload}
        disabled={selectedCount === 0}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-primary/10 hover:bg-primary/20 text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <Download size={14} />
        <span>下载选中 ({selectedCount})</span>
      </button>
      <button
        onClick={onDownloadAll}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
      >
        <Download size={14} />
        <span>下载全部</span>
      </button>
    </div>
  );
}
