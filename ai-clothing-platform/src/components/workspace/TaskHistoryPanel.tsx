/**
 * TaskHistoryPanel - 任务历史面板
 *
 * 拆分后的结构：
 * - hooks/use-batch-selection.ts: 批量选择状态
 * - services/batch-download.service.ts: 批量下载逻辑
 * - TaskHistoryHeader.tsx: 头部组件
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { TaskList } from '@/components/tasks/task-list';
import { TaskHistoryHeader } from './TaskHistoryHeader';
import { useBatchSelection } from '@/hooks/use-batch-selection';
import { BatchDownloadService } from '@/lib/services/batch-download.service';
import type { TaskData } from '@/lib/types';

interface TaskHistoryPanelProps {
  tasks: TaskData[];
  onPreview: (src: string) => void;
  onLoadToMainView?: (task: TaskData) => void;
  onClearHistory: () => void;
}

export function TaskHistoryPanel({
  tasks,
  onPreview,
  onLoadToMainView,
  onClearHistory,
}: TaskHistoryPanelProps) {
  const [isBatchMode, setIsBatchMode] = useState(false);
  const {
    selectedIds,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    selectionCount,
  } = useBatchSelection();

  // 切换批量管理模式
  const handleToggleBatchMode = () => {
    setIsBatchMode(prev => {
      if (!prev) {
        // 进入批量模式
        return true;
      } else {
        // 退出批量模式
        clearSelection();
        return false;
      }
    });
  };

  // 全选/取消全选
  const handleToggleSelectAll = () => {
    const completedTaskIds = BatchDownloadService.getCompletedTaskIds(tasks);
    toggleSelectAll(completedTaskIds);
  };

  // 批量下载
  const handleBatchDownload = async () => {
    await BatchDownloadService.downloadAsZip(
      tasks,
      selectedIds,
      count => {
        toast.success('下载完成', {
          description: `已打包 ${count} 张图片`,
        });
      },
      error => {
        toast.error('下载失败', {
          description: error.message,
        });
      }
    );
  };

  const completedCount = BatchDownloadService.getCompletedTaskCount(tasks);

  return (
    <div className="w-[300px] flex flex-col">
      <div className="theme-card rounded-2xl flex-1 flex flex-col overflow-hidden">
        <TaskHistoryHeader
          tasks={tasks}
          isBatchMode={isBatchMode}
          selectedCount={selectionCount}
          isAllSelected={isAllSelected(
            completedCount > 0 ? BatchDownloadService.getCompletedTaskIds(tasks) : []
          )}
          onToggleBatchMode={handleToggleBatchMode}
          onClearHistory={onClearHistory}
          onBatchDownload={handleBatchDownload}
          onToggleSelectAll={handleToggleSelectAll}
        />
        <TaskList
          tasks={tasks}
          onPreview={onPreview}
          onLoadToMainView={onLoadToMainView}
          isBatchMode={isBatchMode}
          selectedIds={selectedIds}
          onToggleSelection={toggleSelection}
        />
      </div>
    </div>
  );
}
