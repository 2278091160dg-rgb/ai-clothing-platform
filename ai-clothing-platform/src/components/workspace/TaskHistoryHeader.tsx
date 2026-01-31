/**
 * TaskHistoryHeader - 任务历史面板头部
 */

import { Trash2, Download } from 'lucide-react';
import type { TaskData } from '@/lib/types';

interface TaskHistoryHeaderProps {
  tasks: TaskData[];
  isBatchMode: boolean;
  selectedCount: number;
  isAllSelected: boolean;
  onToggleBatchMode: () => void;
  onClearHistory: () => void;
  onBatchDownload: () => void;
  onToggleSelectAll: () => void;
}

export function TaskHistoryHeader({
  tasks,
  isBatchMode,
  selectedCount,
  isAllSelected,
  onToggleBatchMode,
  onClearHistory,
  onBatchDownload,
  onToggleSelectAll,
}: TaskHistoryHeaderProps) {
  return (
    <div className="p-5 border-b border-border/30 flex items-center justify-between">
      <h3 className="text-[15px] font-bold text-foreground">历史记录</h3>
      <div className="flex items-center gap-2">
        {isBatchMode ? (
          <>
            {/* 批量模式操作按钮 */}
            {selectedCount > 0 && (
              <button
                onClick={onBatchDownload}
                className="text-xs text-primary hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
              >
                <Download size={12} />
                打包下载 ({selectedCount})
              </button>
            )}
            <button
              onClick={onToggleSelectAll}
              className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              {isAllSelected ? '取消全选' : '全选'}
            </button>
            <button
              onClick={onToggleBatchMode}
              className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              退出
            </button>
          </>
        ) : (
          <>
            {tasks.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-muted-foreground hover:text-red-400 font-medium flex items-center gap-1 transition-colors"
              >
                <Trash2 size={12} />
                清空
              </button>
            )}
            <button
              onClick={onToggleBatchMode}
              className="text-xs text-primary hover:text-blue-300 font-medium transition-colors"
            >
              批量管理
            </button>
          </>
        )}
      </div>
    </div>
  );
}
