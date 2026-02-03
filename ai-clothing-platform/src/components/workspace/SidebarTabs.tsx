'use client';

import { useState, useRef, useEffect } from 'react';
import { type TaskData } from '@/lib/types';
import { type ImageItem, type BatchObject } from '@/hooks/use-canvas-view-mode';
import { useSidebarData } from '@/hooks/use-sidebar-data';
import { useSidebarDownload } from '@/hooks/use-sidebar-download';
import { WebTabContent } from './WebTabContent';
import { TableTabContent } from './TableTabContent';
import { SidebarTabHeader } from './SidebarTabHeader';
import { SidebarActionButtons } from './SidebarActionButtons';
import { HiddenTasksBanner } from './HiddenTasksBanner';

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
  const [internalTab, setInternalTab] = useState<'web' | 'table'>('web');
  const activeTab = controlledTab ?? internalTab;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { webTasks, tableBatches, hiddenWebTaskCount } = useSidebarData({ tasks, hiddenTaskIds });
  const { handleBatchDownload, handleDownloadAll } = useSidebarDownload({ webTasks });

  const handleTabChange = (tab: 'web' | 'table') => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  const handleShowAllHidden = () => {
    if (confirm('确定要显示所有隐藏的任务吗？')) {
      hiddenTaskIds.forEach(taskId => onUnhideTask?.(taskId));
    }
  };

  useEffect(() => {
    if (activeTab === 'web' && webTasks.length > 0 && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [webTasks.length, activeTab]);

  return (
    <div className="theme-card rounded-2xl flex-1 flex flex-col overflow-hidden">
      <SidebarTabHeader
        activeTab={activeTab}
        webTaskCount={webTasks.length}
        tableBatchCount={tableBatches.length}
        onTabChange={handleTabChange}
      />

      {activeTab === 'web' && webTasks.length > 0 && (
        <SidebarActionButtons
          selectedCount={selectedImageIds.length}
          onBatchDownload={() => handleBatchDownload(selectedImageIds)}
          onDownloadAll={handleDownloadAll}
        />
      )}

      {activeTab === 'web' && (
        <HiddenTasksBanner
          hiddenCount={hiddenWebTaskCount}
          onShowAll={handleShowAllHidden}
        />
      )}

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
