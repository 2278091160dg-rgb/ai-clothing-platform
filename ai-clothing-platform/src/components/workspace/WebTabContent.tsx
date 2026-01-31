/**
 * WebTabContent - 网页端任务列表组件
 *
 * 显示网页端提交的单张图片任务
 */

'use client';

import { type TaskData } from '@/lib/types';
import { type ImageItem } from '@/hooks/use-canvas-view-mode';
import Image from 'next/image';

interface WebTabContentProps {
  tasks: TaskData[];
  onImageClick: (image: ImageItem) => void;
  selectedImageIds: string[];
}

export function WebTabContent({ tasks, onImageClick, selectedImageIds }: WebTabContentProps) {
  console.log('🔍 [DEBUG WebTabContent] 渲染:', {
    tasksCount: tasks.length,
    tasks: tasks.map(t => ({
      id: t.id,
      status: t.status,
      source: t.source,
      type: t.type,
      hasImage: !!t.resultImages?.[0],
    })),
  });

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
        暂无网页端任务
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2">
      {tasks.map(task => {
        const imageUrl = task.resultImages?.[0];
        const isProcessing =
          task.status === 'processing' || task.status === 'generating' || task.status === 'pending';

        // 处理中的任务显示加载卡片
        if (isProcessing && !imageUrl) {
          return (
            <div
              key={task.id}
              className="group relative rounded-xl bg-card/40 border border-border/20 overflow-hidden"
            >
              <div className="aspect-[3/4] flex flex-col items-center justify-center p-4">
                {/* 加载动画 */}
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
                <p className="text-xs text-muted-foreground text-center">AI 正在生成中...</p>
                <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-full">
                  {task.prompt}
                </p>
                {/* 进度 */}
                {task.progress > 0 && (
                  <div className="w-full mt-3">
                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 text-center">
                      {task.progress}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        }

        // 有图片的任务显示图片卡片
        if (!imageUrl) return null;

        const isSelected = selectedImageIds.includes(task.id);

        return (
          <div
            key={task.id}
            className="group relative rounded-xl bg-card/40 border border-border/20 hover:bg-card/60 hover:border-border/30 transition-all overflow-hidden"
          >
            {/* 图片 */}
            <div
              className="aspect-[3/4] relative cursor-pointer"
              onClick={() =>
                onImageClick({
                  id: task.id,
                  url: imageUrl,
                  prompt: task.prompt,
                  productName: task.productName,
                  createdAt: task.createdAt,
                  source: task.source,
                })
              }
            >
              <Image
                src={`/api/image-proxy?url=${encodeURIComponent(imageUrl)}`}
                alt={task.productName || task.prompt}
                width={200}
                height={200}
                className="w-full h-full object-cover"
                unoptimized
              />
              {/* 对比复选框 */}
              <div
                className={`absolute top-2 right-2 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-primary border-primary'
                    : 'bg-black/50 border-white/30 group-hover:border-white/60'
                }`}
                onClick={e => {
                  e.stopPropagation();
                  onImageClick({
                    id: task.id,
                    url: imageUrl,
                    prompt: task.prompt,
                    productName: task.productName,
                    createdAt: task.createdAt,
                    source: task.source,
                  });
                }}
              >
                {isSelected && <span className="text-white text-xs">✓</span>}
              </div>
            </div>

            {/* 元数据 */}
            <div className="p-2">
              <p className="text-xs text-muted-foreground truncate">{task.prompt}</p>
              {task.createdAt && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(task.createdAt).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
