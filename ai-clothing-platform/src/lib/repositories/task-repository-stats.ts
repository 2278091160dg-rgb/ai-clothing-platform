/**
 * TaskRepositoryStats - 统计功能
 */

import { prisma } from '@/lib/prisma';
import { TaskStatus, Prisma } from '@prisma/client';
import type { TaskFilter } from './task.repository.types';

export class TaskRepositoryStats {
  /**
   * 统计任务数量
   */
  async count(filter: TaskFilter = {}): Promise<number> {
    const where: Prisma.TaskWhereInput = this.buildWhereClause(filter);
    return prisma.task.count({ where });
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
   * 构建查询条件
   */
  private buildWhereClause(filter: TaskFilter): Prisma.TaskWhereInput {
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

    return where;
  }
}
