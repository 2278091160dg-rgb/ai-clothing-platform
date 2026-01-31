/**
 * useSceneForm - 场景生图表单状态和逻辑 Hook
 */

import { useState, useCallback } from 'react';

export interface SceneFormData {
  productImage: string;
  sceneImage?: string;
  prompt: string;
  aspectRatio: '3:4' | '1:1' | '16:9';
  aiModel: string;
}

interface UseSceneFormOptions {
  onSubmit: (data: SceneFormData) => void;
  onAIOptimize?: () => void;
}

interface UseSceneFormReturn {
  formData: SceneFormData;
  setFormData: (data: SceneFormData) => void;
  handleSubmit: () => void;
  handleUpload: (type: 'product' | 'scene') => void;
  handleAIOptimize: () => void;
}

export function useSceneForm(options: UseSceneFormOptions): UseSceneFormReturn {
  const [formData, setFormData] = useState<SceneFormData>({
    productImage: '',
    sceneImage: '',
    prompt: '',
    aspectRatio: '3:4',
    aiModel: 'Gemini 3.0 Pro',
  });

  const handleSubmit = useCallback(() => {
    if (!formData.productImage || !formData.prompt) {
      alert('请上传商品图片并填写提示词');
      return;
    }
    options.onSubmit(formData);
  }, [formData, options]);

  const handleUpload = useCallback((type: 'product' | 'scene') => {
    // TODO: 实现文件上传逻辑
    alert(`上传${type === 'product' ? '商品' : '场景'}图功能待实现`);
  }, []);

  const handleAIOptimize = useCallback(() => {
    // TODO: 打开AI对话优化弹窗
    if (options.onAIOptimize) {
      options.onAIOptimize();
    } else {
      alert('AI对话优化功能待实现');
    }
  }, [options]);

  return {
    formData,
    setFormData,
    handleSubmit,
    handleUpload,
    handleAIOptimize,
  };
}
