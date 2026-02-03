/**
 * 深蓝色科技风主页 - AI电商商拍平台
 * Dark Mode + Future Tech + Bento Grid
 * 集成飞书 Bitable + N8N 工作流
 */

'use client';

import { useCallback, useEffect } from 'react';
import { LoginSettings } from '@/components/login/LoginSettings';
import { ConfigPanel } from '@/components/settings/config-panel';
import { ImagePreview } from '@/components/image-preview';
import { ConfigManager } from '@/lib/config';
import type { TextModel, ImageModel } from '@/lib/types';
import { useBrandConfig } from '@/hooks/use-brand-config';
import { useImageUpload } from '@/hooks/use-image-upload';
import { useCanvasViewMode, type ImageItem, type BatchObject } from '@/hooks/use-canvas-view-mode';
import { useRecordsManagement } from '@/hooks/use-records-management';
import { useTaskGeneration } from '@/hooks/use-task-generation';
import { usePageHandlers, handleLogout, saveLoginConfig } from '@/hooks/use-page-handlers';
import { usePageState } from '@/hooks/use-page-state';
import { PageLayout } from './page/PageLayout';
import { transformTasksToDisplayFormat } from './page/page-data-transformers';

export default function HomePage() {
  // ========== 页面状态管理 ==========
  const { state: pageState, actions: pageActions } = usePageState();

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
      // 重置视图状态，确保显示新生成的图片
      resetView();
      pageActions.setUploadedImage(newRecord.original);
      if (newRecord.sceneImage) {
        setSceneImagePreviewOnly(newRecord.sceneImage);
      }
      pageActions.setGeneratedImage(newRecord.generated);
    },
    onHistoryTasksChange: () => {
      // 可以在这里添加额外逻辑
    },
  });

  // ========== 任务生成 ==========
  const { isGenerating, generateTask } = useTaskGeneration({
    onTaskStart: tempTask => {
      addTask(tempTask);
      pageActions.setActiveTab('web');
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
    pageActions.setUploadedImage(productImagePreview || null);
  }, [productImagePreview, pageActions]);

  const isConfigured = ConfigManager.isConfigured();

  // ========== 事件处理 ==========
  const pageHandlers = usePageHandlers();
  const handleClosePreview = useCallback(() => pageActions.setPreviewImage(null), [pageActions]);

  const handleModeChangeWrapped = useCallback((newMode: 'scene' | 'tryon' | 'wear' | 'combine') => {
    pageHandlers.handleModeChange(newMode, {
      setMode: pageActions.setMode,
      setPrompt: pageActions.setPrompt,
    });
  }, [pageHandlers, pageActions]);

  const handleImageClickWrapped = useCallback(
    (image: ImageItem) => {
      pageHandlers.handleImageClick(image, selectedImages, {
        toggleImageSelection,
        setSingleImage,
        setViewMode,
      });
    },
    [pageHandlers, selectedImages, toggleImageSelection, setSingleImage, setViewMode]
  );

  const handleBatchClickWrapped = useCallback(
    (batch: BatchObject) => {
      pageHandlers.handleBatchClick(batch, {
        setActiveBatch,
        setViewMode,
        clearSelection,
      });
    },
    [pageHandlers, setActiveBatch, setViewMode, clearSelection]
  );

  const handleLogoutWrapped = useCallback(async () => {
    await handleLogout();
  }, []);

  const saveLoginConfigWrapped = useCallback(async (newConfig: typeof pageState.loginConfig) => {
    await saveLoginConfig(
      newConfig,
      config => pageActions.setLoginConfig(config),
      errorMsg => alert(`❌ 保存失败：${errorMsg}`)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageActions]);

  const handleGenerateClick = useCallback(async () => {
    await generateTask({
      mode: pageState.mode,
      prompt: pageState.prompt,
      imageModel: pageState.imageModel,
      aspectRatio: pageState.aspectRatio,
      productImage,
      sceneImage,
      productImagePreview,
    });
  }, [
    pageState,
    productImage,
    sceneImage,
    productImagePreview,
    generateTask,
  ]);

  // ========== 数据转换 ==========
  const displayTasks = transformTasksToDisplayFormat(historyTasks, pageState.textModel, pageState.quality);

  // ========== JSX ==========
  return (
    <PageLayout
      brandConfig={brandConfig}
      onSaveBrandConfig={loadBrandConfig}
      pageState={pageState}
      productImagePreview={productImagePreview}
      sceneImagePreview={sceneImagePreview}
      handleProductUpload={handleProductUpload}
      handleSceneUpload={handleSceneUpload}
      clearProductImage={clearProductImage}
      clearSceneImage={clearSceneImage}
      viewMode={viewMode}
      singleImage={singleImage}
      activeBatch={activeBatch}
      selectedImages={selectedImages}
      resetView={resetView}
      isGenerating={isGenerating}
      isConfigured={isConfigured}
      onLogout={handleLogoutWrapped}
      onConfig={() => pageActions.setShowConfig(true)}
      onLoginSettings={() => pageActions.setShowLoginSettings(true)}
      onModeChange={handleModeChangeWrapped}
      onPromptChange={pageActions.setPrompt}
      onTextModelChange={(model: string) => pageActions.setTextModel(model as TextModel)}
      onImageModelChange={(model: string) => pageActions.setImageModel(model as ImageModel)}
      onAspectRatioChange={pageActions.setAspectRatio}
      onGenerate={handleGenerateClick}
      onImageClick={handleImageClickWrapped}
      onBatchClick={handleBatchClickWrapped}
      onTabChange={pageActions.setActiveTab}
      configPanel={<ConfigPanel onClose={() => pageActions.setShowConfig(false)} onSave={loadBrandConfig} />}
      loginSettings={
        <LoginSettings
          isOpen={pageState.showLoginSettings}
          onClose={() => pageActions.setShowLoginSettings(false)}
          onSave={saveLoginConfigWrapped}
          currentConfig={pageState.loginConfig}
        />
      }
      imagePreview={pageState.previewImage && <ImagePreview src={pageState.previewImage} onClose={handleClosePreview} />}
      displayTasks={displayTasks}
    />
  );
}
