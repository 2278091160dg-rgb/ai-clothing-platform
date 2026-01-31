/**
 * Feishu Async Sync Service - 飞书异步同步服务（主导出）
 *
 * 拆分后的结构：
 * - utils/circuit-breaker.ts: 熔断器模式实现
 * - feishu-async-sync-queue.ts: 队列和重试逻辑
 *
 * Features:
 * - Circuit Breaker Pattern (熔断器模式): 5次失败后熔断，60秒后尝试恢复
 * - Retry with Exponential Backoff (指数退避重试): 最多重试3次
 * - Non-blocking Async Operations (非阻塞异步操作)
 * - Queue-based Processing (基于队列的处理)
 */

import type { Task } from '@prisma/client';
import type { CreateTaskRecordParams, TaskRecordUpdate } from './feishu/feishu.types';
import { CircuitBreaker } from '../utils/circuit-breaker';
import { FeishuAsyncSyncQueue } from './feishu-async-sync-queue';

/**
 * Feishu Async Sync Service Class
 */
export class FeishuAsyncSyncService {
  private circuitBreaker: CircuitBreaker;
  private syncQueue: FeishuAsyncSyncQueue;

  constructor() {
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5, // 5次失败后熔断
      recoveryTimeoutMs: 60000, // 60秒后尝试恢复
      halfOpenMaxCalls: 3, // 半开状态允许3次尝试
    });
    this.syncQueue = new FeishuAsyncSyncQueue(this.circuitBreaker);
  }

  /**
   * 异步创建飞书记录（非阻塞）
   */
  async createTaskRecordAsync(task: Task, params: CreateTaskRecordParams): Promise<void> {
    // 添加到同步队列
    this.syncQueue.addToQueue({
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
  async updateTaskRecordAsync(task: Task, updates: TaskRecordUpdate): Promise<void> {
    if (!task.feishuRecordId) {
      console.warn('[FeishuAsyncSync] No feishuRecordId, skipping update');
      return;
    }

    // 添加到同步队列
    this.syncQueue.addToQueue({
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
  async deleteTaskRecordAsync(task: Task): Promise<void> {
    if (!task.feishuRecordId) {
      console.warn('[FeishuAsyncSync] No feishuRecordId, skipping delete');
      return;
    }

    // 添加到同步队列
    this.syncQueue.addToQueue({
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
    return this.syncQueue.processQueueAsync();
  }

  /**
   * 更新任务同步状态
   */
  private async updateTaskSyncStatus(
    taskId: string,
    status: import('@prisma/client').TaskSyncStatus,
    error?: string
  ): Promise<void> {
    try {
      const { getTaskRepository } = await import('../repositories/task.repository');
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
   * 获取熔断器状态（用于监控）
   */
  getCircuitBreakerStatus() {
    return this.circuitBreaker.getStatus();
  }

  /**
   * 获取队列状态（用于监控）
   */
  getQueueStatus() {
    return this.syncQueue.getQueueStatus();
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
