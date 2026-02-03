/**
 * useRecordsManagement Utilities
 */

import type { HistoryTask } from '@/lib/types/history.types';
import type { RecordsManagementState, RecordsManagementRefs } from './use-records-management.types';
import { RecordsAPI } from '@/lib/services/records-api';

export interface FetchRecordsOptions {
  state: RecordsManagementState;
  refs: RecordsManagementRefs;
  setState: (updates: Partial<RecordsManagementState>) => void;
}

export async function fetchRecords({ state, refs, setState }: FetchRecordsOptions) {
  if (refs.isLoadingRecords.current || state.isHistoryCleared) {
    return;
  }

  refs.isLoadingRecords.current = true;

  try {
    const deduplicatedTasks = await RecordsAPI.fetchAndTransformRecords();
    const { newCompletedIds } = RecordsAPI.detectNewCompletedTasks(
      deduplicatedTasks,
      refs.previousCompletedIds.current
    );

    if (!refs.isFirstFetch.current) {
      newCompletedIds.forEach(taskId => {
        const completedTask = deduplicatedTasks.find(t => t.id === taskId);
        if (completedTask && completedTask.resultImages && completedTask.resultImages.length > 0) {
          const newRecord: import('@/lib/types/history.types').HistoryRecord = {
            id: completedTask.id,
            original: completedTask.productImagePreview || '',
            sceneImage: completedTask.sceneImagePreview,
            generated: completedTask.resultImages[0],
            timestamp: Date.now(),
            prompt: completedTask.prompt,
          };
          refs.callbacksRef.current.onNewCompletedTask?.(completedTask, newRecord);
        }
      });
    } else {
      refs.isFirstFetch.current = false;
    }

    refs.previousCompletedIds.current = newCompletedIds;

    const mergedTasks = RecordsAPI.mergeLocalAndFeishuTasks(
      deduplicatedTasks,
      refs.historyTasksRef.current
    );

    const shouldUpdate = checkIfNeedsUpdate(refs.historyTasksRef.current, mergedTasks);
    if (shouldUpdate) {
      console.log('🔄 [DEBUG] 任务列表实质性变化，触发更新');
      setState({ historyTasks: mergedTasks });
    } else {
      console.log('✅ [DEBUG] 无实质性变化，跳过更新');
    }
  } catch (error) {
    console.error('❌ 获取记录失败:', error);
  } finally {
    refs.isLoadingRecords.current = false;
  }
}

function checkIfNeedsUpdate(oldTasks: HistoryTask[], newTasks: HistoryTask[]): boolean {
  if (oldTasks.length !== newTasks.length) return true;

  for (let i = 0; i < newTasks.length; i++) {
    const oldTask = oldTasks[i];
    const newTask = newTasks[i];

    if (oldTask.id !== newTask.id) return true;
    if (oldTask.status !== newTask.status) return true;
    if (Math.abs(oldTask.progress - newTask.progress) > 5) return true;

    const hadResult = oldTask.resultImages && oldTask.resultImages.length > 0;
    const hasResult = newTask.resultImages && newTask.resultImages.length > 0;
    if (!hadResult && hasResult) return true;
  }

  return false;
}

export function hasProcessingTasks(tasks: HistoryTask[]): boolean {
  return tasks.some(t => t.status === 'processing' || t.status === 'pending');
}
