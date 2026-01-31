/**
 * TaskRepositoryConflict - 并发控制和冲突解决
 */

import { prisma } from '@/lib/prisma';
import { Task, Prisma } from '@prisma/client';
import { TaskStatus } from '@prisma/client';
import type { UpdateTaskInput, TaskWithRelations } from './task.repository.types';
import { VersionConflictError } from './task.repository.types';
import type { ConflictInfo } from './task.repository.types';

export class TaskRepositoryConflict {
  /**
   * 带版本检查的更新（乐观锁）
   * @throws {VersionConflictError} 当版本不匹配时抛出
   */
  async updateWithVersion(
    taskId: string,
    updates: UpdateTaskInput,
    expectedVersion: number,
    current: TaskWithRelations,
    modifier: 'web' | 'feishu' | 'api' = 'web'
  ): Promise<Task> {
    // 检查版本号
    if (current.version !== expectedVersion) {
      const conflictInfo = await this.detectConflict(taskId, current, updates);
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
    current: TaskWithRelations,
    updates: UpdateTaskInput
  ): Promise<ConflictInfo> {
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
        console.warn(
          '[TaskRepositoryConflict] Failed to check feishu record for conflicts:',
          error
        );
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
    task: TaskWithRelations,
    strategy: 'use_local' | 'use_remote',
    modifier: 'web' | 'feishu' | 'api' = 'web'
  ): Promise<Task> {
    if (strategy === 'use_local') {
      // 使用本地数据，递增版本号
      return prisma.task.update({
        where: { id: task.id },
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
        where: { id: task.id },
        data: {
          prompt: feishuRecord.fields['提示词'] as string | null,
          status: this.mapFeishuStatus(feishuRecord.fields['状态'] as string),
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
