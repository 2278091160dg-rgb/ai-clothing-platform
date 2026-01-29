/**
 * FeishuService - 飞书服务
 * 实现实时同步到飞书Bitable的功能
 * Architecture: Feishu-First - 飞书是主要数据源
 */

import type {
  FeishuConfig,
  FeishuAccessToken,
  BitableRecord,
  TaskRecordUpdate,
  CreateTaskRecordParams,
} from './feishu/feishu.types';
import {
  fetchAccessToken,
  uploadImageToFeishu,
  getFeishuImageUrl,
  verifyFeishuWebhook,
  parseFeishuWebhookEvent,
} from './feishu/feishu-api';

/**
 * Feishu Service Class
 */
export class FeishuService {
  private config: FeishuConfig;
  private tokenCache: FeishuAccessToken | null = null;

  constructor(config: FeishuConfig) {
    this.config = config;
  }

  /**
   * 获取访问令牌（带缓存）
   */
  async getAccessToken(): Promise<string> {
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.accessToken;
    }

    this.tokenCache = await fetchAccessToken(this.config);
    return this.tokenCache.accessToken;
  }

  /**
   * 上传图片到飞书云空间
   */
  async uploadImage(file: File | Buffer, fileName: string) {
    const token = await this.getAccessToken();
    return uploadImageToFeishu(token, file, fileName);
  }

  /**
   * 获取图片URL
   */
  getImageUrl(fileToken: string): string {
    return getFeishuImageUrl(fileToken);
  }

  /**
   * 创建Bitable记录（实时同步）
   */
  async createTaskRecord(params: CreateTaskRecordParams): Promise<BitableRecord> {
    const token = await this.getAccessToken();

    const fields = {
      用户ID: params.userId,
      商品图片: [{ file_token: params.productImageToken }],
      ...(params.sceneImageToken && {
        场景图: [{ file_token: params.sceneImageToken }],
      }),
      提示词: params.prompt,
      AI模型: params.aiModel,
      尺寸比例: params.aspectRatio,
      生成张数: params.imageCount,
      清晰度: params.quality,
      状态: 'Pending',
      创建时间: Date.now(),
    };

    const response = await fetch(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.config.bitableAppToken}/tables/${this.config.bitableTableId}/records`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      }
    );

    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(`Failed to create record: ${data.msg}`);
    }

    return data.data.record;
  }

  /**
   * 更新任务记录
   */
  async updateTaskRecord(recordId: string, updates: TaskRecordUpdate): Promise<BitableRecord> {
    const token = await this.getAccessToken();

    const fields: Record<string, unknown> = {};

    if (updates.status) {
      fields['状态'] = updates.status;
    }

    if (updates.resultImages && updates.resultImages.length > 0) {
      fields['生成结果'] = updates.resultImages.map(token => ({
        file_token: token,
      }));
    }

    if (updates.errorMessage) {
      fields['错误信息'] = updates.errorMessage;
    }

    if (updates.progress !== undefined) {
      fields['进度'] = updates.progress;
    }

    fields['更新时间'] = Date.now();

    const response = await fetch(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.config.bitableAppToken}/tables/${this.config.bitableTableId}/records/${recordId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      }
    );

    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(`Failed to update record: ${data.msg}`);
    }

    return data.data.record;
  }

  /**
   * 获取记录详情
   */
  async getRecord(recordId: string): Promise<BitableRecord> {
    const token = await this.getAccessToken();

    const response = await fetch(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.config.bitableAppToken}/tables/${this.config.bitableTableId}/records/${recordId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(`Failed to get record: ${data.msg}`);
    }

    return data.data.record;
  }

  /**
   * 查询记录（按用户ID）
   */
  async getRecordsByUser(userId: string, pageSize = 50): Promise<BitableRecord[]> {
    const token = await this.getAccessToken();

    const filter = {
      conjunction: 'and',
      conditions: [
        {
          field_name: '用户ID',
          operator: 'is',
          value: [userId],
        },
      ],
    };

    const response = await fetch(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.config.bitableAppToken}/tables/${this.config.bitableTableId}/records?filter=${JSON.stringify(filter)}&page_size=${pageSize}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(`Failed to query records: ${data.msg}`);
    }

    return data.data.items || [];
  }

  /**
   * 删除记录
   */
  async deleteRecord(recordId: string): Promise<void> {
    const token = await this.getAccessToken();

    const response = await fetch(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.config.bitableAppToken}/tables/${this.config.bitableTableId}/records/${recordId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(`Failed to delete record: ${data.msg}`);
    }
  }

  /**
   * 验证Webhook签名
   */
  verifyWebhook(signature: string, timestamp: string): boolean {
    return verifyFeishuWebhook(signature, timestamp);
  }

  /**
   * 解析Webhook事件
   */
  parseWebhookEvent(body: unknown) {
    return parseFeishuWebhookEvent(body);
  }
}

// 创建单例实例
let feishuServiceInstance: FeishuService | null = null;

export function getFeishuService(): FeishuService {
  if (!feishuServiceInstance) {
    const config: FeishuConfig = {
      appId: process.env.FEISHU_APP_ID || '',
      appSecret: process.env.FEISHU_APP_SECRET || '',
      bitableAppToken: process.env.FEISHU_BITABLE_APP_TOKEN || '',
      bitableTableId: process.env.FEISHU_BITABLE_TABLE_ID || '',
    };

    if (!config.appId || !config.appSecret) {
      throw new Error('Feishu credentials not configured');
    }

    feishuServiceInstance = new FeishuService(config);
  }

  return feishuServiceInstance;
}
