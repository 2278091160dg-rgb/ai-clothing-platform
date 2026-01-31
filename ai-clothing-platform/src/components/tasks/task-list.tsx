/**
 * 任务列表组件 - 多主题支持
 *
 * 拆分后结构：
 * - TaskListItem: 单个任务项组件
 * - task-time-formatters: 时间格式化工具
 * - task-download-utils: 下载工具
 */

'use client';

import { useState } from 'react';
import { TaskData } from '@/lib/types';
import { ImageIcon } from 'lucide-react';
import { ImagePreview } from '@/components/image-preview';
import { TaskListItem } from './TaskListItem';

interface TaskListProps {
  tasks: TaskData[];
  onPreview?: (src: string) => void;
  onLoadToMainView?: (task: TaskData) => void;
  isBatchMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelection?: (taskId: string, selected: boolean) => void;
}

export function TaskList({
  tasks,
  onLoadToMainView,
  isBatchMode = false,
  selectedIds = new Set(),
  onToggleSelection,
  // onPreview is kept for interface compatibility but not used in this component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPreview: _onPreview,
}: TaskListProps) {
  // 预览状态
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // 打开预览
  const handleOpenPreview = (imageUrl: string) => {
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    setPreviewImageUrl(proxyUrl);
  };

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <ImageIcon size={48} className="mx-auto mb-3 opacity-20 text-muted-foreground" />
          <p className="text-sm text-muted-foreground font-medium">
            暂无历史记录，快去生成第一张图片吧！
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
        {tasks.map(task => (
          <TaskListItem
            key={task.id}
            task={task}
            onPreview={handleOpenPreview}
            onLoadToMainView={onLoadToMainView}
            isBatchMode={isBatchMode}
            isSelected={selectedIds.has(task.id)}
            onToggleSelection={onToggleSelection}
          />
        ))}
        {tasks.length > 0 && (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">已显示全部 {tasks.length} 条记录</p>
          </div>
        )}
      </div>

      {/* 图片预览模态框 */}
      {previewImageUrl && (
        <ImagePreview
          src={previewImageUrl}
          alt="预览图片"
          onClose={() => setPreviewImageUrl(null)}
        />
      )}
    </>
  );
}
