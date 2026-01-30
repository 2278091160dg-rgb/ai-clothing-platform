/**
 * 事件类型定义
 */

// ============================================
// Task Events
// ============================================

export interface TaskCreatedEvent {
  type: 'task.created';
  taskId: string;
  userId: string;
  data: {
    productImageUrl?: string;
    prompt?: string;
    aiModel: string;
    aspectRatio: string;
    imageCount: number;
    quality: string;
  };
  timestamp: number;
}

export interface TaskUpdatedEvent {
  type: 'task.updated';
  taskId: string;
  userId: string;
  changes: Record<string, unknown>;
  timestamp: number;
}

export interface TaskProgressEvent {
  type: 'task.progress';
  taskId: string;
  userId: string;
  progress: number;
  status: string;
  timestamp: number;
}

export interface TaskCompletedEvent {
  type: 'task.completed';
  taskId: string;
  userId: string;
  resultImageUrls: string[];
  resultImageTokens: string[];
  duration: number;
  timestamp: number;
}

export interface TaskFailedEvent {
  type: 'task.failed';
  taskId: string;
  userId: string;
  errorMessage: string;
  errorCode?: string;
  timestamp: number;
}

export interface TaskDeletedEvent {
  type: 'task.deleted';
  taskId: string;
  userId: string;
  timestamp: number;
}

// ============================================
// Sync Events
// ============================================

export interface SyncStartedEvent {
  type: 'sync.started';
  syncId: string;
  entityType: string;
  entityId: string;
  source: 'feishu' | 'frontend' | 'system';
  action: 'create' | 'update' | 'delete' | 'sync';
  timestamp: number;
}

export interface SyncCompletedEvent {
  type: 'sync.completed';
  syncId: string;
  entityType: string;
  entityId: string;
  duration: number;
  timestamp: number;
}

export interface SyncFailedEvent {
  type: 'sync.failed';
  syncId: string;
  entityType: string;
  entityId: string;
  errorMessage: string;
  errorCode?: string;
  willRetry: boolean;
  timestamp: number;
}

// ============================================
// User Events
// ============================================

export interface UserSignedInEvent {
  type: 'user.signed_in';
  userId: string;
  feishuUserId?: string;
  timestamp: number;
}

export interface UserSignedOutEvent {
  type: 'user.signed_out';
  userId: string;
  timestamp: number;
}

export interface UserQuotaUpdatedEvent {
  type: 'user.quota_updated';
  userId: string;
  oldQuota: number;
  newQuota: number;
  resetAt?: Date;
  timestamp: number;
}

// ============================================
// System Events
// ============================================

export interface WebhookReceivedEvent {
  type: 'webhook.received';
  source: 'feishu' | 'n8n';
  payload: Record<string, unknown>;
  timestamp: number;
}

export interface ErrorOccurredEvent {
  type: 'error.occurred';
  error: Error;
  context?: Record<string, unknown>;
  userId?: string;
  timestamp: number;
}

export interface CacheExpiredEvent {
  type: 'cache.expired';
  entityType: string;
  entityId: string;
  timestamp: number;
}

// ============================================
// Event Union Type
// ============================================

export type AppEvent =
  | TaskCreatedEvent
  | TaskUpdatedEvent
  | TaskProgressEvent
  | TaskCompletedEvent
  | TaskFailedEvent
  | TaskDeletedEvent
  | SyncStartedEvent
  | SyncCompletedEvent
  | SyncFailedEvent
  | UserSignedInEvent
  | UserSignedOutEvent
  | UserQuotaUpdatedEvent
  | WebhookReceivedEvent
  | ErrorOccurredEvent
  | CacheExpiredEvent;

// ============================================
// Event Names
// ============================================

export const EventNames = {
  // Task Events
  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_PROGRESS: 'task.progress',
  TASK_COMPLETED: 'task.completed',
  TASK_FAILED: 'task.failed',
  TASK_DELETED: 'task.deleted',

  // Sync Events
  SYNC_STARTED: 'sync.started',
  SYNC_COMPLETED: 'sync.completed',
  SYNC_FAILED: 'sync.failed',

  // User Events
  USER_SIGNED_IN: 'user.signed_in',
  USER_SIGNED_OUT: 'user.signed_out',
  USER_QUOTA_UPDATED: 'user.quota_updated',

  // System Events
  WEBHOOK_RECEIVED: 'webhook.received',
  ERROR_OCCURRED: 'error.occurred',
  CACHE_EXPIRED: 'cache.expired',
} as const;
