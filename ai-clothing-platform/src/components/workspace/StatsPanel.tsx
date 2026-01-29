/**
 * StatsPanel - 统计面板
 */

import type { TaskData } from '@/lib/types';

interface StatsPanelProps {
  tasks: TaskData[];
}

export function StatsPanel({ tasks }: StatsPanelProps) {
  const stats = {
    processing: tasks.filter(t => t.status === 'generating').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="theme-card-light rounded-xl p-4 text-center hover:shadow-lg transition-shadow">
        <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
          {tasks.length}
        </p>
        <p className="text-xs text-muted-foreground mt-1 font-medium">总任务</p>
      </div>
      <div className="theme-card-light rounded-xl p-4 text-center hover:shadow-lg transition-shadow">
        <p className="text-3xl font-bold text-yellow-400">{stats.processing}</p>
        <p className="text-xs text-muted-foreground mt-1 font-medium">生成中</p>
      </div>
      <div className="theme-card-light rounded-xl p-4 text-center hover:shadow-lg transition-shadow">
        <p className="text-3xl font-bold text-green-400">{stats.completed}</p>
        <p className="text-xs text-muted-foreground mt-1 font-medium">已完成</p>
      </div>
    </div>
  );
}
