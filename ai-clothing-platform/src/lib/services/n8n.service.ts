/**
 * N8nService - n8n工作流集成服务
 * 负责与n8n工作流引擎通信
 */

import type { N8nConfig, GenerationRequest, N8nCallback } from './n8n/n8n.types';

export class N8nService {
  private config: N8nConfig;

  constructor(config: N8nConfig) {
    this.config = config;
  }

  async triggerGeneration(request: GenerationRequest): Promise<void> {
    const callbackUrl =
      request.callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/n8n/callback`;

    const payload = {
      ...request,
      apiKey: this.config.apiKey,
      callbackUrl,
      deerApiKey: request.deerApiKey || '',
    };

    try {
      console.log('[N8n] Triggering workflow:', {
        url: this.config.webhookUrl,
        taskId: request.taskId,
        callbackUrl,
      });

      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('[N8n] Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[N8n] Webhook error response:', errorText);
        throw new Error(`n8n webhook failed: ${response.statusText} - ${errorText}`);
      }

      const text = await response.text();
      if (!text || text.trim() === '') {
        console.log('[N8n] ✅ Webhook accepted (empty response - fire-and-forget mode)');
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error('[N8n] Failed to parse response:', text);
        throw new Error(`n8n returned invalid JSON: ${text.substring(0, 200)}`);
      }

      if (!data.success) {
        throw new Error(`n8n workflow error: ${data.error || 'Unknown error'}`);
      }

      console.log('[N8n] ✅ Workflow triggered successfully:', data);
    } catch (error) {
      console.error('[N8n] ❌ Failed to trigger generation:', error);
      throw error;
    }
  }

  async handleCallback(callback: N8nCallback): Promise<void> {
    const { taskId, status, resultImageUrls, resultImageTokens, error, progress } = callback;

    const { getTaskRepository } = await import('../repositories/task.repository');
    const { eventPublisher } = await import('../events/handlers');

    const taskRepo = getTaskRepository();

    try {
      const task = await taskRepo.findById(taskId);
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      if (status === 'processing' || status === 'pending') {
        if (progress !== undefined) {
          await taskRepo.updateProgress(taskId, progress);
          eventPublisher.taskProgress({ taskId, userId: task.userId, progress, status });
        }
      } else if (status === 'completed') {
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

  async triggerBatchGeneration(requests: GenerationRequest[]): Promise<void> {
    await Promise.allSettled(requests.map(request => this.triggerGeneration(request)));
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.webhookUrl}/health`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.config.apiKey}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getWorkflowStatus(workflowId: string): Promise<{
    status: string;
    progress: number;
    result?: Record<string, unknown>;
  }> {
    try {
      const response = await fetch(`${this.config.webhookUrl}/status/${workflowId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.config.apiKey}` },
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

let n8nServiceInstance: N8nService | null = null;

export function getN8nService(): N8nService {
  if (!n8nServiceInstance) {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const apiKey = process.env.N8N_API_KEY;

    if (!webhookUrl || !apiKey) {
      throw new Error('n8n configuration not found');
    }

    n8nServiceInstance = new N8nService({ webhookUrl, apiKey });
  }

  return n8nServiceInstance;
}

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

export type { GenerationRequest, GenerationStatus, N8nCallback } from './n8n/n8n.types';
