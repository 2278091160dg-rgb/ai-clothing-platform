/**
 * useTaskCreation Hook
 * 任务创建Hook - 集成同步状态和冲突处理
 *
 * 拆分后的结构：
 * - use-task-dialogs.ts: 对话框状态管理
 * - use-task-operations.ts: 任务操作逻辑
 */

import { useCallback } from 'react';
import { useTaskDialogs } from './use-task-dialogs';
import { useTaskOperations } from './use-task-operations';
import type { CreateTaskInput, ConflictInfo } from '@/lib/repositories/task.repository.types';
import type { SyncStatus } from '@/components/ui/sync-status-toast';

interface TaskCreationOptions {
  onSuccess?: (task: { id: string; prompt?: string | null; status: string }) => void;
  onError?: (error: Error) => void;
}

interface TaskCreationResult {
  createTask: (input: CreateTaskInput) => Promise<{
    id: string;
    prompt?: string | null;
    status: string;
    [key: string]: unknown;
  }>;
  deleteTask: (taskId: string, scope?: 'both' | 'local') => Promise<void>;
  syncStatus: SyncStatus;
  showDeleteDialog: boolean;
  hideDeleteDialog: () => void;
  showConflictDialog: boolean;
  hideConflictDialog: () => void;
  conflictInfo: ConflictInfo | null;
  confirmDelete: (scope: 'both' | 'local') => Promise<void>;
  resolveConflict: (strategy: 'use_local' | 'use_remote' | 'merge') => Promise<void>;
}

export function useTaskCreation(options?: TaskCreationOptions): TaskCreationResult {
  const {
    showDeleteDialog,
    taskToDelete,
    hideDeleteDialog,
    prepareDelete,
    showConflictDialog,
    conflictInfo,
    hideConflictDialog,
    showConflict,
  } = useTaskDialogs();

  const {
    createTask,
    deleteTask,
    confirmDelete: confirmDeleteOp,
    resolveConflict: resolveConflictOp,
    syncStatus,
  } = useTaskOperations({
    ...options,
    onShowDeleteDialog: prepareDelete,
    onShowConflict: showConflict,
  });

  const confirmDelete = useCallback(
    async (scope: 'both' | 'local') => {
      if (taskToDelete) {
        await confirmDeleteOp(taskToDelete, scope);
        hideDeleteDialog();
      }
    },
    [taskToDelete, confirmDeleteOp, hideDeleteDialog]
  );

  const resolveConflict = useCallback(
    async (strategy: 'use_local' | 'use_remote' | 'merge') => {
      if (conflictInfo) {
        await resolveConflictOp(conflictInfo, strategy);
        hideConflictDialog();
      }
    },
    [conflictInfo, resolveConflictOp, hideConflictDialog]
  );

  return {
    createTask,
    deleteTask,
    syncStatus,
    showDeleteDialog,
    hideDeleteDialog,
    showConflictDialog,
    hideConflictDialog,
    conflictInfo,
    confirmDelete,
    resolveConflict,
  };
}
