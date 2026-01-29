/**
 * N8nService - n8n工作流集成服务
 * 负责与n8n工作流引擎通信
 */

interface N8nConfig {
  webhookUrl: string;
  apiKey: string;
}

interface GenerationRequest {
  taskId: string;
  userId: string;
  productImageUrl: string;
  sceneImageUrl?: string;
  prompt: string;
  aiModel: string;
  aspectRatio: string;
  imageCount: number;
  quality: string;
  deerApiKey?: string; // 前端传递的DeerAPI密钥（可选）
  callbackUrl?: string; // 自定义回调URL（可选）
}

interface GenerationResponse {
  success: boolean;
  taskId: string;
  resultImageUrls?: string[];
  resultImageTokens?: string[];
  error?: string;
}

type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export class N8nService {
  private config: N8nConfig;

  constructor(config: N8nConfig) {
    this.config = config;
  }

  /**
   * 触发AI图片生成工作流
   */
  async triggerGeneration(request: GenerationRequest): Promise<void> {
    // 确定回调 URL：使用传入的 callbackUrl 或默认值
    const callbackUrl =
      request.callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/n8n/callback`;

    const payload = {
      ...request,
      apiKey: this.config.apiKey,
      callbackUrl, // 使用确定的回调 URL
      // 将前端传递的DeerAPI Key传递给N8N工作流
      deerApiKey: request.deerApiKey || '',
    };

    try {
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`n8n webhook failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(`n8n workflow error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[N8n] Failed to trigger generation:', error);
      throw error;
    }
  }

  /**
   * 处理n8n回调
   */
  async handleCallback(callback: {
    taskId: string;
    status: GenerationStatus;
    resultImageUrls?: string[];
    resultImageTokens?: string[];
    error?: string;
    progress?: number;
  }): Promise<void> {
    const { taskId, status, resultImageUrls, resultImageTokens, error, progress } = callback;

    // 导入仓储和事件发布器（避免循环依赖）
    const { getTaskRepository } = await import('../repositories/task.repository');
    const { eventPublisher } = await import('../events/handlers');

    const taskRepo = getTaskRepository();

    try {
      const task = await taskRepo.findById(taskId);

      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      if (status === 'processing' || status === 'pending') {
        // 更新进度
        if (progress !== undefined) {
          await taskRepo.updateProgress(taskId, progress);
          eventPublisher.taskProgress({
            taskId,
            userId: task.userId,
            progress,
            status,
          });
        }
      } else if (status === 'completed') {
        // 标记为完成
        if (resultImageUrls && resultImageTokens) {
          await taskRepo.markAsCompleted(taskId, resultImageUrls, resultImageTokens);
          eventPublisher.taskCompleted({
            taskId,
            userId: task.userId,
            resultImageUrls,
            resultImageTokens,
            duration: Date.now() - task.createdAt.getTime(),
          });
        }
      } else if (status === 'failed') {
        // 标记为失败
        await taskRepo.markAsFailed(taskId, error || 'Unknown error');
        eventPublisher.taskFailed({
          taskId,
          userId: task.userId,
          errorMessage: error || 'Unknown error',
        });
      }
    } catch (error) {
      console.error('[N8n] Failed to handle callback:', error);
      throw error;
    }
  }

  /**
   * 批量触发生成工作流
   */
  async triggerBatchGeneration(requests: GenerationRequest[]): Promise<void> {
    // 并发触发所有工作流
    await Promise.allSettled(requests.map(request => this.triggerGeneration(request)));
  }

  /**
   * 检查工作流健康状态
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.webhookUrl}/health`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * 获取工作流状态
   */
  async getWorkflowStatus(workflowId: string): Promise<{
    status: string;
    progress: number;
    result?: Record<string, unknown>;
  }> {
    try {
      const response = await fetch(`${this.config.webhookUrl}/status/${workflowId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get workflow status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[N8n] Failed to get workflow status:', error);
      throw error;
    }
  }
}

// 创建单例实例
let n8nServiceInstance: N8nService | null = null;

export function getN8nService(): N8nService {
  if (!n8nServiceInstance) {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const apiKey = process.env.N8N_API_KEY;

    if (!webhookUrl || !apiKey) {
      throw new Error('n8n configuration not found');
    }

    n8nServiceInstance = new N8nService({
      webhookUrl,
      apiKey,
    });
  }

  return n8nServiceInstance;
}

/**
 * API路由处理函数 - 接收n8n回调
 */
export async function handleN8nCallback(request: Request) {
  try {
    const body = await request.json();
    const n8nService = getN8nService();

    await n8nService.handleCallback(body);

    return Response.json({ success: true });
  } catch (error) {
    console.error('[API] Failed to handle n8n callback:', error);
    return Response.json({ success: false, error: 'Failed to process callback' }, { status: 500 });
  }
}
