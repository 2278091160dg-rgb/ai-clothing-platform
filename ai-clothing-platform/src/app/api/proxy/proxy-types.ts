/**
 * Proxy API Types
 * 代理API相关类型定义
 */

export interface FeishuCreateRecordResponse {
  code: number;
  msg: string;
  data?: {
    record?: {
      record_id: string;
    };
  };
}

export interface FeishuMediaUploadResponse {
  code: number;
  msg: string;
  data?: {
    file_token: string;
  };
}

export interface N8NWebhookPayload {
  record_id: string;
  prompt: string;
  negative_prompt?: string;
  ratio?: string;
  model?: string;
  mode?: string;
  app_token: string;
  table_id: string;
  product_image_token?: string;
  scene_image_token?: string;
  source?: string;
}

export interface ProxyRequestData {
  prompt: string;
  negative_prompt: string | null;
  ratio: string;
  model: string;
  mode: string;
  productImage: File | null;
  sceneImage: File | null;
}

export interface ProxyResponseData {
  success: true;
  message: string;
  feishu_record_id: string;
  product_image_token?: string;
  scene_image_token?: string;
  n8n_response: unknown;
}
