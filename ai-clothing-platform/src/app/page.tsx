/**
 * 深蓝色科技风主页 - AI电商商拍平台
 * Dark Mode + Future Tech + Bento Grid
 * 集成飞书 Bitable + N8N 工作流
 *
 * 拆分后结构：
 * - useRecordsManagement: 记录管理 Hook
 * - useTaskGeneration: 任务生成 Hook
 * - LoadingAnimation: 加载动画组件
 * - BeforeImagesPanel: 输入图片列组件
 * - MainContentRenderer: 主内容渲染组件
 * - page-data-transformers: 数据转换工具
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { LoginSettings } from '@/components/login/LoginSettings';
import { ConfigPanel } from '@/components/settings/config-panel';
import { ImagePreview } from '@/components/image-preview';
import { Toaster } from '@/components/ui/toaster';
import { ConfigManager } from '@/lib/config';
import { DEFAULT_LOGIN_CONFIG, type LoginConfig } from '@/config/login-defaults';
import type { TextModel, ImageModel } from '@/lib/types';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { UploadPanel } from '@/components/workspace/UploadPanel';
import { ParamsPanel } from '@/components/workspace/ParamsPanel';
import { SidebarTabs } from '@/components/workspace/SidebarTabs';
import { useBrandConfig } from '@/hooks/use-brand-config';
import { useImageUpload } from '@/hooks/use-image-upload';
import { useCanvasViewMode, type ImageItem, type BatchObject } from '@/hooks/use-canvas-view-mode';
import { useRecordsManagement } from '@/hooks/use-records-management';
import { useTaskGeneration } from '@/hooks/use-task-generation';
import { LoadingAnimation } from '@/components/workspace/LoadingAnimation';
import { MainContentRenderer } from './page/MainContentRenderer';
import { transformTasksToDisplayFormat } from './page/page-data-transformers';

export default function HomePage() {
  // ========== UI 状态 ==========
  const [showConfig, setShowConfig] = useState(false);
  const [showLoginSettings, setShowLoginSettings] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loginConfig, setLoginConfig] = useState<LoginConfig>(DEFAULT_LOGIN_CONFIG);
  const [activeTab, setActiveTab] = useState<'web' | 'table'>('web');

  // ========== 表单状态 ==========
  const [mode, setMode] = useState<'scene' | 'tryon' | 'wear' | 'combine'>('scene');
  const [prompt, setPrompt] = useState('');
  const [textModel, setTextModel] = useState<TextModel>('gemini-2.0-flash-exp');
  const [imageModel, setImageModel] = useState<ImageModel>('flux-1.1-pro');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '16:9' | '9:16'>('3:4');
  const [quality] = useState<'standard' | 'high'>('high');

  // ========== 主视图状态 ==========
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // ========== 自定义 hooks ==========
  const { brandConfig, loadBrandConfig } = useBrandConfig();
  const {
    productImage,
    productImagePreview,
    sceneImage,
    sceneImagePreview,
    handleProductUpload,
    handleSceneUpload,
    clearProductImage,
    clearSceneImage,
    setSceneImagePreviewOnly,
  } = useImageUpload();

  const {
    viewMode,
    setViewMode,
    singleImage,
    setSingleImage,
    activeBatch,
    setActiveBatch,
    selectedImages,
    toggleImageSelection,
    clearSelection,
    resetView,
  } = useCanvasViewMode();

  // ========== 记录管理 ==========
  const { historyTasks, fetchRecords, addTask } = useRecordsManagement({
    onNewCompletedTask: (completedTask, newRecord) => {
      console.log('✅ 新任务完成:', completedTask);
      setUploadedImage(newRecord.original);
      if (newRecord.sceneImage) {
        setSceneImagePreviewOnly(newRecord.sceneImage);
      }
      setGeneratedImage(newRecord.generated);
    },
    onHistoryTasksChange: () => {
      // 可以在这里添加额外逻辑
    },
  });

  // ========== 任务生成 ==========
  const { isGenerating, generateTask } = useTaskGeneration({
    onTaskStart: tempTask => {
      addTask(tempTask);
      setActiveTab('web');
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onTaskSuccess: (_recordId, _tempId) => {
      // 更新临时任务的 recordId
      fetchRecords();
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onTaskError: (tempId, _error) => {
      // Task removal will be handled by fetchRecords
      fetchRecords();
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onTaskComplete: _recordId => {
      // Task completion handled by useRecordsManagement
    },
  });

  // ========== 同步状态 ==========
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUploadedImage(productImagePreview || null);
  }, [productImagePreview]);

  const isConfigured = ConfigManager.isConfigured();

  // ========== 事件处理 ==========
  const handleClosePreview = useCallback(() => setPreviewImage(null), []);

  const handleModeChange = useCallback((newMode: 'scene' | 'tryon' | 'wear' | 'combine') => {
    setMode(newMode);
    setPrompt('');
  }, []);

  const handleImageClick = useCallback(
    (image: ImageItem) => {
      const isSelected = selectedImages.some(img => img.id === image.id);
      toggleImageSelection(image);

      if (!isSelected) {
        setSingleImage(image);
        setViewMode('single');
      } else if (selectedImages.length <= 1) {
        setViewMode('single');
      }
    },
    [selectedImages, toggleImageSelection, setSingleImage, setViewMode]
  );

  const handleBatchClick = useCallback(
    (batch: BatchObject) => {
      setActiveBatch(batch);
      setViewMode('grid');
      clearSelection();
    },
    [setActiveBatch, setViewMode, clearSelection]
  );

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
    await generateTask({
      mode,
      prompt,
      imageModel,
      aspectRatio,
      productImage,
      sceneImage,
      productImagePreview,
    });
  }, [
    mode,
    prompt,
    imageModel,
    aspectRatio,
    productImage,
    sceneImage,
    productImagePreview,
    generateTask,
  ]);

  // ========== 数据转换 ==========
  const displayTasks = transformTasksToDisplayFormat(historyTasks, textModel, quality);

  // ========== JSX ==========
  return (
    <div className="min-h-screen bg-grid-pattern">
      <Toaster />

      {/* 顶部导航栏 */}
      <WorkspaceHeader
        brandConfig={brandConfig}
        onLoginSettings={() => setShowLoginSettings(true)}
        onConfig={() => setShowConfig(true)}
        onLogout={handleLogout}
        userInitial="D"
      />

      {/* 主内容区 - Bento Grid 布局 */}
      <main className="p-6 overflow-hidden h-[calc(100vh-64px)] relative">
        <div className="flex gap-5 h-full">
          {/* 左侧栏 - 参数区域 */}
          <div className="w-[360px] flex-shrink-0 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-3 pb-3">
              <UploadPanel
                mode={mode}
                productImage={productImage}
                productImagePreview={productImagePreview}
                sceneImage={sceneImage}
                sceneImagePreview={sceneImagePreview}
                onProductUpload={handleProductUpload}
                onSceneUpload={handleSceneUpload}
                onProductClear={clearProductImage}
                onSceneClear={clearSceneImage}
              />
              <ParamsPanel
                mode={mode}
                onModeChange={handleModeChange}
                prompt={prompt}
                textModel={textModel}
                imageModel={imageModel}
                aspectRatio={aspectRatio}
                quality={quality}
                onPromptChange={setPrompt}
                onTextModelChange={setTextModel}
                onImageModelChange={setImageModel}
                onAspectRatioChange={setAspectRatio}
                onGenerate={handleGenerateClick}
                isConfigured={isConfigured}
                isGenerating={isGenerating}
              />
              {isGenerating && <LoadingAnimation isGenerating={isGenerating} />}
            </div>
          </div>

          {/* 中间栏 - 结果展示 */}
          <div className="flex-1 flex flex-col">
            <MainContentRenderer
              viewMode={viewMode}
              singleImage={singleImage}
              generatedImage={generatedImage}
              uploadedImage={uploadedImage}
              sceneImagePreview={sceneImagePreview}
              aspectRatio={aspectRatio}
              activeBatch={activeBatch}
              selectedImages={selectedImages}
              resetView={resetView}
            />
          </div>

          {/* 右侧栏 - 历史记录 */}
          <div className="w-[300px] flex flex-col">
            <SidebarTabs
              tasks={displayTasks}
              onImageClick={handleImageClick}
              onBatchClick={handleBatchClick}
              selectedImageIds={selectedImages.map(img => img.id)}
              activeTab={activeTab}
              onTabChange={setActiveTab}
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
