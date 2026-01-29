/**
 * task.service.ts - 任务相关服务
 * 负责任务创建、进度轮询等业务逻辑
 */

import { apiService } from './api.service';
import { ConfigManager } from '../config';
import type { TaskData, ImageModel, WorkMode } from '../types';

export interface CreateTaskParams {
  productName: string;
  prompt: string;
  productImage: File;
  sceneImage?: File | null;
  textModel: string;
  imageModel: ImageModel;
  aspectRatio: '1:1' | '3:4' | '16:9' | '9:16';
  quality: 'standard' | 'high';
  existingTasks: TaskData[];
}

export interface TaskUpdateCallback {
  (update: (prev: TaskData[]) => TaskData[]): void;
}

/**
 * 创建新任务并开始轮询
 */
export async function createTaskAndStartPolling(
  params: CreateTaskParams,
  updateTasks: TaskUpdateCallback
): Promise<void> {
  const {
    productName,
    prompt,
    productImage,
    sceneImage,
    imageModel,
    aspectRatio,
    quality,
    existingTasks,
  } = params;

  // 创建临时任务状态
  const tempTaskId = Date.now().toString();
  const newTask: TaskData = {
    id: tempTaskId,
    productName: productName || `任务${existingTasks.length + 1}`,
    prompt,
    config: {
      textModel: params.textModel as any,
      imageModel,
      aspectRatio,
      imageCount: 1,
      quality,
    },
    status: 'pending',
    progress: 0,
    createdAt: new Date(),
  };

  console.log('新任务已创建:', newTask);
  updateTasks(prev => [newTask, ...prev]);

  try {
    // 1. 上传商品图片
    console.log('上传商品图片...');
    const productImageUrl = await apiService.uploadImage(productImage);
    console.log('商品图片上传成功:', productImageUrl);

    // 2. 上传场景图片（如果有）
    let sceneImageUrl: string | undefined;
    if (sceneImage) {
      console.log('上传场景图片...');
      sceneImageUrl = await apiService.uploadImage(sceneImage);
      console.log('场景图片上传成功:', sceneImageUrl);
    }

    // 3. 调用 API 创建任务
    console.log('调用 API 创建任务...');
    const config = ConfigManager.getConfig();

    const response = await apiService.createTask({
      productImageUrl,
      sceneImageUrl,
      prompt,
      aiModel: imageModel,
      aspectRatio,
      imageCount: 1,
      quality,
      deerApiKey: config.deerApiKey,
      callbackUrl: config.callbackUrl,
    });

    console.log('任务创建成功:', response);

    // 4. 更新任务 ID（使用服务端返回的真实 ID）
    updateTasks(prev =>
      prev.map(t =>
        t.id === tempTaskId ? { ...t, id: response.task.id, status: ('generating' as const) } : t
      )
    );

    // 5. 开始轮询任务进度
    startTaskPolling(response.task.id, updateTasks);
  } catch (error) {
    console.error('任务创建失败:', error);
    const errorMsg = error instanceof Error ? error.message : '未知错误';
    alert(`任务创建失败: ${errorMsg}`);

    // 标记任务失败
    updateTasks(prev =>
      prev.map(t => (t.id === tempTaskId ? { ...t, status: ('failed' as const) } : t))
    );
  }
}

/**
 * 任务进度轮询
 */
export function startTaskPolling(taskId: string, updateTasks: TaskUpdateCallback): NodeJS.Timeout {
  const pollInterval = setInterval(async () => {
    try {
      const response = await apiService.getTask(taskId);
      console.log('任务进度更新:', response);

      updateTasks(prev =>
        prev.map(t =>
          t.id === taskId
            ? {
                ...t,
                status: response.status as TaskData['status'],
                progress: response.status === 'completed' ? 100 : t.progress,
                ...(response.status === 'completed' && {
                  resultImages: [],
                }),
              }
            : t
        )
      );

      // 如果任务完成或失败，停止轮询
      if (response.status === 'completed' || response.status === 'failed') {
        clearInterval(pollInterval);
      }
    } catch (error) {
      console.error('轮询任务进度失败:', error);
    }
  }, 2000);

  // 5 分钟后停止轮询（避免无限轮询）
  setTimeout(() => clearInterval(pollInterval), 5 * 60 * 1000);

  return pollInterval;
}
