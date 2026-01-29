/**
 * 深蓝色科技风主页 - AI电商商拍平台
 * Dark Mode + Future Tech + Bento Grid
 */

'use client';

import { useState, useCallback } from 'react';
import { LoginSettings } from '@/components/login/LoginSettings';
import { ConfigPanel } from '@/components/settings/config-panel';
import { ImagePreview } from '@/components/image-preview';
import { ConfigManager } from '@/lib/config';
import { DEFAULT_LOGIN_CONFIG, type LoginConfig } from '@/config/login-defaults';
import type { TextModel, ImageModel } from '@/lib/types';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { UploadPanel } from '@/components/workspace/UploadPanel';
import { ParamsPanel } from '@/components/workspace/ParamsPanel';
import { ResultPanel } from '@/components/workspace/ResultPanel';
import { TaskHistoryPanel } from '@/components/workspace/TaskHistoryPanel';
import { StatsPanel } from '@/components/workspace/StatsPanel';
import { useBrandConfig } from '@/hooks/use-brand-config';
import { useImageUpload } from '@/hooks/use-image-upload';
import { useTaskManagement } from '@/hooks/use-task-management';

export default function HomePage() {
  // UI 状态
  const [showConfig, setShowConfig] = useState(false);
  const [showLoginSettings, setShowLoginSettings] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loginConfig, setLoginConfig] = useState<LoginConfig>(DEFAULT_LOGIN_CONFIG);

  // 表单状态
  const [mode, setMode] = useState<'scene' | 'tryon' | 'wear' | 'combine'>('scene');
  const [productName, setProductName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [textModel, setTextModel] = useState<TextModel>('gemini-2.0-flash-exp');
  const [imageModel, setImageModel] = useState<ImageModel>('flux-1.1-pro');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '16:9' | '9:16'>('3:4');
  const [quality] = useState<'standard' | 'high'>('high');

  // 模式切换处理 - 清空提示词，保留其他通用参数
  const handleModeChange = useCallback((newMode: 'scene' | 'tryon' | 'wear' | 'combine') => {
    setMode(newMode);
    setPrompt(''); // 清空提示词，因为不同模式需要不同的提示词内容
  }, []);

  // 自定义 hooks
  const { brandConfig, loadBrandConfig } = useBrandConfig();
  const {
    productImage,
    productImagePreview,
    sceneImage,
    sceneImagePreview,
    handleProductUpload,
    handleSceneUpload,
    resetImages,
  } = useImageUpload();
  const { tasks, handleGenerate, handleClearHistory } = useTaskManagement();

  const isConfigured = ConfigManager.isConfigured();

  // 事件处理
  const handlePreviewImage = useCallback((src: string) => setPreviewImage(src), []);
  const handleClosePreview = useCallback(() => setPreviewImage(null), []);

  const handleLogout = async () => {
    if (confirm('确定要退出登录吗？')) {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (error) {
        console.error('登出失败:', error);
      }
      window.location.href = '/login';
    }
  };

  const saveLoginConfig = async (newConfig: LoginConfig) => {
    try {
      const res = await fetch('/api/login-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.details || data.error || '保存失败，请重试';
        console.error('Save failed:', errorMsg);
        alert(`❌ 保存失败：${errorMsg}`);
        return;
      }

      setLoginConfig(data.data);
      alert(`✅ ${data.message || '登录页面配置已保存成功！'}`);
    } catch (error) {
      console.error('Save login config error:', error);
      alert(
        `❌ 保存配置失败：${error instanceof Error ? error.message : '未知错误'}\n\n请检查网络连接或稍后重试。`
      );
    }
  };

  const handleGenerateClick = useCallback(async () => {
    const resetForm = () => {
      setProductName('');
      setPrompt('');
      setNegativePrompt('');
      resetImages();
    };

    const result = await handleGenerate(
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
      resetForm
    );

    if (result?.needConfig) {
      setShowConfig(true);
    }
  }, [
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
    handleGenerate,
    resetImages,
  ]);

  return (
    <div className="min-h-screen bg-grid-pattern">
      {/* 顶部导航栏 */}
      <WorkspaceHeader
        brandConfig={brandConfig}
        onLoginSettings={() => setShowLoginSettings(true)}
        onConfig={() => setShowConfig(true)}
        onLogout={handleLogout}
        userInitial="D"
      />

      {/* 主内容区 - Bento Grid 布局 */}
      <main className="p-6 h-[calc(100vh-64px)] overflow-hidden">
        <div className="flex gap-5 h-full">
          {/* 左侧栏 - 紧凑配置面板 */}
          <div className="w-[360px] flex-shrink-0 flex flex-col gap-3">
            <UploadPanel
              mode={mode}
              productImage={productImage}
              productImagePreview={productImagePreview}
              sceneImage={sceneImage}
              sceneImagePreview={sceneImagePreview}
              onProductUpload={handleProductUpload}
              onSceneUpload={handleSceneUpload}
            />
            <ParamsPanel
              mode={mode}
              onModeChange={handleModeChange}
              prompt={prompt}
              productName={productName}
              textModel={textModel}
              imageModel={imageModel}
              aspectRatio={aspectRatio}
              quality={quality}
              onPromptChange={setPrompt}
              onProductNameChange={setProductName}
              onTextModelChange={setTextModel}
              onImageModelChange={setImageModel}
              onAspectRatioChange={setAspectRatio}
              onGenerate={handleGenerateClick}
              isConfigured={isConfigured}
              negativePrompt={negativePrompt}
              onNegativePromptChange={setNegativePrompt}
            />
          </div>

          {/* 中间栏 - 结果展示 */}
          <div className="flex-1 flex flex-col gap-4">
            <ResultPanel tasks={tasks} imageModel={imageModel} />
          </div>

          {/* 右侧栏 - 历史记录 */}
          <div className="w-[300px] flex flex-col gap-4">
            <StatsPanel tasks={tasks} />
            <TaskHistoryPanel
              tasks={tasks}
              onPreview={handlePreviewImage}
              onClearHistory={handleClearHistory}
            />
          </div>
        </div>
      </main>

      {/* 配置面板 */}
      {showConfig && <ConfigPanel onClose={() => setShowConfig(false)} onSave={loadBrandConfig} />}

      {/* 登录页面设置模态框 */}
      <LoginSettings
        isOpen={showLoginSettings}
        onClose={() => setShowLoginSettings(false)}
        onSave={saveLoginConfig}
        currentConfig={loginConfig}
      />

      {/* 图片预览模态框 */}
      {previewImage && <ImagePreview src={previewImage} onClose={handleClosePreview} />}
    </div>
  );
}
