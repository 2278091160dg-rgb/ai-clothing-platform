/**
 * Event Handlers - 双轨工作流版本
 * 集成飞书同步的事件发布器
 */

import { getEventBus } from './event-bus';

/**
 * 事件发布器
 * 发布任务相关事件到事件总线
 */
export const eventPublisher = {
  /**
   * 任务创建事件
   * 触发飞书记录创建
   */
  taskCreated: async (data: {
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
    console.log('[Event] Task created:', data.taskId);
    const eventBus = getEventBus();
    await eventBus.emitAsync('task.created', data);
  },

  /**
   *任务失败事件
   * 同步失败状态到飞书
   */
  taskFailed: async (data: { taskId: string; userId: string; errorMessage: string }) => {
    console.log('[Event] Task failed:', data.taskId);
    const eventBus = getEventBus();
    await eventBus.emitAsync('task.failed', data);
  },

  /**
   * 任务完成事件
   * 同步结果到飞书
   */
  taskCompleted: async (data: {
    taskId: string;
    userId: string;
    resultImageUrls: string[];
    resultImageTokens: string[];
    duration: number;
  }) => {
    console.log('[Event] Task completed:', data.taskId);
    const eventBus = getEventBus();
    await eventBus.emitAsync('task.completed', data);
  },

  /**
   * 任务进度更新事件
   * 同步进度到飞书
   */
  taskProgress: async (data: {
    taskId: string;
    userId: string;
    progress: number;
    status: string;
  }) => {
    console.log('[Event] Task progress:', data.taskId, data.progress);
    const eventBus = getEventBus();
    await eventBus.emitAsync('task.progress', data);
  },
};

// 导出事件总线获取函数
export { getEventBus } from './event-bus';
