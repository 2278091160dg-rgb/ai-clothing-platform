/**
 * Feishu Async Sync Queue - 飞书异步同步队列和重试逻辑
 */

import { getFeishuService } from './feishu.service';
import { getTaskRepository } from '../repositories/task.repository';
import { CircuitBreaker } from '../utils/circuit-breaker';
import type { CreateTaskRecordParams, TaskRecordUpdate } from './feishu/feishu.types';
import type { TaskSyncStatus } from '@prisma/client';

/**
 * Sync Operation Type (同步操作类型)
 */
export type SyncOperation = {
  type: 'create' | 'update' | 'delete';
  taskId: string;
  data?: CreateTaskRecordParams | TaskRecordUpdate;
  recordId?: string;
};

/**
 * Sync Operation Result (同步操作结果)
 */
export type SyncOperationResult = {
  success: boolean;
  taskId: string;
  recordId?: string;
  error?: string;
  duration: number;
};

/**
 * Feishu Async Sync Queue - 队列处理和重试逻辑
 */
export class FeishuAsyncSyncQueue {
  private syncQueue: SyncOperation[] = [];
  private isProcessingQueue = false;

  constructor(private circuitBreaker: CircuitBreaker) {}

  /**
   * 添加操作到队列
   */
  addToQueue(operation: SyncOperation): void {
    this.syncQueue.push(operation);
  }

  /**
   * 异步处理同步队列
   */
  async processQueueAsync(): Promise<void> {
    // 防止并发处理
    if (this.isProcessingQueue) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      while (this.syncQueue.length > 0) {
        // 检查熔断器状态
        if (!this.circuitBreaker.canExecute()) {
          console.warn('[FeishuAsyncSync] Circuit breaker is OPEN, queueing operations');
          break;
        }

        const operation = this.syncQueue.shift();
        if (!operation) break;

        const startTime = Date.now();

        try {
          await this.executeOperationWithRetry(operation, 3);

          // 记录成功
          this.circuitBreaker.recordSuccess();

          // 更新任务同步状态为成功
          await this.updateTaskSyncStatus(operation.taskId, 'SYNCED');

          const duration = Date.now() - startTime;
          console.log(`[FeishuAsyncSync] Operation completed in ${duration}ms:`, {
            type: operation.type,
            taskId: operation.taskId,
          });
        } catch (error) {
          // 记录失败
          this.circuitBreaker.recordFailure();

          // 更新任务同步状态为失败
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          await this.updateTaskSyncStatus(operation.taskId, 'FAILED', errorMessage);

          console.error(`[FeishuAsyncSync] Operation failed:`, {
            type: operation.type,
            taskId: operation.taskId,
            error: errorMessage,
            circuitBreakerState: this.circuitBreaker.getState(),
          });
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * 执行操作（带重试）
   */
  private async executeOperationWithRetry(
    operation: SyncOperation,
    maxRetries: number
  ): Promise<SyncOperationResult> {
    const feishuService = getFeishuService();
    const taskRepo = getTaskRepository();

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        if (operation.type === 'create') {
          const record = await feishuService.createTaskRecord(
            operation.data as CreateTaskRecordParams
          );

          // 更新任务的feishuRecordId
          await taskRepo.update(operation.taskId, {
            feishuRecordId: record.record_id,
          });

          return {
            success: true,
            taskId: operation.taskId,
            recordId: record.record_id,
            duration: 0,
          };
        } else if (operation.type === 'update') {
          await feishuService.updateTaskRecord(
            operation.recordId!,
            operation.data as TaskRecordUpdate
          );

          return {
            success: true,
            taskId: operation.taskId,
            recordId: operation.recordId,
            duration: 0,
          };
        } else if (operation.type === 'delete') {
          await feishuService.deleteRecord(operation.recordId!);

          return {
            success: true,
            taskId: operation.taskId,
            recordId: operation.recordId,
            duration: 0,
          };
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempt++;

        if (attempt <= maxRetries) {
          // 指数退避：2^attempt * 100ms
          const delay = Math.pow(2, attempt) * 100;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Operation failed after retries');
  }

  /**
   * 更新任务同步状态
   */
  private async updateTaskSyncStatus(
    taskId: string,
    status: TaskSyncStatus,
    error?: string
  ): Promise<void> {
    try {
      const taskRepo = getTaskRepository();

      await taskRepo.update(taskId, {
        syncStatus: status,
        syncError: error,
        lastSyncAt: new Date(),
      });
    } catch (err) {
      console.error('[FeishuAsyncSync] Failed to update sync status:', err);
    }
  }

  /**
   * 获取队列状态
   */
  getQueueStatus(): {
    queueLength: number;
    isProcessing: boolean;
  } {
    return {
      queueLength: this.syncQueue.length,
      isProcessing: this.isProcessingQueue,
    };
  }

  /**
   * 检查是否正在处理队列
   */
  isProcessing(): boolean {
    return this.isProcessingQueue;
  }
}
