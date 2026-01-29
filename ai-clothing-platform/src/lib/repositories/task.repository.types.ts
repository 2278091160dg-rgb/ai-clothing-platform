/**
 * Task Repository Types
 * 任务仓储类型定义
 */

import { Task, TaskStatus, PromptSource, TaskSyncStatus } from '@prisma/client';

export type TaskWithRelations = Task & {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
};

export interface CreateTaskInput {
  userId: string;
  productImageUrl?: string;
  productImageToken?: string;
  sceneImageUrl?: string;
  sceneImageToken?: string;
  prompt?: string;
  // Prompt Optimization fields
  originalPrompt?: string;
  optimizedPrompt?: string;
  promptSource?: PromptSource;
  promptOptimizationEnabled?: boolean;
  // Generation Configuration
  aiModel?: string;
  aspectRatio?: string;
  imageCount?: number;
  quality?: string;
  // Batch Support
  batchId?: string;
  batchIndex?: number;
  // Sync Status
  syncStatus?: TaskSyncStatus;
}

export interface UpdateTaskInput {
  // Input Data
  productImageUrl?: string;
  productImageToken?: string;
  sceneImageUrl?: string;
  sceneImageToken?: string;
  prompt?: string;
  // Prompt Optimization fields
  originalPrompt?: string;
  optimizedPrompt?: string;
  promptSource?: PromptSource;
  promptOptimizationEnabled?: boolean;
  promptOptimizationId?: string;
  promptOptimizedAt?: Date;
  // Generation Configuration
  aiModel?: string;
  aspectRatio?: string;
  imageCount?: number;
  quality?: string;
  // Result
  resultImageUrls?: string; // JSON string array for SQLite
  resultImageTokens?: string; // JSON string array for SQLite
  // Status Tracking
  status?: TaskStatus;
  progress?: number;
  errorMessage?: string;
  // Feishu Integration
  feishuRecordId?: string;
  feishuAppToken?: string;
  feishuTableId?: string;
  // Concurrency Control
  version?: number;
  lastModifiedBy?: string;
  lastModifiedAt?: Date;
  conflictDetected?: boolean;
  // Sync Status
  syncStatus?: TaskSyncStatus;
  syncError?: string;
  lastSyncAt?: Date;
  // Batch Support
  batchId?: string;
  batchIndex?: number;
  // Expiration
  expiresAt?: Date;
  completedAt?: Date;
}

export interface TaskFilter {
  userId?: string;
  status?: TaskStatus;
  batchId?: string;
  feishuRecordId?: string;
  expiresBefore?: Date;
  // New filters
  promptSource?: PromptSource;
  syncStatus?: TaskSyncStatus;
  conflictDetected?: boolean;
  lastModifiedBy?: string;
}

/**
 * Version Conflict Error
 * 版本冲突错误
 */
export class VersionConflictError extends Error {
  public readonly conflict: ConflictInfo;

  constructor(details: {
    taskId: string;
    currentVersion: number;
    expectedVersion: number;
    actualData: Task;
    conflict: ConflictInfo;
  }) {
    super(`Version conflict for task ${details.taskId}: expected version ${details.expectedVersion}, got ${details.currentVersion}`);
    this.name = 'VersionConflictError';
    this.conflict = details.conflict;
  }
}

/**
 * Conflict Information
 * 冲突信息
 */
export interface ConflictInfo {
  taskId: string;
  conflicts: string[];  // 冲突的字段列表
  localVersion: number;
  lastModifiedBy: string;
  lastModifiedAt: Date;
  remoteChanges?: Record<string, any>;  // 远程的修改内容
}

/**
 * Task Sync Result
 * 任务同步结果
 */
export interface TaskSyncResult {
  taskId: string;
  success: boolean;
  syncStatus: TaskSyncStatus;
  feishuRecordId?: string;
  error?: string;
  conflictDetected?: boolean;
}

// Re-export enums for convenience
export type { PromptSource, TaskSyncStatus } from '@prisma/client';
