/**
 * Feishu Event Listeners
 * 飞书事件监听器 - 处理任务事件并同步到飞书
 * 包含断路器保护和降级策略
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { getEventBus } from './event-bus';
import { getFeishuService } from '../services/feishu.service';
import { getTaskRepository } from '../repositories/task.repository';
import { createFeishuCircuitBreaker } from '../utils/resilience';

// 创建飞书断路器（单例）
const feishuCircuitBreaker = createFeishuCircuitBreaker();

/**
 * 初始化飞书事件监听器
 * 在应用启动时调用一次
 */
export function initializeFeishuListeners(): void {
  const eventBus = getEventBus();
  const feishuService = getFeishuService();
  const taskRepo = getTaskRepository();

  /**
   * 监听任务创建事件
   * 1. 在飞书创建记录
   * 2. 更新任务的 feishuRecordId
   */
  eventBus.on(
    'task.created',
    async (data: {
      taskId: string;
      userId: string;
      data: {
        productImageUrl: string;
        sceneImageUrl?: string;
        prompt: string;
        aiModel: string;
        aspectRatio: string;
        imageCount: number;
        quality: string;
      };
    }) => {
      try {
        console.log('[FeishuListener] Creating record for task:', data.taskId);

        // 从 URL 中提取 file token（假设是飞书 URL 格式）
        const extractToken = (url: string): string => {
          const match = url.match(/\/files\/([^/?]+)/);
          return match ? match[1] : '';
        };

        const productImageToken = extractToken(data.data.productImageUrl);
        const sceneImageToken = data.data.sceneImageUrl
          ? extractToken(data.data.sceneImageUrl)
          : undefined;

        // 使用断路器保护飞书调用
        const record = await feishuCircuitBreaker.execute(async () => {
          return await feishuService.createTaskRecord({
            userId: data.userId,
            productImageToken,
            sceneImageToken,
            prompt: data.data.prompt,
            aiModel: data.data.aiModel,
            aspectRatio: data.data.aspectRatio,
            imageCount: data.data.imageCount,
            quality: data.data.quality,
          });
        });

        // 更新任务的 feishuRecordId
        await taskRepo.update(data.taskId, {
          feishuRecordId: record.record_id,
          feishuAppToken: process.env.FEISHU_BITABLE_APP_TOKEN,
          feishuTableId: process.env.FEISHU_BITABLE_TABLE_ID,
        });

        console.log('[FeishuListener] ✅ Record created and linked:', record.record_id);
      } catch (error) {
        console.error('[FeishuListener] ❌ Failed to sync task creation:', error);
        // 不抛出错误，避免阻塞主流程
        recordSyncFailure('task.created', data.taskId, error);
      }
    }
  );

  /**
   * 监听任务完成事件
   * 更新飞书记录的状态和结果
   */
  eventBus.on(
    'task.completed',
    async (data: {
      taskId: string;
      userId: string;
      resultImageUrls: string[];
      resultImageTokens: string[];
      duration: number;
    }) => {
      try {
        console.log('[FeishuListener] Updating completed task:', data.taskId);

        const task = await taskRepo.findById(data.taskId);

        if (!task?.feishuRecordId) {
          console.log('[FeishuListener] No feishuRecordId, skipping sync');
          return;
        }

        // 使用断路器保护飞书调用
        await feishuCircuitBreaker.execute(async () => {
          return await feishuService.updateTaskRecord(task.feishuRecordId!, {
            status: 'Completed',
            resultImages: data.resultImageTokens,
          });
        });

        console.log('[FeishuListener] ✅ Record updated:', task.feishuRecordId);
      } catch (error) {
        console.error('[FeishuListener] ❌ Failed to sync task completion:', error);
        recordSyncFailure('task.completed', data.taskId, error);
      }
    }
  );

  /**
   * 监听任务失败事件
   * 更新飞书记录的状态和错误信息
   */
  eventBus.on(
    'task.failed',
    async (data: { taskId: string; userId: string; errorMessage: string }) => {
      try {
        console.log('[FeishuListener] Updating failed task:', data.taskId);

        const task = await taskRepo.findById(data.taskId);

        if (!task?.feishuRecordId) {
          console.log('[FeishuListener] No feishuRecordId, skipping sync');
          return;
        }

        // 使用断路器保护飞书调用
        await feishuCircuitBreaker.execute(async () => {
          return await feishuService.updateTaskRecord(task.feishuRecordId!, {
            status: 'Failed',
            errorMessage: data.errorMessage,
          });
        });

        console.log('[FeishuListener] ✅ Record updated:', task.feishuRecordId);
      } catch (error) {
        console.error('[FeishuListener] ❌ Failed to sync task failure:', error);
        recordSyncFailure('task.failed', data.taskId, error);
      }
    }
  );

  /**
   * 监听任务进度事件
   * 更新飞书记录的进度
   */
  eventBus.on(
    'task.progress',
    async (data: { taskId: string; userId: string; progress: number; status: string }) => {
      try {
        const task = await taskRepo.findById(data.taskId);

        if (!task?.feishuRecordId) {
          return;
        }

        // 使用断路器保护飞书调用（带降级）
        await feishuCircuitBreaker.execute(async () => {
          return await feishuService.updateTaskRecord(task.feishuRecordId!, {
            progress: data.progress,
          });
        });

        console.log('[FeishuListener] Progress updated:', data.progress);
      } catch (_error) {
        // 进度更新失败不记录日志（避免日志过多）
        // 仅在断路器打开时记录
        const state = feishuCircuitBreaker.getState();
        if (state.state === 'open') {
          console.warn('[FeishuListener] Circuit breaker is OPEN, skipping progress updates');
        }
      }
    }
  );

  console.log('[FeishuListener] ✅ All listeners registered');
}

/**
 * 记录同步失败（用于监控和告警）
 */
function recordSyncFailure(event: string, taskId: string, error: unknown): void {
  // 这里可以集成监控服务（如 Sentry、DataDog 等）
  console.error('[FeishuListener] Sync failure:', {
    event,
    taskId,
    error: (error as Error).message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 确保监听器只初始化一次
 */
let initialized = false;

export function ensureFeishuListenersInitialized(): void {
  if (!initialized) {
    initializeFeishuListeners();
    initialized = true;
  }
}

/**
 * 导出断路器状态（用于监控）
 */
export function getFeishuCircuitBreakerState() {
  return feishuCircuitBreaker.getState();
}
