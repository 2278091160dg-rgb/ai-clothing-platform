/**
 * API 服务层
 * 封装所有后端 API 调用
 */

import { ConfigManager } from '../config';

interface GenerateTaskRequest {
  mode?: 'scene' | 'tryon' | 'wear' | 'combine';
  productImageUrl: string;
  sceneImageUrl?: string;
  prompt: string;
  negativePrompt?: string;
  aiModel?: string;
  aspectRatio?: string;
  imageCount?: number;
  quality?: string;
  batchId?: string;
  deerApiKey?: string; // 前端配置的DeerAPI密钥（可选）
  callbackUrl?: string; // 前端配置的回调URL（可选）

  // 虚拟试衣参数
  clothingImageUrl?: string;
  clothingDescription?: string;
  tryonReferenceImageUrl?: string;
  tryonModelImageUrl?: string;
  modelDescription?: string;
  sceneDescription?: string;

  // 智能穿戴参数
  wearProductImageUrl?: string;
  wearProductDescription?: string;
  wearReferenceImageUrl?: string;
  productType?: 'shoes' | 'bag' | 'watch' | 'jewelry' | 'hat' | 'scarf';

  // 自由搭配参数
  materialImageUrls?: string[];
  combinationCount?: number;
}

interface TaskResponse {
  id: string;
  status: string;
  createdAt: string;
}

interface TasksListResponse {
  success: boolean;
  data: TaskResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: {
    total: number;
    completed: number;
    processing: number;
    failed: number;
  };
}

class ApiService {
  private baseUrl: string;

  constructor() {
    // 使用相对路径，自动适配环境
    this.baseUrl = '/api';
  }

  /**
   * 创建生成任务
   */
  async createTask(
    request: GenerateTaskRequest
  ): Promise<{ success: boolean; task: TaskResponse }> {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create task';
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch {
        errorMessage = `Server error (${response.status}): ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * 查询任务列表
   */
  async getTasks(params?: {
    status?: string;
    batchId?: string;
    page?: number;
    limit?: number;
  }): Promise<TasksListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.batchId) searchParams.set('batchId', params.batchId);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const response = await fetch(`${this.baseUrl}/tasks?${searchParams}`);

    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    return response.json();
  }

  /**
   * 上传图片到服务器（返回可访问的 URL）
   * 注意：这个方法会将图片上传到临时存储，返回的 URL 可以用于创建任务
   */
  async uploadImage(file: File): Promise<string> {
    // 限制图片大小（5MB）
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `图片大小超过限制（最大5MB），当前大小：${(file.size / 1024 / 1024).toFixed(2)}MB`
      );
    }

    const formData = new FormData();
    formData.append('file', file);

    // 检查是否配置了 DeerAPI
    const config = ConfigManager.getConfig();

    // 如果配置了 DeerAPI，使用 DeerAPI 的上传接口
    if (config.deerApiEndpoint && config.deerApiKey) {
      try {
        const response = await fetch(`${config.deerApiEndpoint}/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.deerApiKey}`,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          const url = data.url || data.data?.url;
          if (url) {
            console.log('[API] Image uploaded to DeerAPI:', url);
            return url;
          }
        }
        console.warn('[API] DeerAPI upload failed with status:', response.status);
      } catch (error) {
        console.warn('[API] DeerAPI upload failed (CORS or network):', error);
      }
    }

    // 如果DeerAPI未配置或失败，抛出错误提示用户配置
    // 不再使用Base64降级方案，因为会导致JSON体过大
    throw new Error(
      '图片上传失败：请先在设置中配置DeerAPI图床服务\n' +
        '配置路径：设置 → API配置 → DeerAPI配置\n' +
        'DeerAPI注册地址：https://www.deerapi.com/'
    );
  }

  /**
   * 批量创建任务
   */
  async createBatchTasks(requests: GenerateTaskRequest[]): Promise<{
    success: boolean;
    tasks: TaskResponse[];
    batchId: string;
  }> {
    const response = await fetch(`${this.baseUrl}/tasks/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create batch tasks');
    }

    return response.json();
  }

  /**
   * 获取任务详情
   */
  async getTask(taskId: string): Promise<TaskResponse> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch task');
    }

    const result = await response.json();
    // API 返回 { success: true, data: task }
    return result.data;
  }
}

// 创建单例实例
export const apiService = new ApiService();
