/**
 * useTaskDialogs - 任务对话框状态管理 Hook
 */

import { useState, useCallback } from 'react';
import type { ConflictInfo } from '@/lib/repositories/task.repository.types';

export interface TaskToDelete {
  id: string;
  prompt?: string | null;
  feishuRecordId?: string | null;
  hasFeishuRecord: boolean;
}

export interface UseTaskDialogsReturn {
  // Delete dialog state
  showDeleteDialog: boolean;
  taskToDelete: TaskToDelete | null;
  hideDeleteDialog: () => void;
  prepareDelete: (task: TaskToDelete) => void;
  // Conflict dialog state
  showConflictDialog: boolean;
  conflictInfo: ConflictInfo | null;
  hideConflictDialog: () => void;
  showConflict: (conflict: ConflictInfo) => void;
}

export function useTaskDialogs(): UseTaskDialogsReturn {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskToDelete | null>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);

  const hideDeleteDialog = useCallback(() => {
    setShowDeleteDialog(false);
    setTaskToDelete(null);
  }, []);

  const prepareDelete = useCallback((task: TaskToDelete) => {
    setTaskToDelete(task);
    setShowDeleteDialog(true);
  }, []);

  const hideConflictDialog = useCallback(() => {
    setShowConflictDialog(false);
    setConflictInfo(null);
  }, []);

  const showConflict = useCallback((conflict: ConflictInfo) => {
    setConflictInfo(conflict);
    setShowConflictDialog(true);
  }, []);

  return {
    showDeleteDialog,
    taskToDelete,
    hideDeleteDialog,
    prepareDelete,
    showConflictDialog,
    conflictInfo,
    hideConflictDialog,
    showConflict,
  };
}
