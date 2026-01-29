/**
 * Feishu Types - 飞书服务类型定义
 */

export interface FeishuConfig {
  appId: string;
  appSecret: string;
  bitableAppToken: string;
  bitableTableId: string;
}

export interface FeishuAccessToken {
  accessToken: string;
  expireIn: number;
  expiresAt: number;
}

export interface ImageUploadResult {
  fileToken: string;
  url: string;
}

export interface BitableRecord {
  record_id: string;
  fields: Record<string, unknown>;
  created_time: number;
  last_modified_time: number;
}

export type TaskStatus =
  | 'Pending'
  | 'Uploading'
  | 'Processing'
  | 'Generating'
  | 'Completed'
  | 'Failed';

export interface TaskRecordUpdate {
  status?: TaskStatus;
  resultImages?: string[];
  errorMessage?: string;
  progress?: number;
}

export interface CreateTaskRecordParams {
  userId: string;
  productImageToken: string;
  sceneImageToken?: string;
  prompt: string;
  aiModel: string;
  aspectRatio: string;
  imageCount: number;
  quality: string;
}
