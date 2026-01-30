/**
 * Feishu API - 飞书 API 辅助方法
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { FeishuAccessToken, ImageUploadResult } from './feishu.types';

export interface FeishuConfig {
  appId: string;
  appSecret: string;
  bitableAppToken: string;
  bitableTableId: string;
}

/**
 * 获取访问令牌
 */
export async function fetchAccessToken(config: FeishuConfig): Promise<FeishuAccessToken> {
  const response = await fetch(
    'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: config.appId,
        app_secret: config.appSecret,
      }),
    }
  );

  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`Failed to get access token: ${data.msg}`);
  }

  return {
    accessToken: data.tenant_access_token,
    expireIn: data.expire,
    expiresAt: Date.now() + (data.expire - 60) * 1000, // 提前1分钟过期
  };
}

/**
 * 上传图片到飞书云空间
 */
export async function uploadImageToFeishu(
  token: string,
  file: File | Buffer,
  fileName: string
): Promise<ImageUploadResult> {
  const formData = new FormData();

  if (file instanceof Buffer) {
    const uint8Array = new Uint8Array(file);
    const blob = new Blob([uint8Array], { type: 'image/*' });
    formData.append('file', blob, fileName);
  } else {
    formData.append('file', file as File);
  }

  formData.append('file_type', 'image');

  const response = await fetch('https://open.feishu.cn/open-apis/drive/v1/medias/upload_all', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`Failed to upload image: ${data.msg}`);
  }

  return {
    fileToken: data.data.file_token,
    url: `https://open.feishu.cn/open-apis/drive/v1/medias/${data.data.file_token}/download`,
  };
}

/**
 * 获取图片URL
 */
export function getFeishuImageUrl(fileToken: string): string {
  return `https://open.feishu.cn/open-apis/drive/v1/medias/${fileToken}/download`;
}

/**
 * 验证Webhook签名
 */
export function verifyFeishuWebhook(_signature: string, _timestamp: string): boolean {
  const encryptKey = process.env.FEISHU_ENCRYPT_KEY;
  if (!encryptKey) {
    console.error('FEISHU_ENCRYPT_KEY not configured');
    return false;
  }
  // TODO: 实现实际的签名验证逻辑，需要使用 signature 和 timestamp
  return true;
}

/**
 * 解析Webhook事件
 */
export interface FeishuWebhookEvent {
  type: string;
  event: unknown;
  timestamp: number;
}

export function parseFeishuWebhookEvent(body: unknown): FeishuWebhookEvent {
  const event = body as { type?: string; event?: unknown; ts?: number };
  return {
    type: event.type || '',
    event: event.event,
    timestamp: event.ts || Date.now(),
  };
}
