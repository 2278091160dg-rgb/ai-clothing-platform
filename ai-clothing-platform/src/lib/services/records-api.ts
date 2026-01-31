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

    // 使用映射工具转换数据
    const tasks: HistoryTask[] = feishuRecords
      .map(mapFeishuRecordToHistoryTask)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // 使用 Map 进行去重（基于 record_id）
    const tasksMap = new Map<string, HistoryTask>();
    tasks.forEach(task => {
      tasksMap.set(task.recordId, task);
    });

    return Array.from(tasksMap.values());
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
    const localProcessingTasks = localTasks.filter(
      t => t.source === 'web' && t.status === 'processing' && !feishuRecordIds.has(t.recordId)
    );

    return [...localProcessingTasks, ...feishuTasks];
  }
}
