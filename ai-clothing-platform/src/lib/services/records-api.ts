/**
 * RecordsAPI - 记录 API 服务
 */

import type { HistoryTask, FeishuRecord } from '@/lib/types/history.types';
import { mapFeishuRecordToHistoryTask } from '@/lib/utils/task-mappers';

export class RecordsAPI {
  /**
   * 获取记录列表
   */
  static async fetchRecords(): Promise<FeishuRecord[]> {
    const response = await fetch('/api/records');
    const data = await response.json();

    if (data.success && data.data) {
      return data.data as FeishuRecord[];
    }

    return [];
  }

  /**
   * 转换并去重记录为任务列表
   */
  static async fetchAndTransformRecords(): Promise<HistoryTask[]> {
    const feishuRecords = await this.fetchRecords();

    // 使用 Map 进行去重（基于 record_id）
    const tasksMap = new Map<string, HistoryTask>();
    feishuRecords.forEach(record => {
      const task = mapFeishuRecordToHistoryTask(record);
      // 只保留最新版本
      tasksMap.set(task.recordId, task);
    });

    // 转换为数组并按创建时间降序排序（最新的在前）
    const tasks = Array.from(tasksMap.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    return tasks;
  }

  /**
   * 检测新完成的任务
   */
  static detectNewCompletedTasks(
    tasks: HistoryTask[],
    previousCompletedIds: Set<string>
  ): { newCompletedIds: Set<string>; justCompletedTaskIds: string[] } {
    const newCompletedIds = new Set(tasks.filter(t => t.status === 'completed').map(t => t.id));

    const justCompletedTaskIds = [...newCompletedIds].filter(id => !previousCompletedIds.has(id));

    return { newCompletedIds, justCompletedTaskIds };
  }

  /**
   * 合并本地处理中的任务和飞书任务
   */
  static mergeLocalAndFeishuTasks(
    feishuTasks: HistoryTask[],
    localTasks: HistoryTask[]
  ): HistoryTask[] {
    const feishuRecordIds = new Set(feishuTasks.map(t => t.recordId));

    // 只保留本地处理中任务，且满足以下条件之一：
    // 1. recordId 不在飞书任务中（避免重复）
    // 2. 是临时任务（ID 以 temp- 开头），但需要检查是否有对应的真实任务
    const localProcessingTasks = localTasks.filter(t => {
      // 非网页端任务直接跳过
      if (t.source !== 'web') return false;

      // 非处理中任务跳过
      if (t.status !== 'processing') return false;

      // 如果 recordId 在飞书任务中，说明已被真实任务替代，跳过
      if (feishuRecordIds.has(t.recordId)) return false;

      // 临时任务（ID 以 temp- 开头）：检查是否有 prompt 相同的真实任务
      // 如果有，说明临时任务已被替代，跳过
      if (t.recordId.startsWith('temp-')) {
        const hasMatchingFeishuTask = feishuTasks.some(
          ft => ft.prompt === t.prompt && ft.source === 'web'
        );
        if (hasMatchingFeishuTask) return false;
      }

      return true;
    });

    // 合并后按创建时间降序排序（最新的在前）
    const merged = [...localProcessingTasks, ...feishuTasks];
    return merged.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
