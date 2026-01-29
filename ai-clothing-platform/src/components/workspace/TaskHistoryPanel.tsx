/**
 * TaskHistoryPanel - 任务历史面板
 */

import { TaskList } from '@/components/tasks/task-list';
import { Trash2 } from 'lucide-react';
import type { TaskData } from '@/lib/types';

interface TaskHistoryPanelProps {
  tasks: TaskData[];
  onPreview: (src: string) => void;
  onClearHistory: () => void;
}

export function TaskHistoryPanel({ tasks, onPreview, onClearHistory }: TaskHistoryPanelProps) {
  const stats = {
    processing: tasks.filter(t => t.status === 'generating').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="w-[300px] flex flex-col">
      <div className="theme-card rounded-2xl flex-1 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-border/30 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-foreground">历史记录</h3>
          <div className="flex items-center gap-2">
            {tasks.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-muted-foreground hover:text-red-400 font-medium flex items-center gap-1 transition-colors"
              >
                <Trash2 size={12} />
                清空
              </button>
            )}
            <button className="text-xs text-primary hover:text-blue-300 font-medium">
              查看全部
            </button>
          </div>
        </div>
        <TaskList tasks={tasks} onPreview={onPreview} />
      </div>
    </div>
  );
}
