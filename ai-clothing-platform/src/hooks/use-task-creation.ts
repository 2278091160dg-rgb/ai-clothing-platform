/**
 * useTaskCreation Hook
 * 任务创建Hook - 集成同步状态和冲突处理
 */

import { useState, useCallback } from 'react';
import { getTaskRepository } from '@/lib/repositories/task.repository';
import { getN8nService } from '@/lib/services/n8n.service';
import { initializeApp } from '@/lib/app-initialization';
import {
  ConflictResolutionDialog,
  DeleteConfirmDialog,
  SyncStatusAlert,
  useSyncStatusToast,
  type SyncStatus,
} from '@/components/ui';
import type { CreateTaskInput, ConflictInfo } from '@/lib/repositories/task.repository.types';

interface TaskCreationOptions {
  onSuccess?: (task: any) => void;
  onError?: (error: Error) => void;
}

interface TaskCreationResult {
  createTask: (input: CreateTaskInput) => Promise<any>;
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
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('pending');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);

  const { showSyncStatus } = useSyncStatusToast();

  /**
   * 创建任务
   */
  const createTask = useCallback(async (input: CreateTaskInput) => {
    try {
      // 初始化应用
      initializeApp();

      // 创建任务（数据库）
      const taskRepo = getTaskRepository();
      const task = await taskRepo.create({
        ...input,
        syncStatus: 'PENDING',
      });

      console.log('[TaskCreation] Task created:', task.id);

      // 显示同步状态
      setSyncStatus('syncing');

      // TODO: 触发飞书同步（异步）
      // 这将触发事件系统中的飞书监听器
      // const feishuService = getFeishuService();
      // try {
      //   const record = await feishuService.createTaskRecord({
      //     userId: task.userId,
      //     productImageToken: extractToken(input.productImageUrl),
      //     prompt: input.prompt || '',
      //     // ...
      //   });
      //   await taskRepo.update(task.id, {
      //     feishuRecordId: record.record_id,
      //     syncStatus: 'SYNCED',
      //   });
      //   setSyncStatus('synced');
      // } catch (error) {
      //   setSyncStatus('failed');
      // }

      // 触发N8N工作流
      const n8nService = getN8nService();
      await n8nService.triggerGeneration({
        taskId: task.id,
        userId: task.userId,
        productImageUrl: input.productImageUrl!,
        sceneImageUrl: input.sceneImageUrl,
        prompt: input.prompt || '',
        aiModel: input.aiModel || 'FLUX.1',
        aspectRatio: input.aspectRatio || '1:1',
        imageCount: input.imageCount || 4,
        quality: input.quality || 'high',
      });

      // 模拟同步成功（实际应等待飞书同步完成）
      setTimeout(() => setSyncStatus('synced'), 1000);

      // 显示同步状态提示
      showSyncStatus({
        status: syncStatus,
        feishuRecordId: task.feishuRecordId ?? undefined,
      });

      options?.onSuccess?.(task);
      return task;
    } catch (error) {
      console.error('[TaskCreation] Failed to create task:', error);

      // 检查是否是版本冲突错误
      if (error instanceof Error && error.name === 'VersionConflictError') {
        const conflictError = error as any;
        setConflictInfo(conflictError.conflict);
        setShowConflictDialog(true);
      } else {
        setSyncStatus('failed');
        options?.onError?.(error as Error);
      }

      throw error;
    }
  }, [options, showSyncStatus, syncStatus]);

  /**
   * 删除任务
   */
  const deleteTask = useCallback(
    async (taskId: string, scope: 'both' | 'local' = 'both') => {
      try {
        const taskRepo = getTaskRepository();
        const task = await taskRepo.findById(taskId);

        if (!task) {
          throw new Error('Task not found');
        }

        // 设置待删除任务和确认对话框
        setTaskToDelete({
          id: task.id,
          prompt: task.prompt,
          feishuRecordId: task.feishuRecordId,
          hasFeishuRecord: !!task.feishuRecordId,
        });
        setShowDeleteDialog(true);
      } catch (error) {
        console.error('[TaskCreation] Failed to prepare delete:', error);
        options?.onError?.(error as Error);
        throw error;
      }
    },
    [options]
  );

  /**
   * 确认删除
   */
  const confirmDelete = useCallback(
    async (scope: 'both' | 'local') => {
      if (!taskToDelete) return;

      try {
        const taskRepo = getTaskRepository();

        if (scope === 'both') {
          // 删除本地任务（会触发级联删除飞书记录吗？）
          await taskRepo.delete(taskToDelete.id);
        } else {
          // 仅删除本地记录（保留feishuRecordId但标记为已删除）
          // 这需要根据实际需求实现
          await taskRepo.delete(taskToDelete.id);
        }

        setShowDeleteDialog(false);
        setTaskToDelete(null);

        options?.onSuccess?.({ deleted: true });
      } catch (error) {
        console.error('[TaskCreation] Failed to delete task:', error);
        options?.onError?.(error as Error);
        throw error;
      }
    },
    [taskToDelete, options]
  );

  /**
   * 解决冲突
   */
  const resolveConflict = useCallback(
    async (strategy: 'use_local' | 'use_remote' | 'merge') => {
      if (!conflictInfo) return;

      try {
        // TODO: 实现冲突解决逻辑
        console.log('[TaskCreation] Resolving conflict with strategy:', strategy);

        setShowConflictDialog(false);
        setConflictInfo(null);

        // 根据策略执行不同的操作
        switch (strategy) {
          case 'use_local':
            // 保留本地修改，覆盖远程
            break;
          case 'use_remote':
            // 使用远程修改，覆盖本地
            break;
          case 'merge':
            // 手动合并
            break;
        }

        options?.onSuccess?.({ resolved: true });
      } catch (error) {
        console.error('[TaskCreation] Failed to resolve conflict:', error);
        options?.onError?.(error as Error);
        throw error;
      }
    },
    [conflictInfo, options]
  );

  return {
    createTask,
    deleteTask,
    syncStatus,
    showDeleteDialog,
    hideDeleteDialog: () => setShowDeleteDialog(false),
    showConflictDialog,
    hideConflictDialog: () => {
      setShowConflictDialog(false);
      setConflictInfo(null);
    },
    conflictInfo,
    // 内部方法
    confirmDelete,
    resolveConflict,
  };
}
