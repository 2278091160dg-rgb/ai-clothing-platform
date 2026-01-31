/**
 * SidebarTabs - 右侧侧边栏 Tabs 组件
 *
 * 包含两个 Tab:
 * - Web Tab: 网页端任务（单张图片流）
 * - Table Tab: 表格端任务（批次/行展示）
 *
 * 拆分后结构：
 * - WebTabContent: 网页端任务列表
 * - TableTabContent: 表格端批次列表
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { type TaskData } from '@/lib/types';
import { type ImageItem, type BatchObject } from '@/hooks/use-canvas-view-mode';
import { WebTabContent } from './WebTabContent';
import { TableTabContent } from './TableTabContent';

interface SidebarTabsProps {
  tasks: TaskData[];
  onImageClick: (image: ImageItem) => void;
  onBatchClick: (batch: BatchObject) => void;
  selectedImageIds?: string[];
  activeTab?: 'web' | 'table';
  onTabChange?: (tab: 'web' | 'table') => void;
}

export function SidebarTabs({
  tasks,
  onImageClick,
  onBatchClick,
  selectedImageIds = [],
  activeTab: controlledTab,
  onTabChange,
}: SidebarTabsProps) {
  // 使用受控状态，如果没有提供则使用内部状态
  const [internalTab, setInternalTab] = useState<'web' | 'table'>('web');
  const activeTab = controlledTab ?? internalTab;

  // 滚动容器 ref - 用于自动滚动到顶部
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tab: 'web' | 'table') => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  // ⚠️ 重构：严格的数据分流逻辑 - 双重标记确保互斥
  // 网页端：只显示 source === 'web' 或 type === 'web' 的任务
  const webTasks = tasks.filter(t => t.source === 'web' || t.type === 'web');

  // 表格端：**排除**所有网页端任务（source !== 'web' 且 type !== 'web'）
  const tableTasks = tasks.filter(t => t.source !== 'web' && t.type !== 'web');

  console.log('🔍 [DEBUG SidebarTabs] 双重标记互斥过滤:', {
    总任务数: tasks.length,
    网页端任务: webTasks.length,
    表格端任务: tableTasks.length,
    activeTab,
  });

  // 将表格端任务按批次分组
  const tableBatches: BatchObject[] = tableTasks.reduce((acc, task) => {
    // 从 task 对象获取批次ID，如果没有则基于 prompt 和时间生成
    const batchId =
      (task as TaskData & { batchId?: string }).batchId ||
      `${task.prompt}-${new Date(task.createdAt).getMinutes()}`;

    const existingBatch = acc.find(b => b.id === batchId);
    if (existingBatch) {
      const imageUrl =
        task.resultImages?.[0] ||
        (typeof task.productImage === 'string' ? task.productImage : undefined) ||
        '';
      if (imageUrl) {
        existingBatch.images.push({
          id: task.id,
          url: imageUrl,
          prompt: task.prompt,
          productName: task.productName,
          createdAt: task.createdAt,
          source: task.source,
          batchId,
        });
      }
      if (task.status === 'completed') {
        existingBatch.status = 'completed';
        existingBatch.progress = 100;
      } else if (task.status === 'processing') {
        existingBatch.status = 'processing';
        existingBatch.progress = Math.max(existingBatch.progress, task.progress);
      }
    } else {
      const imageUrl =
        task.resultImages?.[0] ||
        (typeof task.productImage === 'string' ? task.productImage : undefined) ||
        '';
      acc.push({
        id: batchId,
        prompt: task.prompt,
        status: task.status as 'pending' | 'processing' | 'completed',
        progress: task.progress,
        images: imageUrl
          ? [
              {
                id: task.id,
                url: imageUrl,
                prompt: task.prompt,
                productName: task.productName,
                createdAt: task.createdAt,
                source: task.source,
                batchId,
              },
            ]
          : [],
      });
    }
    return acc;
  }, [] as BatchObject[]);

  // 当 webTasks 变化时，自动滚动到顶部
  useEffect(() => {
    if (activeTab === 'web' && webTasks.length > 0 && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [webTasks.length, activeTab]);

  return (
    <div className="theme-card rounded-2xl flex-1 flex flex-col overflow-hidden">
      {/* Tab 切换 */}
      <div className="flex border-b border-border/30">
        <button
          onClick={() => handleTabChange('web')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-all relative ${
            activeTab === 'web' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          网页端
          {activeTab === 'web' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
          <span className="ml-2 text-xs opacity-60">({webTasks.length})</span>
        </button>
        <button
          onClick={() => handleTabChange('table')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-all relative ${
            activeTab === 'table' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          表格端
          {activeTab === 'table' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
          <span className="ml-2 text-xs opacity-60">({tableBatches.length})</span>
        </button>
      </div>

      {/* Tab 内容 */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {activeTab === 'web' ? (
          <WebTabContent
            tasks={webTasks}
            onImageClick={onImageClick}
            selectedImageIds={selectedImageIds}
          />
        ) : (
          <TableTabContent batches={tableBatches} onBatchClick={onBatchClick} />
        )}
      </div>
    </div>
  );
}
