/**
 * useRecordsManagement - 记录管理 Hook
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { HistoryTask } from '@/lib/types/history.types';
import { useRecordsPolling } from './use-records-polling';
import type { UseRecordsManagementOptions, UseRecordsManagementReturn } from './use-records-management.types';
import type { RecordsManagementRefs, RecordsManagementState } from './use-records-management.types';
import { fetchRecords, hasProcessingTasks } from './use-records-management-utils';

export function useRecordsManagement({
  onNewCompletedTask,
  onHistoryTasksChange,
}: UseRecordsManagementOptions = {}): UseRecordsManagementReturn {
  const [historyTasks, setHistoryTasks] = useState<HistoryTask[]>([]);
  const [isHistoryCleared, setIsHistoryCleared] = useState(false);
  const [hiddenTaskIds, setHiddenTaskIds] = useState<Set<string>>(new Set());

  const isLoadingRecords = useRef(false);
  const previousCompletedIds = useRef<Set<string>>(new Set());
  const isFirstFetch = useRef(true);
  const historyTasksRef = useRef<HistoryTask[]>([]);
  const callbacksRef = useRef({ onNewCompletedTask, onHistoryTasksChange });
  const hasInitializedRef = useRef(false);

  const refs: RecordsManagementRefs = useMemo(
    () => ({
      isLoadingRecords,
      previousCompletedIds,
      isFirstFetch,
      historyTasksRef,
      callbacksRef,
      hasInitializedRef,
    }),
    []
  );

  const state: RecordsManagementState = useMemo(
    () => ({
      historyTasks,
      isHistoryCleared,
      hiddenTaskIds,
    }),
    [historyTasks, isHistoryCleared, hiddenTaskIds]
  );

  const setState = useCallback((updates: Partial<RecordsManagementState>) => {
    if (updates.historyTasks) {
      setHistoryTasks(updates.historyTasks);
    }
    if (updates.isHistoryCleared !== undefined) {
      setIsHistoryCleared(updates.isHistoryCleared);
    }
    if (updates.hiddenTaskIds !== undefined) {
      setHiddenTaskIds(updates.hiddenTaskIds);
    }
  }, []);

  const fetchRecordsCallback = useCallback(() => {
    return fetchRecords({ state, refs, setState });
  }, [state, refs, setState]);

  useEffect(() => {
    historyTasksRef.current = historyTasks;
  }, [historyTasks]);

  useEffect(() => {
    callbacksRef.current = { onNewCompletedTask, onHistoryTasksChange };
  }, [onNewCompletedTask, onHistoryTasksChange]);

  useEffect(() => {
    if (!hasInitializedRef.current && historyTasks.length === 0 && !isHistoryCleared) {
      hasInitializedRef.current = true;
      fetchRecordsCallback();
    }
  }, [historyTasks.length, isHistoryCleared, fetchRecordsCallback]);

  useRecordsPolling({
    onPoll: fetchRecordsCallback,
    interval: 5000,
    enabled: !isHistoryCleared && hasProcessingTasks(historyTasks),
  });

  const clearHistory = useCallback(() => {
    setIsHistoryCleared(true);
    setHistoryTasks([]);
    historyTasksRef.current = [];
    callbacksRef.current.onHistoryTasksChange?.([]);
  }, []);

  const resetHistory = useCallback(() => {
    setHistoryTasks([]);
    historyTasksRef.current = [];
    setIsHistoryCleared(false);
    callbacksRef.current.onHistoryTasksChange?.([]);
  }, []);

  const addTask = useCallback((task: HistoryTask) => {
    setHistoryTasks(prev => {
      const newTasks = [task, ...prev];
      historyTasksRef.current = newTasks;
      return newTasks;
    });
  }, []);

  const hideTask = useCallback((taskId: string) => {
    setHiddenTaskIds(prev => new Set([...prev, taskId]));
  }, []);

  const unhideTask = useCallback((taskId: string) => {
    setHiddenTaskIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
  }, []);

  const isTaskHidden = useCallback(
    (taskId: string) => {
      return hiddenTaskIds.has(taskId);
    },
    [hiddenTaskIds]
  );

  return {
    historyTasks,
    isHistoryCleared,
    fetchRecords: fetchRecordsCallback,
    clearHistory,
    resetHistory,
    addTask,
    hideTask,
    unhideTask,
    isTaskHidden,
    hiddenTaskIds,
  };
}

export type { UseRecordsManagementOptions, UseRecordsManagementReturn } from './use-records-management.types';
