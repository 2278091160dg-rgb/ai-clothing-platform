/**
 * usePageState - 主页面状态管理 Hook
 *
 * 统一管理主页面的所有状态，包括：
 * - UI 状态（配置面板、登录设置、预览图片、Tab）
 * - 表单状态（模式、提示词、模型配置）
 * - 主视图状态（上传图片、生成图片）
 */

import { useState } from 'react';
import type { TextModel, ImageModel } from '@/lib/types';
import type { LoginConfig } from '@/config/login-defaults';
import { DEFAULT_LOGIN_CONFIG } from '@/config/login-defaults';
import type { GenerationMode } from '@/components/workspace/params-panel-constants';

export interface PageState {
  // UI 状态
  showConfig: boolean;
  showLoginSettings: boolean;
  previewImage: string | null;
  loginConfig: LoginConfig;
  activeTab: 'web' | 'table';

  // 表单状态
  mode: GenerationMode;
  prompt: string;
  textModel: TextModel;
  imageModel: ImageModel;
  aspectRatio: '1:1' | '3:4' | '16:9' | '9:16';
  quality: 'standard' | 'high';

  // 主视图状态
  uploadedImage: string | null;
  generatedImage: string | null;
}

export interface PageStateActions {
  // UI 状态 actions
  setShowConfig: (show: boolean) => void;
  setShowLoginSettings: (show: boolean) => void;
  setPreviewImage: (image: string | null) => void;
  setLoginConfig: (config: LoginConfig) => void;
  setActiveTab: (tab: 'web' | 'table') => void;

  // 表单状态 actions
  setMode: (mode: GenerationMode) => void;
  setPrompt: (prompt: string) => void;
  setTextModel: (model: TextModel) => void;
  setImageModel: (model: ImageModel) => void;
  setAspectRatio: (ratio: '1:1' | '3:4' | '16:9' | '9:16') => void;

  // 主视图状态 actions
  setUploadedImage: (image: string | null) => void;
  setGeneratedImage: (image: string | null) => void;
}

/**
 * 主页面状态管理 Hook
 */
export function usePageState(): { state: PageState; actions: PageStateActions } {
  // ========== UI 状态 ==========
  const [showConfig, setShowConfig] = useState(false);
  const [showLoginSettings, setShowLoginSettings] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loginConfig, setLoginConfig] = useState<LoginConfig>(DEFAULT_LOGIN_CONFIG);
  const [activeTab, setActiveTab] = useState<'web' | 'table'>('web');

  // ========== 表单状态 ==========
  const [mode, setMode] = useState<GenerationMode>('scene');
  const [prompt, setPrompt] = useState('');
  const [textModel, setTextModel] = useState<TextModel>('gemini-2.0-flash-exp');
  const [imageModel, setImageModel] = useState<ImageModel>('flux-1.1-pro');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '16:9' | '9:16'>('3:4');
  const [quality] = useState<'standard' | 'high'>('high');

  // ========== 主视图状态 ==========
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  return {
    state: {
      showConfig,
      showLoginSettings,
      previewImage,
      loginConfig,
      activeTab,
      mode,
      prompt,
      textModel,
      imageModel,
      aspectRatio,
      quality,
      uploadedImage,
      generatedImage,
    },
    actions: {
      setShowConfig,
      setShowLoginSettings,
      setPreviewImage,
      setLoginConfig,
      setActiveTab,
      setMode,
      setPrompt,
      setTextModel,
      setImageModel,
      setAspectRatio,
      setUploadedImage,
      setGeneratedImage,
    },
  };
}
