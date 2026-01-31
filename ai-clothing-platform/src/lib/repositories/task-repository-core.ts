/**
 * TaskRepositoryCore - 核心 CRUD 操作
 */

import { prisma } from '@/lib/prisma';
import { Task, Prisma } from '@prisma/client';
import type {
  TaskWithRelations,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilter,
} from './task.repository.types';

export class TaskRepositoryCore {
  /**
   * 创建任务
   */
  async create(data: CreateTaskInput): Promise<Task> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const userId = data.userId || 'default-user';

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
    const where: Prisma.TaskWhereInput = this.buildWhereClause(filter);

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
