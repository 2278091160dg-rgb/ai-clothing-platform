/**
 * useRecordsManagement Types
 */

import type { HistoryTask, HistoryRecord } from '@/lib/types/history.types';

export interface UseRecordsManagementOptions {
  onNewCompletedTask?: (task: HistoryTask, record: HistoryRecord) => void;
  onHistoryTasksChange?: (tasks: HistoryTask[]) => void;
}

export interface UseRecordsManagementReturn {
  historyTasks: HistoryTask[];
  isHistoryCleared: boolean;
  fetchRecords: () => Promise<void>;
  clearHistory: () => void;
  resetHistory: () => void;
  addTask: (task: HistoryTask) => void;
  hideTask: (taskId: string) => void;
  unhideTask: (taskId: string) => void;
  isTaskHidden: (taskId: string) => boolean;
  hiddenTaskIds: Set<string>;
}

export interface RecordsManagementState {
  historyTasks: HistoryTask[];
  isHistoryCleared: boolean;
  hiddenTaskIds: Set<string>;
}

export interface RecordsManagementRefs {
  isLoadingRecords: React.MutableRefObject<boolean>;
  previousCompletedIds: React.MutableRefObject<Set<string>>;
  isFirstFetch: React.MutableRefObject<boolean>;
  historyTasksRef: React.MutableRefObject<HistoryTask[]>;
  callbacksRef: React.MutableRefObject<UseRecordsManagementOptions>;
  hasInitializedRef: React.MutableRefObject<boolean>;
}
