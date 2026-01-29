/**
 * 任务列表组件 - 多主题支持
 */

'use client';

import { TaskData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { GENERATION_STEPS, formatTimeRemaining } from '@/lib/progress';
import { ImageIcon, Loader2, CheckCircle2, XCircle, Download, Eye, Clock, Zap } from 'lucide-react';

interface TaskListProps {
  tasks: TaskData[];
  onPreview?: (src: string) => void;
}

export function TaskList({ tasks, onPreview }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <ImageIcon size={48} className="mx-auto mb-3 opacity-20 text-muted-foreground" />
          <p className="text-sm text-muted-foreground font-medium">暂无历史记录</p>
          <p className="text-xs text-muted-foreground/50 mt-1">生成的任务会显示在这里</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} onPreview={onPreview} />
      ))}
      {tasks.length > 0 && (
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">已显示全部 {tasks.length} 条记录</p>
        </div>
      )}
    </div>
  );
}

interface TaskItemProps {
  task: TaskData;
  onPreview?: (src: string) => void;
}

function TaskItem({ task, onPreview }: TaskItemProps) {
  const isPending = task.status === 'pending';
  const isProcessing = task.status === 'processing' || task.status === 'generating';
  const isCompleted = task.status === 'completed';
  const isFailed = task.status === 'failed';

  return (
    <div className="rounded-xl bg-card/40 border border-border/20 p-4 hover:bg-card/60 hover:border-border/30 transition-all duration-200">
      {/* 任务头部 */}
      <div className="flex items-start gap-3 mb-3">
        {/* 缩略图 */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0 border border-primary/10">
          {task.resultImages && task.resultImages.length > 0 ? (
            <img src={task.resultImages[0]} alt="" className="w-full h-full object-cover" />
          ) : isProcessing ? (
            <Loader2 size={24} className="animate-pulse text-primary" />
          ) : (
            <ImageIcon size={24} className="opacity-40 text-muted-foreground" />
          )}
        </div>

        {/* 任务信息 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {task.productName || `任务 ${task.id.slice(0, 6)}`}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-1">{task.prompt || '无提示词'}</p>
        </div>

        {/* 状态图标 */}
        <div className="flex-shrink-0">
          {isPending && <Clock size={10} className="text-gray-400" />}
          {isProcessing && <Loader2 size={10} className="text-yellow-400 animate-spin" />}
          {isCompleted && <CheckCircle2 size={10} className="text-green-400" />}
          {isFailed && <XCircle size={10} className="text-red-400" />}
        </div>
      </div>

      {/* 待处理状态 */}
      {isPending && (
        <p className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 mt-3">
          <Clock size={16} className="text-gray-400" />
          等待处理...
        </p>
      )}

      {/* 进度条/状态 */}
      {isProcessing && (
        <div className="space-y-3">
          {/* 当前步骤信息 */}
          {task.currentStep && (
            <div className="flex items-center gap-2 text-xs">
              <Zap size={14} className="text-primary animate-pulse" />
              <span className="font-medium text-foreground">
                {GENERATION_STEPS[task.currentStep].name}
              </span>
              <span className="text-muted-foreground">
                - {GENERATION_STEPS[task.currentStep].description}
              </span>
            </div>
          )}

          {/* 进度条 */}
          <div className="h-2 rounded-full progress-bar">
            <div
              className="h-full rounded-full progress-bar-fill"
              style={{ width: `${task.progress}%` }}
            />
          </div>

          {/* 进度信息 */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">总进度 {Math.round(task.progress)}%</p>
            {task.estimatedTimeRemaining !== undefined && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={12} />
                {formatTimeRemaining(task.estimatedTimeRemaining)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 已完成操作 */}
      {isCompleted && (
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs font-semibold text-green-400 flex items-center gap-1.5">
            <CheckCircle2 size={16} className="text-green-400" />
            已完成
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-3 text-xs bg-card/40 hover:bg-card/60 text-foreground rounded-lg"
              onClick={() => {
                if (task.resultImages && task.resultImages.length > 0 && onPreview) {
                  onPreview(task.resultImages[0]);
                }
              }}
            >
              <Eye size={14} className="mr-1" />
              预览
            </Button>
            <Button
              size="sm"
              className="h-7 px-3 text-xs btn-primary rounded-lg"
              onClick={() => handleDownload(task)}
            >
              <Download size={14} className="mr-1" />
              下载
            </Button>
          </div>
        </div>
      )}

      {/* 失败状态 */}
      {isFailed && (
        <p className="text-xs font-semibold text-red-400 flex items-center gap-1.5 mt-3">
          <XCircle size={16} className="text-red-400" />
          生成失败
        </p>
      )}
    </div>
  );
}

// 处理下载
function handleDownload(task: TaskData) {
  if (task.resultImages && task.resultImages.length > 0) {
    const link = document.createElement('a');
    link.href = task.resultImages[0];
    link.download = `task-${task.id}.png`;
    link.click();
  }
}
