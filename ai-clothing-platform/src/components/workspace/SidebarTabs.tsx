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

import { useState, useRef, useEffect, useMemo } from 'react';
import { Download, EyeOff } from 'lucide-react';
import { type TaskData } from '@/lib/types';
import { type ImageItem, type BatchObject } from '@/hooks/use-canvas-view-mode';
import { WebTabContent } from './WebTabContent';
import { TableTabContent } from './TableTabContent';
import { BatchDownloadService } from '@/lib/services/batch-download.service';

interface SidebarTabsProps {
  tasks: TaskData[];
  onImageClick: (image: ImageItem) => void;
  onBatchClick: (batch: BatchObject) => void;
  selectedImageIds?: string[];
  activeTab?: 'web' | 'table';
  onTabChange?: (tab: 'web' | 'table') => void;
  onHideTask?: (taskId: string) => void;
  hiddenTaskIds?: Set<string>;
  onUnhideTask?: (taskId: string) => void;
}

export function SidebarTabs({
  tasks,
  onImageClick,
  onBatchClick,
  selectedImageIds = [],
  activeTab: controlledTab,
  onTabChange,
  onHideTask,
  hiddenTaskIds = new Set(),
  onUnhideTask,
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
  // 使用 useMemo 缓存排序结果，避免每次渲染都重新计算
  const webTasks = useMemo(() => {
    const filtered = tasks.filter(
      t => (t.source === 'web' || t.type === 'web') && !hiddenTaskIds.has(t.id)
    );

    // 排序规则：
    // 1. 生成中的任务（processing/generating/pending）优先置顶
    // 2. 在生成中的任务中，按创建时间降序（最新的在前）
    // 3. 已完成的任务按创建时间降序
    const sorted = [...filtered].sort((a, b) => {
      // 判断是否为生成中的任务
      const isProcessingA =
        a.status === 'processing' || a.status === 'generating' || a.status === 'pending';
      const isProcessingB =
        b.status === 'processing' || b.status === 'generating' || b.status === 'pending';

      // 如果一个生成中，一个已完成，生成中的排前面
      if (isProcessingA && !isProcessingB) return -1;
      if (!isProcessingA && isProcessingB) return 1;

      // 如果都是生成中或都是已完成，按创建时间降序排序
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA;
    });

    return sorted;
  }, [tasks, hiddenTaskIds]); // 只在 tasks 或 hiddenTaskIds 变化时重新计算

  // 表格端：**排除**所有网页端任务（source !== 'web' 且 type !== 'web'）
  const tableTasks = useMemo(() => {
    return tasks.filter(t => t.source !== 'web' && t.type !== 'web');
  }, [tasks]);

  // 计算隐藏的网页端任务数量
  const hiddenWebTaskCount = useMemo(() => {
    return tasks.filter(t => (t.source === 'web' || t.type === 'web') && hiddenTaskIds.has(t.id))
      .length;
  }, [tasks, hiddenTaskIds]);

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

  /**
   * 批量下载选中的图片
   */
  const handleBatchDownload = async () => {
    const selectedSet = new Set(selectedImageIds);
    if (selectedSet.size === 0) {
      alert('请先选择要下载的图片');
      return;
    }

    try {
      await BatchDownloadService.downloadAsZip(
        webTasks,
        selectedSet,
        count => alert(`✅ 成功下载 ${count} 张图片`),
        error => alert(`❌ 下载失败: ${error.message}`)
      );
    } catch (error) {
      console.error('批量下载失败:', error);
    }
  };

  /**
   * 下载全部已完成的图片
   */
  const handleDownloadAll = async () => {
    const completedTaskIds = BatchDownloadService.getCompletedTaskIds(webTasks);
    if (completedTaskIds.length === 0) {
      alert('没有可下载的已完成图片');
      return;
    }

    const confirmed = confirm(`确定要下载全部 ${completedTaskIds.length} 张图片吗？`);
    if (!confirmed) return;

    try {
      await BatchDownloadService.downloadAsZip(
        webTasks,
        new Set(completedTaskIds),
        count => alert(`✅ 成功下载 ${count} 张图片`),
        error => alert(`❌ 下载失败: ${error.message}`)
      );
    } catch (error) {
      console.error('下载全部失败:', error);
    }
  };

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

      {/* 操作按钮栏 */}
      {activeTab === 'web' && webTasks.length > 0 && (
        <div className="flex gap-2 p-3 border-b border-border/20">
          <button
            onClick={handleBatchDownload}
            disabled={selectedImageIds.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-primary/10 hover:bg-primary/20 text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Download size={14} />
            <span>下载选中 ({selectedImageIds.length})</span>
          </button>
          <button
            onClick={handleDownloadAll}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <Download size={14} />
            <span>下载全部</span>
          </button>
        </div>
      )}

      {/* 隐藏任务提示栏 */}
      {activeTab === 'web' && hiddenWebTaskCount > 0 && (
        <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/10">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <EyeOff size={12} />
            <span>已隐藏 {hiddenWebTaskCount} 个任务</span>
          </span>
          <button
            onClick={() => {
              if (confirm(`确定要显示所有隐藏的任务吗？`)) {
                // 遍历所有隐藏的任务并取消隐藏
                hiddenTaskIds.forEach(taskId => {
                  onUnhideTask?.(taskId);
                });
              }
            }}
            className="text-xs text-primary hover:underline"
          >
            全部显示
          </button>
        </div>
      )}

      {/* Tab 内容 */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {activeTab === 'web' ? (
          <WebTabContent
            tasks={webTasks}
            onImageClick={onImageClick}
            selectedImageIds={selectedImageIds}
            onDeleteTask={onHideTask}
          />
        ) : (
          <TableTabContent batches={tableBatches} onBatchClick={onBatchClick} />
        )}
      </div>
    </div>
  );
}
