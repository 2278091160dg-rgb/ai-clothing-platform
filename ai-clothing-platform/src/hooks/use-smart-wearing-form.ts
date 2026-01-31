/**
 * useSmartWearingForm - 智能穿戴表单状态和逻辑 Hook
 */

import { useState, useCallback } from 'react';

export interface SmartWearingFormData {
  productImage: string;
  referenceImage: string;
  productDescription: string;
  productType: 'shoes' | 'bag' | 'watch' | 'jewelry' | 'hat' | 'scarf';
  referenceDescription?: string;
  viewType: 'single' | 'multi';
  aiModel: string;
  aspectRatio: '3:4' | '1:1' | '16:9';
}

interface UseSmartWearingFormOptions {
  onSubmit: (data: SmartWearingFormData) => void;
}

interface UseSmartWearingFormReturn {
  formData: SmartWearingFormData;
  setFormData: (data: SmartWearingFormData) => void;
  handleSubmit: () => void;
  handleUpload: (type: 'product' | 'reference') => void;
}

export function useSmartWearingForm(
  options: UseSmartWearingFormOptions
): UseSmartWearingFormReturn {
  const [formData, setFormData] = useState<SmartWearingFormData>({
    productImage: '',
    referenceImage: '',
    productDescription: '',
    productType: 'shoes',
    referenceDescription: '',
    viewType: 'single',
    aiModel: 'Gemini 3.0 Pro',
    aspectRatio: '3:4',
  });

  const handleSubmit = useCallback(() => {
    if (!formData.productImage || !formData.referenceImage || !formData.productDescription) {
      alert('请上传商品图、参考图并填写商品描述');
      return;
    }
    options.onSubmit(formData);
  }, [formData, options]);

  const handleUpload = useCallback((type: 'product' | 'reference') => {
    // TODO: 实现文件上传逻辑
    alert(`上传${type === 'product' ? '商品' : '参考'}图功能待实现`);
  }, []);

  return {
    formData,
    setFormData,
    handleSubmit,
    handleUpload,
  };
}
