/**
 * 任务列表组件 - 多主题支持
 */

'use client';

import { useState } from 'react';
import { TaskData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { GENERATION_STEPS, formatTimeRemaining } from '@/lib/progress';
import { ImageIcon, Loader2, CheckCircle2, XCircle, Download, Eye, Clock, Zap } from 'lucide-react';
import { ImagePreview } from '@/components/image-preview';

// 格式化任务时间 - 显示具体时间
function formatTaskTime(date: Date): string {
  const now = new Date();
  const taskDate = new Date(date);
  const diffMs = now.getTime() - taskDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // 如果是今天，显示具体时间
  if (taskDate.toDateString() === now.toDateString()) {
    return `今天 ${taskDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }

  // 如果是昨天
  if (diffDays === 1) {
    return `昨天 ${taskDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }

  // 如果是前天
  if (diffDays === 2) {
    return `前天 ${taskDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }

  // 如果在7天内
  if (diffDays < 7) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[taskDate.getDay()];
    return `${weekday} ${taskDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }

  // 超过7天，显示完整日期
  return taskDate.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface TaskListProps {
  tasks: TaskData[];
  onPreview?: (src: string) => void;
  onLoadToMainView?: (task: TaskData) => void; // 🔧 新增：点击任务加载到主视图
  isBatchMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelection?: (taskId: string, selected: boolean) => void;
}

export function TaskList({
  tasks,
  onPreview,
  onLoadToMainView,
  isBatchMode = false,
  selectedIds = new Set(),
  onToggleSelection,
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
          <TaskItem
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

interface TaskItemProps {
  task: TaskData;
  onPreview?: (src: string) => void;
  onLoadToMainView?: (task: TaskData) => void; // 🔧 新增：加载到主视图回调
  isBatchMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (taskId: string, selected: boolean) => void;
}

function TaskItem({
  task,
  onPreview,
  onLoadToMainView,
  isBatchMode = false,
  isSelected = false,
  onToggleSelection,
}: TaskItemProps) {
  const isPending = task.status === 'pending';
  const isProcessing = task.status === 'processing' || task.status === 'generating';
  const isCompleted = task.status === 'completed';
  const isFailed = task.status === 'failed';

  return (
    <div
      className={`rounded-xl bg-card/40 border border-border/20 p-4 hover:bg-card/60 hover:border-border/30 transition-all duration-200 ${
        isCompleted && onLoadToMainView ? 'cursor-pointer' : ''
      }`}
      onClick={() => {
        // 🔧 只有已完成的任务才支持点击加载到主视图
        if (isCompleted && onLoadToMainView) {
          onLoadToMainView(task);
        }
      }}
    >
      {/* 任务头部 */}
      <div className="flex items-start gap-3 mb-3">
        {/* 批量模式复选框 */}
        {isBatchMode && onToggleSelection && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={e => onToggleSelection(task.id, e.target.checked)}
            className="w-4 h-4 mt-1 rounded border-border/30 bg-card/50 text-primary focus:ring-primary/50 focus:ring-2"
          />
        )}
        {/* 缩略图 - 添加点击预览功能 */}
        <div
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0 border border-primary/10 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
          onClick={() => {
            // 优先打开结果图，其次商品图
            const imageUrl =
              task.resultImages?.[0] ||
              (typeof task.productImage === 'string' ? task.productImage : null);
            if (imageUrl && onPreview) {
              onPreview(imageUrl);
            }
          }}
          title="点击查看大图"
        >
          {task.resultImages && task.resultImages.length > 0 ? (
            <Image
              src={`/api/image-proxy?url=${encodeURIComponent(task.resultImages[0])}`}
              alt=""
              width={48}
              height={48}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : task.productImage && typeof task.productImage === 'string' ? (
            <Image
              src={`/api/image-proxy?url=${encodeURIComponent(task.productImage)}`}
              alt=""
              width={48}
              height={48}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : isProcessing ? (
            <Loader2 size={24} className="animate-pulse text-primary" />
          ) : (
            <ImageIcon size={24} className="opacity-40 text-muted-foreground" />
          )}
        </div>

        {/* 任务信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-foreground truncate">
              {task.productName ||
                (task.prompt
                  ? task.prompt.length > 15
                    ? task.prompt.slice(0, 15) + '...'
                    : task.prompt
                  : `任务 ${task.id.slice(0, 6)}`)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-1">
            {task.prompt || '无提示词'}
          </p>
          {/* 具体创建时间 */}
          {task.createdAt && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {formatTaskTime(task.createdAt)}
            </p>
          )}
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
          {task.currentStep ? (
            <div className="flex items-center gap-2 text-xs">
              <Zap size={14} className="text-primary animate-pulse" />
              <span className="font-medium text-foreground">
                {GENERATION_STEPS[task.currentStep].name}
              </span>
              <span className="text-muted-foreground">
                - {GENERATION_STEPS[task.currentStep].description}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <Zap size={14} className="text-primary animate-pulse" />
              <span className="font-medium text-blue-400">生成中...</span>
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
                // 使用模态框预览
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

// 处理下载 - 使用代理避免飞书授权问题
async function handleDownload(task: TaskData) {
  if (task.resultImages && task.resultImages.length > 0) {
    try {
      const imageUrl = task.resultImages[0];
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `task-${task.id}-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('下载失败:', error);
    }
  }
}
