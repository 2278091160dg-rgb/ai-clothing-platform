/**
 * useDeleteConfirmation - 删除二次确认 Hook
 *
 * 处理删除操作的双重点击确认逻辑
 */

import { useState, useCallback } from 'react';

export function useDeleteConfirmation(onConfirm: (scope: string) => void) {
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = useCallback(() => {
    if (confirmed) {
      onConfirm('both');
    } else {
      setConfirmed(true);
      setTimeout(() => setConfirmed(false), 3000);
    }
  }, [confirmed, onConfirm]);

  const resetConfirmation = useCallback(() => {
    setConfirmed(false);
  }, []);

  return { confirmed, handleConfirm, resetConfirmation };
}
