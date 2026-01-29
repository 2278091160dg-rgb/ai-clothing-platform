import { create } from 'zustand';
import { ImageFile, GenerationParams, GenerationResult } from '../types';

interface AppState {
  // 表单状态
  params: GenerationParams;
  setProductImage: (image: ImageFile | null) => void;
  setSceneImage: (image: ImageFile | null) => void;
  setPrompt: (prompt: string) => void;
  setAspectRatio: (ratio: '3:4' | '1:1' | '16:9') => void;

  // 生成状态
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;

  // 结果状态
  currentResult: GenerationResult | null;
  setCurrentResult: (result: GenerationResult | null) => void;

  // 历史记录
  history: GenerationResult[];
  addHistory: (result: GenerationResult) => void;

  // 设置
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;

  // 重置表单
  resetForm: () => void;
}

const initialParams: GenerationParams = {
  productImage: null,
  sceneImage: null,
  prompt: '',
  aspectRatio: '3:4',
};

export const useAppStore = create<AppState>((set) => ({
  params: initialParams,
  isGenerating: false,
  currentResult: null,
  history: [],
  settingsOpen: false,

  setProductImage: (image) =>
    set((state) => ({
      params: { ...state.params, productImage: image },
    })),

  setSceneImage: (image) =>
    set((state) => ({
      params: { ...state.params, sceneImage: image },
    })),

  setPrompt: (prompt) =>
    set((state) => ({
      params: { ...state.params, prompt },
    })),

  setAspectRatio: (aspectRatio) =>
    set((state) => ({
      params: { ...state.params, aspectRatio },
    })),

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  setCurrentResult: (currentResult) => set({ currentResult }),

  addHistory: (result) =>
    set((state) => ({
      history: [result, ...state.history].slice(0, 10), // 保留最近10条
    })),

  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),

  resetForm: () =>
    set({
      params: initialParams,
      currentResult: null,
    }),
}));
