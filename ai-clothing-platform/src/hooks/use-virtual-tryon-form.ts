/**
 * useVirtualTryOnForm - 虚拟试穿表单状态和逻辑 Hook
 */

import { useState, useCallback } from 'react';

export interface VirtualTryOnFormData {
  clothingImage: string;
  referenceImage?: string;
  modelImage?: string;
  clothingDescription: string;
  modelDescription?: string;
  sceneDescription?: string;
  tryonMode: 'single' | 'multi';
  aiModel: string;
  aspectRatio: '3:4' | '1:1' | '16:9';
}

interface UseVirtualTryOnFormOptions {
  onSubmit: (data: VirtualTryOnFormData) => void;
}

interface UseVirtualTryOnFormReturn {
  formData: VirtualTryOnFormData;
  setFormData: (data: VirtualTryOnFormData) => void;
  handleSubmit: () => void;
  handleUpload: (type: 'clothing' | 'reference' | 'model') => void;
}

export function useVirtualTryOnForm(
  options: UseVirtualTryOnFormOptions
): UseVirtualTryOnFormReturn {
  const [formData, setFormData] = useState<VirtualTryOnFormData>({
    clothingImage: '',
    referenceImage: '',
    modelImage: '',
    clothingDescription: '',
    modelDescription: '',
    sceneDescription: '',
    tryonMode: 'single',
    aiModel: 'Gemini 3.0 Pro',
    aspectRatio: '3:4',
  });

  const handleSubmit = useCallback(() => {
    if (!formData.clothingImage || !formData.clothingDescription) {
      alert('请上传服装图并填写服装描述');
      return;
    }
    options.onSubmit(formData);
  }, [formData, options]);

  const handleUpload = useCallback((type: 'clothing' | 'reference' | 'model') => {
    // TODO: 实现文件上传逻辑
    alert(
      `上传${type === 'clothing' ? '服装' : type === 'reference' ? '参考' : '模特'}图功能待实现`
    );
  }, []);

  return {
    formData,
    setFormData,
    handleSubmit,
    handleUpload,
  };
}
