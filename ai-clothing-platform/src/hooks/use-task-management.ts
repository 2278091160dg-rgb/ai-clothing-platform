/**
 * useTaskManagement - 任务管理 Hook
 */

import { useState, useCallback } from 'react';
import { ConfigManager } from '@/lib/config';
import { createTaskAndStartPolling } from '@/lib/services/task.service';
import type { TaskData, ImageModel, TextModel } from '@/lib/types';

export function useTaskManagement() {
  const [tasks, setTasks] = useState<TaskData[]>([]);

  const handleGenerate = useCallback(
    async (
      mode: 'scene' | 'tryon' | 'wear' | 'combine',
      productName: string,
      prompt: string,
      negativePrompt: string,
      productImage: File | null,
      sceneImage: File | null,
      textModel: TextModel,
      imageModel: ImageModel,
      aspectRatio: '1:1' | '3:4' | '16:9' | '9:16',
      quality: 'standard' | 'high',
      resetForm: () => void
    ) => {
      const isConfigured = ConfigManager.isConfigured();

      console.log('生成按钮被点击', {
        isConfigured,
        productImage: !!productImage,
        prompt,
        negativePrompt,
      });

      if (!isConfigured) {
        console.log('API未配置，打开配置面板');
        return { needConfig: true };
      }

      if (!productImage || !prompt) {
        alert('请上传商品图片并输入提示词');
        return { needConfig: false };
      }

      console.log('开始创建新任务');

      await createTaskAndStartPolling(
        {
          mode,
          productName,
          prompt,
          negativePrompt,
          productImage,
          sceneImage,
          textModel,
          imageModel,
          aspectRatio,
          quality,
          existingTasks: tasks,
        },
        setTasks
      );

      // 重置表单
      resetForm();

      return { needConfig: false };
    },
    [tasks]
  );

  const handleClearHistory = useCallback(() => {
    if (confirm('确定要清空所有历史记录吗？')) {
      setTasks([]);
    }
  }, []);

  return {
    tasks,
    setTasks,
    handleGenerate,
    handleClearHistory,
  };
}
