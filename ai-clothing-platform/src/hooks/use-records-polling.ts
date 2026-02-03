/**
 * useRecordsPolling - 记录轮询 Hook
 */

import { useCallback, useRef, useEffect, useState } from 'react';

export interface UseRecordsPollingOptions {
  onPoll: () => void | Promise<void>;
  interval?: number;
  enabled?: boolean;
}

export function useRecordsPolling({
  onPoll,
  interval = 5000,
  enabled = false, // 默认禁用轮询，让用户主动开启
}: UseRecordsPollingOptions) {
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    if (!enabled) {
      return;
    }

    pollingIntervalRef.current = setInterval(() => {
      onPoll();
    }, interval);

    // 只在状态改变时更新
    if (!isPolling) {
      setIsPolling(true);
    }

    // console.log(`✅ 开始轮询记录状态 (${interval / 1000}秒间隔)`);
  }, [onPoll, interval, enabled, isPolling]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      setIsPolling(false);
      console.log('⏸️ 停止轮询');
    }
  }, []);

  // 组件挂载时启动轮询
  useEffect(() => {
    if (enabled) {
      pollingIntervalRef.current = setInterval(() => {
        onPoll();
      }, interval);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsPolling(true);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        setIsPolling(false);
      }
    };
  }, [enabled, interval, onPoll]);

  return {
    startPolling,
    stopPolling,
    isPolling,
  };
}
