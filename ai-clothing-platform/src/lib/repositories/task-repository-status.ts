/**
 * TaskRepositoryStatus - 状态更新功能
 */

import { prisma } from '@/lib/prisma';
import { TaskStatus } from '@prisma/client';

export class TaskRepositoryStatus {
  /**
   * 更新任务进度
   */
  async updateProgress(id: string, progress: number, status?: TaskStatus) {
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
  async markAsCompleted(id: string, resultImageUrls: string[], resultImageTokens: string[]) {
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
  async markAsFailed(id: string, errorMessage: string) {
    return prisma.task.update({
      where: { id },
      data: {
        status: TaskStatus.FAILED,
        errorMessage,
      },
    });
  }
}
