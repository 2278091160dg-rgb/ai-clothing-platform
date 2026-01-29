/**
 * Feishu Async Sync Service
 * 飞书异步同步服务 - 实现非阻塞式飞书同步，带熔断和重试机制
 *
 * Features:
 * - Circuit Breaker Pattern (熔断器模式): 5次失败后熔断，60秒后尝试恢复
 * - Retry with Exponential Backoff (指数退避重试): 最多重试3次
 * - Non-blocking Async Operations (非阻塞异步操作)
 * - Sync Status Tracking (同步状态跟踪)
 * - Queue-based Processing (基于队列的处理)
 */

import { getFeishuService } from './feishu.service';
import { getTaskRepository } from '../repositories/task.repository';
import type { Task } from '@prisma/client';
import type { CreateTaskRecordParams, TaskRecordUpdate } from './feishu/feishu.types';
import type { TaskSyncStatus } from '@prisma/client';

/**
 * Circuit Breaker States (熔断器状态)
 */
enum CircuitBreakerState {
  CLOSED = 'closed',    // 正常工作
  OPEN = 'open',        // 熔断开启，拒绝请求
  HALF_OPEN = 'half_open',  // 半开状态，尝试恢复
}

/**
 * Circuit Breaker Configuration (熔断器配置)
 */
interface CircuitBreakerConfig {
  failureThreshold: number;     // 失败阈值
  recoveryTimeoutMs: number;    // 恢复超时时间
  halfOpenMaxCalls: number;     // 半开状态最大调用次数
}

/**
 * Circuit Breaker (熔断器)
 */
class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private halfOpenCallCount: number = 0;

  constructor(private config: CircuitBreakerConfig) {}

  /**
   * 检查是否可以执行请求
   */
  canExecute(): boolean {
    const now = Date.now();

    if (this.state === CircuitBreakerState.OPEN) {
      // 检查是否可以尝试恢复
      if (now - this.lastFailureTime >= this.config.recoveryTimeoutMs) {
        this.state = CircuitBreakerState.HALF_OPEN;
        this.halfOpenCallCount = 0;
        return true;
      }
      return false;
    }

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      // 半开状态允许有限数量的请求
      return this.halfOpenCallCount < this.config.halfOpenMaxCalls;
    }

    return true;
  }

  /**
   * 记录成功
   */
  recordSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.halfOpenCallCount++;

      // 如果半开状态的请求都成功，则恢复到关闭状态
      if (this.halfOpenCallCount >= this.config.halfOpenMaxCalls) {
        this.state = CircuitBreakerState.CLOSED;
      }
    }
  }

  /**
   * 记录失败
   */
  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      console.error(`[CircuitBreaker] Circuit opened after ${this.failureCount} failures`);
    }
  }

  /**
   * 获取当前状态
   */
  getState(): CircuitBreakerState {
    return this.state;
  }

  /**
   * 重置熔断器
   */
  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.halfOpenCallCount = 0;
  }
}

/**
 * Sync Operation Type (同步操作类型)
 */
type SyncOperation = {
  type: 'create' | 'update' | 'delete';
  taskId: string;
  data?: CreateTaskRecordParams | TaskRecordUpdate;
  recordId?: string;
};

/**
 * Sync Operation Result (同步操作结果)
 */
type SyncOperationResult = {
  success: boolean;
  taskId: string;
  recordId?: string;
  error?: string;
  duration: number;
};

/**
 * Feishu Async Sync Service Class
 */
export class FeishuAsyncSyncService {
  private circuitBreaker: CircuitBreaker;
  private syncQueue: SyncOperation[] = [];
  private isProcessingQueue = false;

  constructor() {
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,           // 5次失败后熔断
      recoveryTimeoutMs: 60000,      // 60秒后尝试恢复
      halfOpenMaxCalls: 3,           // 半开状态允许3次尝试
    });
  }

  /**
   * 异步创建飞书记录（非阻塞）
   */
  async createTaskRecordAsync(
    task: Task,
    params: CreateTaskRecordParams
  ): Promise<void> {
    // 添加到同步队列
    this.syncQueue.push({
      type: 'create',
      taskId: task.id,
      data: params,
    });

    // 更新任务同步状态
    await this.updateTaskSyncStatus(task.id, 'SYNCING');

    // 异步处理队列（不等待）
    this.processQueueAsync().catch(error => {
      console.error('[FeishuAsyncSync] Failed to process queue:', error);
    });
  }

  /**
   * 异步更新飞书记录（非阻塞）
   */
  async updateTaskRecordAsync(
    task: Task,
    updates: TaskRecordUpdate
  ): Promise<void> {
    if (!task.feishuRecordId) {
      console.warn('[FeishuAsyncSync] No feishuRecordId, skipping update');
      return;
    }

    // 添加到同步队列
    this.syncQueue.push({
      type: 'update',
      taskId: task.id,
      data: updates,
      recordId: task.feishuRecordId,
    });

    // 更新任务同步状态
    await this.updateTaskSyncStatus(task.id, 'SYNCING');

    // 异步处理队列（不等待）
    this.processQueueAsync().catch(error => {
      console.error('[FeishuAsyncSync] Failed to process queue:', error);
    });
  }

  /**
   * 异步删除飞书记录（非阻塞）
   */
  async deleteTaskRecordAsync(
    task: Task
  ): Promise<void> {
    if (!task.feishuRecordId) {
      console.warn('[FeishuAsyncSync] No feishuRecordId, skipping delete');
      return;
    }

    // 添加到同步队列
    this.syncQueue.push({
      type: 'delete',
      taskId: task.id,
      recordId: task.feishuRecordId,
    });

    // 更新任务同步状态
    await this.updateTaskSyncStatus(task.id, 'SYNCING');

    // 异步处理队列（不等待）
    this.processQueueAsync().catch(error => {
      console.error('[FeishuAsyncSync] Failed to process queue:', error);
    });
  }

  /**
   * 异步处理同步队列
   */
  private async processQueueAsync(): Promise<void> {
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
          // 熔断器开启时，暂停处理队列
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
    } catch (error) {
      console.error('[FeishuAsyncSync] Failed to update sync status:', error);
    }
  }

  /**
   * 获取熔断器状态（用于监控）
   */
  getCircuitBreakerStatus(): {
    state: CircuitBreakerState;
    failureCount: number;
    lastFailureTime: number;
  } {
    return {
      state: this.circuitBreaker.getState(),
      failureCount: (this.circuitBreaker as any).failureCount,
      lastFailureTime: (this.circuitBreaker as any).lastFailureTime,
    };
  }

  /**
   * 获取队列状态（用于监控）
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
   * 手动重置熔断器（用于故障恢复）
   */
  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
    console.log('[FeishuAsyncSync] Circuit breaker reset');
  }
}

// 创建单例实例
let feishuAsyncSyncServiceInstance: FeishuAsyncSyncService | null = null;

export function getFeishuAsyncSyncService(): FeishuAsyncSyncService {
  if (!feishuAsyncSyncServiceInstance) {
    feishuAsyncSyncServiceInstance = new FeishuAsyncSyncService();
  }

  return feishuAsyncSyncServiceInstance;
}
