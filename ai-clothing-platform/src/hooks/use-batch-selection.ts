/**
 * useBatchSelection - 批量选择状态管理 Hook
 */

import { useState, useCallback } from 'react';

export function useBatchSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  /**
   * 切换单个任务选中状态
   */
  const toggleSelection = useCallback((taskId: string, selected: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (selected) {
        next.add(taskId);
      } else {
        next.delete(taskId);
      }
      return next;
    });
  }, []);

  /**
   * 全选/取消全选
   */
  const toggleSelectAll = useCallback((taskIds: string[]) => {
    setSelectedIds(prev => {
      if (prev.size === taskIds.length) {
        return new Set();
      } else {
        return new Set(taskIds);
      }
    });
  }, []);

  /**
   * 清空选择
   */
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  /**
   * 检查是否全部选中
   */
  const isAllSelected = useCallback(
    (taskIds: string[]) => {
      return selectedIds.size === taskIds.length && taskIds.length > 0;
    },
    [selectedIds.size]
  );

  return {
    selectedIds,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    selectionCount: selectedIds.size,
  };
}
