/**
 * useFreeCombinationForm - 自由搭配表单状态和逻辑 Hook
 */

import { useState, useCallback } from 'react';

export interface FreeCombinationFormData {
  materials: string[];
  combinationCount: number;
  modelType?: 'any' | 'adult' | 'child' | 'male' | 'female';
  stylePreference?: 'casual' | 'formal' | 'sporty' | 'elegant' | 'minimalist';
  aiModel: string;
}

interface UseFreeCombinationFormOptions {
  onSubmit: (data: FreeCombinationFormData) => void;
}

interface UseFreeCombinationFormReturn {
  formData: FreeCombinationFormData;
  setFormData: (data: FreeCombinationFormData) => void;
  handleSubmit: () => void;
  handleUpload: (index: number) => void;
}

export function useFreeCombinationForm(
  options: UseFreeCombinationFormOptions
): UseFreeCombinationFormReturn {
  const [formData, setFormData] = useState<FreeCombinationFormData>({
    materials: [],
    combinationCount: 4,
    modelType: 'any',
    stylePreference: 'casual',
    aiModel: 'Gemini 3.0 Pro',
  });

  const handleSubmit = useCallback(() => {
    if (formData.materials.length === 0) {
      alert('请上传至少1张素材图');
      return;
    }
    options.onSubmit(formData);
  }, [formData, options]);

  const handleUpload = useCallback((index: number) => {
    // TODO: 实现文件上传逻辑
    alert(`上传素材${index + 1}功能待实现`);
  }, []);

  return {
    formData,
    setFormData,
    handleSubmit,
    handleUpload,
  };
}
