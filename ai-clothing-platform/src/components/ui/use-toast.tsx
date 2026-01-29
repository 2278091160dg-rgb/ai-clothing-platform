/**
 * useToast Hook (Stub)
 * Toast通知钩子 - 简化实现
 */

import * as React from 'react';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
  action?: React.ReactNode;
};

type Toast = ToastProps & {
  id: string;
};

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = Toast & {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

let count = 0;

function toast({ ...props }: ToastProps) {
  const id = String(count++);

  const update = (props: ToasterToast) => {
    // Stub implementation - would update toast in real implementation
    console.log('[Toast] Update:', id, props);
  };

  const dismiss = () => removeToast(id);

  const timeout = setTimeout(() => {
    dismiss();
  }, props.duration || TOAST_REMOVE_DELAY);

  // Stub: store toasts in memory (real implementation would use state)
  const toasts = new Map<string, ToasterToast>();
  toasts.set(id, {
    ...props,
    id,
  });

  console.log('[Toast] Show:', id, props);

  return {
    id: id,
    dismiss,
    update,
  };
}

function removeToast(id: string) {
  console.log('[Toast] Dismiss:', id);
}

function useToast() {
  return {
    toast,
    dismiss: (id: string) => removeToast(id),
  };
}

export { useToast, toast };
