/**
 * TaskRepository - 任务仓储（主导出）
 * 实现仓储模式，提供数据访问抽象
 *
 * 拆分后的结构：
 * - task-repository-core.ts: 基础 CRUD 操作
 * - task-repository-stats.ts: 统计功能
 * - task-repository-status.ts: 状态更新
 * - task-repository-conflict.ts: 并发控制和冲突解决
 */

import { Task, Prisma } from '@prisma/client';
import type {
  TaskWithRelations,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilter,
} from './task.repository.types';
import { TaskRepositoryCore } from './task-repository-core';
import { TaskRepositoryStats } from './task-repository-stats';
import { TaskRepositoryStatus } from './task-repository-status';
import { TaskRepositoryConflict } from './task-repository-conflict';

export type { TaskWithRelations, CreateTaskInput, UpdateTaskInput, TaskFilter };

/**
 * TaskRepository - 聚合所有功能的主类
 */
export class TaskRepository {
  private core = new TaskRepositoryCore();
  private stats = new TaskRepositoryStats();
  private status = new TaskRepositoryStatus();
  private conflict = new TaskRepositoryConflict();

  // ===== Core CRUD 方法 =====

  /** 创建任务 */
  async create(data: CreateTaskInput): Promise<Task> {
    return this.core.create(data);
  }

  /** 批量创建任务 */
  async createMany(data: CreateTaskInput[]) {
    return this.core.createMany(data);
  }

  /** 通过ID查找任务 */
  async findById(id: string): Promise<TaskWithRelations | null> {
    return this.core.findById(id);
  }

  /** 通过飞书记录ID查找任务 */
  async findByFeishuRecordId(feishuRecordId: string): Promise<Task | null> {
    return this.core.findByFeishuRecordId(feishuRecordId);
  }

  /** 更新任务 */
  async update(id: string, data: UpdateTaskInput): Promise<Task> {
    return this.core.update(id, data);
  }

  /** 删除任务 */
  async delete(id: string): Promise<Task> {
    return this.core.delete(id);
  }

  /** 查询任务列表 */
  async findMany(
    filter?: TaskFilter,
    options?: {
      skip?: number;
      take?: number;
      orderBy?: Prisma.TaskOrderByWithRelationInput;
    }
  ): Promise<TaskWithRelations[]> {
    return this.core.findMany(filter, options);
  }

  /** 清理过期任务 */
  async cleanupExpired() {
    return this.core.cleanupExpired();
  }

  // ===== 统计方法 =====

  /** 统计任务数量 */
  async count(filter?: TaskFilter): Promise<number> {
    return this.stats.count(filter);
  }

  /** 获取用户任务统计 */
  async getUserStats(userId: string) {
    return this.stats.getUserStats(userId);
  }

  // ===== 状态更新方法 =====

  /** 更新任务进度 */
  async updateProgress(id: string, progress: number, status?: import('@prisma/client').TaskStatus) {
    return this.status.updateProgress(id, progress, status);
  }

  /** 标记任务为完成 */
  async markAsCompleted(id: string, resultImageUrls: string[], resultImageTokens: string[]) {
    return this.status.markAsCompleted(id, resultImageUrls, resultImageTokens);
  }

  /** 标记任务为失败 */
  async markAsFailed(id: string, errorMessage: string) {
    return this.status.markAsFailed(id, errorMessage);
  }

  // ===== 并发控制方法 =====

  /** 带版本检查的更新（乐观锁） */
  async updateWithVersion(
    taskId: string,
    updates: UpdateTaskInput,
    expectedVersion: number,
    modifier: 'web' | 'feishu' | 'api' = 'web'
  ): Promise<Task> {
    const current = await this.findById(taskId);
    if (!current) {
      throw new Error(`Task not found: ${taskId}`);
    }
    return this.conflict.updateWithVersion(taskId, updates, expectedVersion, current, modifier);
  }

  /** 检测冲突 */
  async detectConflict(taskId: string, current: TaskWithRelations, updates: UpdateTaskInput) {
    return this.conflict.detectConflict(taskId, current, updates);
  }

  /** 解决冲突 */
  async resolveConflict(
    taskId: string,
    strategy: 'use_local' | 'use_remote',
    modifier: 'web' | 'feishu' | 'api' = 'web'
  ): Promise<Task> {
    const task = await this.findById(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    return this.conflict.resolveConflict(task, strategy, modifier);
  }
}

// 创建单例实例
let taskRepositoryInstance: TaskRepository | null = null;

export function getTaskRepository(): TaskRepository {
  if (!taskRepositoryInstance) {
    taskRepositoryInstance = new TaskRepository();
  }
  return taskRepositoryInstance;
}
