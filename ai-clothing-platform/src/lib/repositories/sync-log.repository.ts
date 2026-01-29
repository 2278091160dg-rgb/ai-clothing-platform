/**
 * SyncLogRepository - 同步日志仓储
 */

import { prisma } from '@/lib/prisma';
import { SyncSource, SyncAction, SyncStatus, Prisma } from '@prisma/client';

export interface CreateSyncLogInput {
  userId?: string;
  source: SyncSource;
  action: SyncAction;
  entityType: string;
  entityId: string;
  requestData?: any;
  responseData?: any;
  status?: SyncStatus;
  errorCode?: string;
  errorMessage?: string;
  retryCount?: number;
  maxRetries?: number;
}

export interface UpdateSyncLogInput {
  status?: SyncStatus;
  responseData?: any;
  errorCode?: string;
  errorMessage?: string;
  retryCount?: number;
  completedAt?: Date;
}

export class SyncLogRepository {
  /**
   * 创建同步日志
   */
  async create(data: CreateSyncLogInput) {
    return prisma.syncLog.create({
      data: data as Prisma.SyncLogUncheckedCreateInput,
    });
  }

  /**
   * 通过ID查找日志
   */
  async findById(id: string) {
    return prisma.syncLog.findUnique({
      where: { id },
    });
  }

  /**
   * 更新同步日志
   */
  async update(id: string, data: UpdateSyncLogInput) {
    return prisma.syncLog.update({
      where: { id },
      data,
    });
  }

  /**
   * 标记为成功
   */
  async markAsSuccess(id: string, responseData?: any) {
    return prisma.syncLog.update({
      where: { id },
      data: {
        status: SyncStatus.SUCCESS,
        responseData,
        completedAt: new Date(),
      },
    });
  }

  /**
   * 标记为失败
   */
  async markAsFailed(id: string, errorCode: string, errorMessage: string) {
    return prisma.syncLog.update({
      where: { id },
      data: {
        status: SyncStatus.FAILED,
        errorCode,
        errorMessage,
        completedAt: new Date(),
      },
    });
  }

  /**
   * 增加重试次数
   */
  async incrementRetry(id: string): Promise<{ retryCount: number }> {
    const log = await prisma.syncLog.update({
      where: { id },
      data: {
        retryCount: {
          increment: 1,
        },
        status: SyncStatus.RETRYING,
      },
      select: {
        retryCount: true,
      },
    });

    return log;
  }

  /**
   * 查询同步日志
   */
  async findMany(options?: {
    skip?: number;
    take?: number;
    where?: Prisma.SyncLogWhereInput;
    orderBy?: Prisma.SyncLogOrderByWithRelationInput;
  }) {
    return prisma.syncLog.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where,
      orderBy: options?.orderBy || { createdAt: 'desc' },
    });
  }

  /**
   * 获取需要重试的日志
   */
  async findRetryable(limit = 10) {
    return prisma.syncLog.findMany({
      where: {
        status: SyncStatus.FAILED,
        retryCount: {
          lt: prisma.syncLog.fields.maxRetries,
        },
      },
      take: limit,
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * 统计日志
   */
  async count(where?: Prisma.SyncLogWhereInput): Promise<number> {
    return prisma.syncLog.count({ where });
  }

  /**
   * 获取同步统计
   */
  async getStats(userId?: string) {
    const where = userId ? { userId } : {};

    const [total, success, failed, pending] = await Promise.all([
      this.count(where),
      this.count({ ...where, status: SyncStatus.SUCCESS }),
      this.count({ ...where, status: SyncStatus.FAILED }),
      this.count({ ...where, status: SyncStatus.PENDING }),
    ]);

    return {
      total,
      success,
      failed,
      pending,
      successRate: total > 0 ? (success / total) * 100 : 0,
    };
  }

  /**
   * 清理旧日志（保留最近30天）
   */
  async cleanup(daysToKeep = 30): Promise<Prisma.BatchPayload> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    return prisma.syncLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        status: {
          in: [SyncStatus.SUCCESS, SyncStatus.FAILED],
        },
      },
    });
  }
}

// 创建单例实例
let syncLogRepositoryInstance: SyncLogRepository | null = null;

export function getSyncLogRepository(): SyncLogRepository {
  if (!syncLogRepositoryInstance) {
    syncLogRepositoryInstance = new SyncLogRepository();
  }
  return syncLogRepositoryInstance;
}
