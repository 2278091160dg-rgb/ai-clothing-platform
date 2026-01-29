/**
 * Task Repository Types
 * 任务仓储相关类型定义
 */

import { Task, TaskStatus } from '@prisma/client';

/**
 * 任务关联数据类型
 */
export type TaskWithRelations = Task & {
  user?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
};

/**
 * Prompt Source 枚举
 */
export enum PromptSource {
  USER = 'USER',
  AI_OPTIMIZED = 'AI_OPTIMIZED',
  FEISHU = 'FEISHU',
  MERGED = 'MERGED',
}

/**
 * Task Sync Status 枚举
 */
export enum TaskSyncStatus {
  PENDING = 'PENDING',
  SYNCING = 'SYNCING',
  SYNCED = 'SYNCED',
  FAILED = 'FAILED',
}

/**
 * 创建任务输入
 * 使用更简单的类型，避免 Prisma.TaskCreateInput 的复杂关联要求
 */
export type CreateTaskInput = {
  userId?: string;
  mode?: string;
  prompt?: string;
  negativePrompt?: string;
  productImageUrl?: string;
  productImageToken?: string;
  sceneImageUrl?: string;
  sceneImageToken?: string;
  clothingImageUrl?: string;
  tryonReferenceImageUrl?: string;
  wearProductImageUrl?: string;
  wearReferenceImageUrl?: string;
  materialImageUrls?: string[];
  aiModel?: string;
  aspectRatio?: string;
  imageCount?: number;
  quality?: string;
  originalPrompt?: string;
  originalNegativePrompt?: string;
  optimizedPrompt?: string;
  optimizedNegativePrompt?: string;
  promptSource?: string;
  promptOptimizationEnabled?: boolean;
  syncStatus?: string;
  // 其他可选字段
  [key: string]: string | number | boolean | string[] | undefined;
};

/**
 * 更新任务输入
 */
export type UpdateTaskInput = {
  status?: TaskStatus | string;
  resultImageUrls?: string[];
  errorMessage?: string;
  feishuRecordId?: string;
  version?: number;
  progress?: number;
  syncStatus?: string;
  lastSyncAt?: Date;
  syncError?: string;
  // 其他可选字段
  [key: string]: string | number | boolean | string[] | Date | undefined;
};

/**
 * 任务过滤器
 */
export interface TaskFilter {
  userId?: string;
  status?: TaskStatus;
  ids?: string[];
  batchId?: string;
  feishuRecordId?: string;
  expiresBefore?: Date;
}

/**
 * 版本冲突错误
 */
export class VersionConflictError extends Error {
  public readonly taskId: string;
  public readonly currentVersion: number;
  public readonly attemptedVersion: number;
  public readonly expectedVersion?: number;
  public readonly actualData?: Record<string, unknown>;
  public readonly conflict?: ConflictInfo;

  constructor(params: {
    taskId: string;
    currentVersion: number;
    attemptedVersion: number;
    expectedVersion?: number;
    actualData?: Record<string, unknown>;
    conflict?: ConflictInfo;
  }) {
    super(
      `Version conflict for task ${params.taskId}: current version is ${params.currentVersion}, attempted to update to ${params.attemptedVersion}`
    );
    this.name = 'VersionConflictError';
    this.taskId = params.taskId;
    this.currentVersion = params.currentVersion;
    this.attemptedVersion = params.attemptedVersion;
    this.expectedVersion = params.expectedVersion;
    this.actualData = params.actualData;
    this.conflict = params.conflict;
  }
}

/**
 * 冲突信息
 */
export interface ConflictInfo {
  taskId: string;
  currentVersion: number;
  attemptedVersion: number;
  currentData: TaskWithRelations;
  attemptedData: Partial<Task>;
  conflicts?: Array<{ field: string; local: unknown; remote: unknown }>;
  localVersion?: number;
  lastModifiedBy?: string;
  lastModifiedAt?: Date;
  remoteChanges?: Record<string, unknown>;
}
