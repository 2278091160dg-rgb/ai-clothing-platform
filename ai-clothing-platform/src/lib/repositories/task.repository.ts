/**
 * TaskRepository - 任务仓储
 * 实现仓储模式，提供数据访问抽象
 */

import { prisma } from '@/lib/prisma';
import { Task, TaskStatus, Prisma } from '@prisma/client';
import type {
  TaskWithRelations,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilter,
} from './task.repository.types';

export type { TaskWithRelations, CreateTaskInput, UpdateTaskInput, TaskFilter };

export class TaskRepository {
  /**
   * 创建任务
   */
  async create(data: CreateTaskInput): Promise<Task> {
    // 设置过期时间（7天后）
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 处理userId - 将其转换为必需字段
    const userId = data.userId || 'default-user';

    // 使用 Prisma 的类型安全方式创建
    return prisma.task.create({
      data: {
        ...data,
        userId,
        expiresAt,
      } as Prisma.TaskUncheckedCreateInput,
    });
  }

  /**
   * 批量创建任务
   */
  async createMany(data: CreateTaskInput[]): Promise<Prisma.BatchPayload> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return prisma.task.createMany({
      data: data.map(
        item =>
          ({
            ...item,
            userId: item.userId || 'default-user',
            expiresAt,
          }) as Prisma.TaskUncheckedCreateInput
      ),
    });
  }

  /**
   * 通过ID查找任务
   */
  async findById(id: string): Promise<TaskWithRelations | null> {
    return prisma.task.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }) as Promise<TaskWithRelations | null>;
  }

  /**
   * 通过飞书记录ID查找任务
   */
  async findByFeishuRecordId(feishuRecordId: string): Promise<Task | null> {
    return prisma.task.findUnique({
      where: { feishuRecordId },
    });
  }

  /**
   * 更新任务
   */
  async update(id: string, data: UpdateTaskInput): Promise<Task> {
    // 处理resultImageUrls - 转换为JSON字符串
    const { resultImageUrls, ...restData } = data;

    return prisma.task.update({
      where: { id },
      data: {
        ...restData,
        ...(resultImageUrls && {
          resultImageUrls: JSON.stringify(resultImageUrls) as Prisma.InputJsonValue,
        }),
      } as Prisma.TaskUpdateInput,
    });
  }

  /**
   * 删除任务
   */
  async delete(id: string): Promise<Task> {
    return prisma.task.delete({
      where: { id },
    });
  }

  /**
   * 查询任务列表
   */
  async findMany(
    filter: TaskFilter = {},
    options?: {
      skip?: number;
      take?: number;
      orderBy?: Prisma.TaskOrderByWithRelationInput;
    }
  ): Promise<TaskWithRelations[]> {
    const where: Prisma.TaskWhereInput = {};

    if (filter.userId) {
      where.userId = filter.userId;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.batchId) {
      where.batchId = filter.batchId;
    }

    if (filter.feishuRecordId) {
      where.feishuRecordId = filter.feishuRecordId;
    }

    if (filter.expiresBefore) {
      where.expiresAt = {
        lte: filter.expiresBefore,
      };
    }

    return prisma.task.findMany({
      where,
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy || { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }) as Promise<TaskWithRelations[]>;
  }

  /**
   * 统计任务数量
   */
  async count(filter: TaskFilter = {}): Promise<number> {
    const where: Prisma.TaskWhereInput = {};

    if (filter.userId) {
      where.userId = filter.userId;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.batchId) {
      where.batchId = filter.batchId;
    }

    if (filter.feishuRecordId) {
      where.feishuRecordId = filter.feishuRecordId;
    }

    if (filter.expiresBefore) {
      where.expiresAt = {
        lte: filter.expiresBefore,
      };
    }

    return prisma.task.count({ where });
  }

  /**
   * 清理过期任务
   */
  async cleanupExpired(): Promise<Prisma.BatchPayload> {
    return prisma.task.deleteMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
      },
    });
  }

  /**
   * 更新任务进度
   */
  async updateProgress(id: string, progress: number, status?: TaskStatus): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data: {
        progress,
        ...(status && { status }),
      },
    });
  }

  /**
   * 标记任务为完成
   */
  async markAsCompleted(
    id: string,
    resultImageUrls: string[],
    resultImageTokens: string[]
  ): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data: {
        status: TaskStatus.COMPLETED,
        progress: 100,
        resultImageUrls: JSON.stringify(resultImageUrls),
        resultImageTokens: JSON.stringify(resultImageTokens),
        completedAt: new Date(),
      },
    });
  }

  /**
   * 标记任务为失败
   */
  async markAsFailed(id: string, errorMessage: string): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data: {
        status: TaskStatus.FAILED,
        errorMessage,
      },
    });
  }

  /**
   * 获取用户任务统计
   */
  async getUserStats(userId: string) {
    const [total, pending, processing, completed, failed] = await Promise.all([
      this.count({ userId }),
      this.count({ userId, status: TaskStatus.PENDING }),
      this.count({ userId, status: TaskStatus.PROCESSING }),
      this.count({ userId, status: TaskStatus.COMPLETED }),
      this.count({ userId, status: TaskStatus.FAILED }),
    ]);

    return {
      total,
      pending,
      processing,
      completed,
      failed,
    };
  }

  /**
   * 带版本检查的更新（乐观锁）
   * @throws {VersionConflictError} 当版本不匹配时抛出
   */
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

    // 检查版本号
    if (current.version !== expectedVersion) {
      // 检测冲突
      const conflictInfo = await this.detectConflict(taskId, current, updates);

      // 导入错误类
      const { VersionConflictError } = await import('./task.repository.types');
      throw new VersionConflictError({
        taskId,
        currentVersion: current.version,
        attemptedVersion: expectedVersion,
        expectedVersion,
        actualData: current,
        conflict: conflictInfo,
      });
    }

    // 更新并递增版本号
    // 处理resultImageUrls转换为JSON字符串
    const { resultImageUrls, ...restUpdates } = updates;

    return prisma.task.update({
      where: { id: taskId },
      data: {
        ...restUpdates,
        ...(resultImageUrls && {
          resultImageUrls: JSON.stringify(resultImageUrls) as Prisma.InputJsonValue,
        }),
        version: { increment: 1 },
        lastModifiedAt: new Date(),
        lastModifiedBy: modifier,
      } as Prisma.TaskUpdateInput,
    });
  }

  /**
   * 检测冲突
   */
  async detectConflict(
    taskId: string,
    current: Task,
    updates: UpdateTaskInput
  ): Promise<import('./task.repository.types').ConflictInfo> {
    const conflictDetails: Array<{ field: string; local: unknown; remote: unknown }> = [];
    const remoteChanges: Record<string, unknown> = {};

    // 检查关键字段是否被修改
    const fieldsToCheck = ['prompt', 'status', 'progress', 'originalPrompt', 'optimizedPrompt'];
    for (const field of fieldsToCheck) {
      const updatesRecord = updates as Record<string, unknown>;
      const currentRecord = current as Record<string, unknown>;
      if (updatesRecord[field] !== undefined && updatesRecord[field] !== currentRecord[field]) {
        conflictDetails.push({
          field,
          local: updatesRecord[field],
          remote: currentRecord[field],
        });
        remoteChanges[field] = currentRecord[field];
      }
    }

    // 检查飞书记录是否被更新（如果有feishuRecordId）
    if (current.feishuRecordId) {
      try {
        const { getFeishuService } = await import('../services/feishu.service');
        const feishuService = getFeishuService();

        const feishuRecord = await feishuService.getRecord(current.feishuRecordId);
        const feishuModified = new Date(feishuRecord.last_modified_time);

        // 如果飞书记录更新时间晚于本地记录
        if (feishuModified > current.lastModifiedAt) {
          conflictDetails.push({
            field: 'feishu_data',
            local: 'local_changes',
            remote: 'feishu_changes',
          });
        }
      } catch (error) {
        // 飞书记录不可访问，记录警告但不影响主流程
        console.warn('[TaskRepository] Failed to check feishu record for conflicts:', error);
      }
    }

    return {
      taskId,
      currentVersion: current.version,
      attemptedVersion: current.version,
      currentData: current,
      attemptedData: updates as Partial<Task>,
      conflicts: conflictDetails.length > 0 ? conflictDetails : undefined,
      localVersion: current.version,
      lastModifiedBy: current.lastModifiedBy || 'unknown',
      lastModifiedAt: current.lastModifiedAt,
      remoteChanges: Object.keys(remoteChanges).length > 0 ? remoteChanges : undefined,
    };
  }

  /**
   * 解决冲突
   */
  async resolveConflict(
    taskId: string,
    strategy: 'use_local' | 'use_remote',
    modifier: 'web' | 'feishu' | 'api' = 'web'
  ): Promise<Task> {
    const task = await this.findById(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    if (strategy === 'use_local') {
      // 使用本地数据，递增版本号
      return prisma.task.update({
        where: { id: taskId },
        data: {
          conflictDetected: false,
          version: { increment: 1 },
          lastModifiedAt: new Date(),
          lastModifiedBy: modifier,
        },
      });
    } else if (strategy === 'use_remote') {
      // 使用远程数据，需要从飞书获取
      if (!task.feishuRecordId) {
        throw new Error('Cannot use remote strategy: no feishuRecordId');
      }

      const { getFeishuService } = await import('../services/feishu.service');
      const feishuService = getFeishuService();

      const feishuRecord = await feishuService.getRecord(task.feishuRecordId);

      // 从飞书记录更新本地数据
      return prisma.task.update({
        where: { id: taskId },
        data: {
          prompt: feishuRecord.fields['提示词'] as string | null,
          status: this.mapFeishuStatus(feishuRecord.fields['状态'] as string),
          // 可以添加更多字段映射
          conflictDetected: false,
          version: { increment: 1 },
          lastModifiedAt: new Date(),
          lastModifiedBy: 'feishu',
        },
      });
    }

    throw new Error('Invalid conflict resolution strategy');
  }

  /**
   * 映射飞书状态到本地状态
   */
  private mapFeishuStatus(feishuStatus: string): TaskStatus {
    const statusMap: Record<string, TaskStatus> = {
      Pending: TaskStatus.PENDING,
      Processing: TaskStatus.PROCESSING,
      Completed: TaskStatus.COMPLETED,
      Failed: TaskStatus.FAILED,
    };
    return statusMap[feishuStatus] || TaskStatus.PENDING;
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
