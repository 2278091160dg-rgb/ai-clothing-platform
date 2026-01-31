/**
 * Task List Item Component
 * 任务列表项组件
 */

'use client';

import { TaskData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { GENERATION_STEPS, formatTimeRemaining } from '@/lib/progress';
import { ImageIcon, Loader2, CheckCircle2, XCircle, Download, Eye, Clock, Zap } from 'lucide-react';
import { formatTaskTime } from './task-time-formatters';
import { handleTaskDownload } from './task-download-utils';

interface TaskListItemProps {
  task: TaskData;
  onPreview?: (src: string) => void;
  onLoadToMainView?: (task: TaskData) => void;
  isBatchMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (taskId: string, selected: boolean) => void;
}

export function TaskListItem({
  task,
  onPreview,
  onLoadToMainView,
  isBatchMode = false,
  isSelected = false,
  onToggleSelection,
}: TaskListItemProps) {
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
        // 只有已完成的任务才支持点击加载到主视图
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
          <p className="text-xs text-muted-foreground truncate mt-1">{task.prompt || '无提示词'}</p>
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
              onClick={() => handleTaskDownload(task)}
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
