/**
 * useTaskOperations - 任务操作 Hook
 */

import { useState, useCallback } from 'react';
import { getTaskRepository } from '@/lib/repositories/task.repository';
import { getN8nService } from '@/lib/services/n8n.service';
import { initializeApp } from '@/lib/app-initialization';
import { useSyncStatusToast } from '@/components/ui';
import type { CreateTaskInput, ConflictInfo } from '@/lib/repositories/task.repository.types';
import type { TaskToDelete } from './use-task-dialogs';
import type { SyncStatus } from '@/components/ui/sync-status-toast';

interface TaskOperationsOptions {
  onSuccess?: (task: { id: string; prompt?: string | null; status: string }) => void;
  onError?: (error: Error) => void;
  onShowDeleteDialog?: (task: TaskToDelete) => void;
  onShowConflict?: (conflict: ConflictInfo) => void;
}

export function useTaskOperations(options?: TaskOperationsOptions) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('pending');
  const { showSyncStatus } = useSyncStatusToast();

  /**
   * 创建任务
   */
  const createTask = useCallback(
    async (input: CreateTaskInput) => {
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

        // 触发N8N工作流
        const n8nService = getN8nService();
        await n8nService.triggerGeneration({
          mode: 'scene', // 默认场景生图模式
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

        // 模拟同步成功
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
          const conflictError = error as { conflict?: ConflictInfo };
          if (conflictError.conflict) {
            options?.onShowConflict?.(conflictError.conflict);
          }
        } else {
          setSyncStatus('failed');
          options?.onError?.(error as Error);
        }

        throw error;
      }
    },
    [options, showSyncStatus, syncStatus]
  );

  /**
   * 删除任务
   */
  const deleteTask = useCallback(
    async (taskId: string) => {
      try {
        const taskRepo = getTaskRepository();
        const task = await taskRepo.findById(taskId);

        if (!task) {
          throw new Error('Task not found');
        }

        // 触发删除对话框
        options?.onShowDeleteDialog?.({
          id: task.id,
          prompt: task.prompt,
          feishuRecordId: task.feishuRecordId,
          hasFeishuRecord: !!task.feishuRecordId,
        });
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
    async (taskToDelete: TaskToDelete, scope: 'both' | 'local') => {
      if (!taskToDelete) return;

      try {
        const taskRepo = getTaskRepository();

        if (scope === 'both') {
          // 删除本地任务
          await taskRepo.delete(taskToDelete.id);
        } else {
          // 仅删除本地记录
          await taskRepo.delete(taskToDelete.id);
        }
      } catch (error) {
        console.error('[TaskCreation] Failed to delete task:', error);
        options?.onError?.(error as Error);
        throw error;
      }
    },
    [options]
  );

  /**
   * 解决冲突
   */
  const resolveConflict = useCallback(
    async (conflictInfo: ConflictInfo, strategy: 'use_local' | 'use_remote' | 'merge') => {
      try {
        // TODO: 实现冲突解决逻辑
        console.log('[TaskCreation] Resolving conflict with strategy:', strategy);

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
      } catch (error) {
        console.error('[TaskCreation] Failed to resolve conflict:', error);
        options?.onError?.(error as Error);
        throw error;
      }
    },
    [options]
  );

  return {
    createTask,
    deleteTask,
    confirmDelete,
    resolveConflict,
    syncStatus,
  };
}
