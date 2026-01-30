/**
 * TaskHistoryPanel - 任务历史面板
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { TaskList } from '@/components/tasks/task-list';
import { Trash2, Download } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { TaskData } from '@/lib/types';

interface TaskHistoryPanelProps {
  tasks: TaskData[];
  onPreview: (src: string) => void;
  onClearHistory: () => void;
}

export function TaskHistoryPanel({ tasks, onPreview, onClearHistory }: TaskHistoryPanelProps) {
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 切换批量管理模式
  const handleToggleBatchMode = () => {
    setIsBatchMode(prev => !prev);
    setSelectedIds(new Set());
  };

  // 切换单个任务选中状态
  const handleToggleSelection = (taskId: string, selected: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (selected) {
        next.add(taskId);
      } else {
        next.delete(taskId);
      }
      return next;
    });
  };

  // 全选/取消全选
  const handleToggleSelectAll = () => {
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.resultImages?.[0]);
    if (selectedIds.size === completedTasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(completedTasks.map(t => t.id)));
    }
  };

  // 批量下载
  const handleBatchDownload = async () => {
    if (selectedIds.size === 0) return;

    const zip = new JSZip();
    const folder = zip.folder('generated-images');
    let index = 0;

    try {
      for (const id of selectedIds) {
        const task = tasks.find(t => t.id === id);
        if (task?.resultImages?.[0]) {
          const response = await fetch(task.resultImages[0]);
          const blob = await response.blob();
          const filename = `${task.productName || 'image'}-${index + 1}.png`;
          folder?.file(filename.replace(/[^a-zA-Z0-9-_.]/g, '_'), blob);
          index++;
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `ai-generated-${Date.now()}.zip`);

      toast.success('下载完成', {
        description: `已打包 ${selectedIds.size} 张图片`,
      });
    } catch (error) {
      console.error('批量下载失败:', error);
      toast.error('下载失败', {
        description: error instanceof Error ? error.message : '未知错误',
      });
    }
  };
  return (
    <div className="w-[300px] flex flex-col">
      <div className="theme-card rounded-2xl flex-1 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-border/30 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-foreground">历史记录</h3>
          <div className="flex items-center gap-2">
            {isBatchMode ? (
              <>
                {/* 批量模式操作按钮 */}
                {selectedIds.size > 0 && (
                  <button
                    onClick={handleBatchDownload}
                    className="text-xs text-primary hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    <Download size={12} />
                    打包下载 ({selectedIds.size})
                  </button>
                )}
                <button
                  onClick={handleToggleSelectAll}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  {selectedIds.size === tasks.filter(t => t.status === 'completed').length ? '取消全选' : '全选'}
                </button>
                <button
                  onClick={handleToggleBatchMode}
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
                  onClick={handleToggleBatchMode}
                  className="text-xs text-primary hover:text-blue-300 font-medium transition-colors"
                >
                  批量管理
                </button>
              </>
            )}
          </div>
        </div>
        <TaskList
          tasks={tasks}
          onPreview={onPreview}
          isBatchMode={isBatchMode}
          selectedIds={selectedIds}
          onToggleSelection={handleToggleSelection}
        />
      </div>
    </div>
  );
}
