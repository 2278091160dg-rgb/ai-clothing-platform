/**
 * TableTabContent - 表格端任务批次列表组件
 *
 * 显示飞书表格端提交的批量任务
 */

'use client';

import { type BatchObject } from '@/hooks/use-canvas-view-mode';

interface TableTabContentProps {
  batches: BatchObject[];
  onBatchClick: (batch: BatchObject) => void;
}

export function TableTabContent({ batches, onBatchClick }: TableTabContentProps) {
  if (batches.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
        暂无表格端任务
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2">
      {batches.map(batch => (
        <div
          key={batch.id}
          onClick={() => onBatchClick(batch)}
          className="theme-card-light rounded-lg p-3 hover:bg-card/60 cursor-pointer transition-all"
        >
          {/* 批次标题 */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-foreground truncate flex-1">
              {batch.prompt.slice(0, 30)}...
            </p>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ml-2 ${
                batch.status === 'completed'
                  ? 'bg-green-500/20 text-green-400'
                  : batch.status === 'processing'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              {batch.status === 'completed'
                ? '已完成'
                : batch.status === 'processing'
                  ? '生成中'
                  : '待处理'}
            </span>
          </div>

          {/* 进度条 */}
          {batch.status === 'processing' && (
            <div className="mb-2">
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${batch.progress}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">进度 {batch.progress}%</p>
            </div>
          )}

          {/* 图片数量 */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>包含 {batch.images.length} 张图片</span>
            {batch.images.length > 0 && <span className="text-primary">点击查看 →</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
