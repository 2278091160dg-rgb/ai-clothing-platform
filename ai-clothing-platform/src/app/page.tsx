'use client';

import { useCallback, useEffect, useMemo } from 'react';
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
  const { state: pageState, actions: pageActions } = usePageState();
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

  const { viewMode, setViewMode, singleImage, setSingleImage, activeBatch, setActiveBatch, selectedImages, toggleImageSelection, clearSelection, resetView } = useCanvasViewMode();

  const { historyTasks, fetchRecords, addTask, hideTask, unhideTask, hiddenTaskIds } =
    useRecordsManagement({
      onNewCompletedTask: (completedTask, newRecord) => {
        console.log('✅ 新任务完成:', completedTask);
        // 重置视图状态，确保显示新生成的图片
        resetView();
        pageActions.setUploadedImage(newRecord.original);
        if (newRecord.sceneImage) {
          setSceneImagePreviewOnly(newRecord.sceneImage);
        }
        pageActions.setGeneratedImage(newRecord.generated);
        // 立即清除生成状态，这样中间区域会显示结果而不是加载动画
        clearPendingTask();
      },
      onHistoryTasksChange: () => {
        // 可以在这里添加额外逻辑
      },
    });

  // ========== 任务生成 ==========
  const { isGenerating, generateTask, clearPendingTask } = useTaskGeneration({
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

  const handleModeChangeWrapped = useCallback(
    (newMode: 'scene' | 'tryon' | 'wear' | 'combine') => {
      pageHandlers.handleModeChange(newMode, {
        setMode: pageActions.setMode,
        setPrompt: pageActions.setPrompt,
      });
    },
    [pageHandlers, pageActions]
  );

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

  const saveLoginConfigWrapped = useCallback(
    async (newConfig: typeof pageState.loginConfig) => {
      await saveLoginConfig(
        newConfig,
        config => pageActions.setLoginConfig(config),
        errorMsg => alert(`❌ 保存失败：${errorMsg}`)
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageActions]
  );

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
    pageState.mode,
    pageState.prompt,
    pageState.imageModel,
    pageState.aspectRatio,
    productImage,
    sceneImage,
    productImagePreview,
    generateTask,
  ]);

  // ========== 数据转换 ==========
  const displayTasks = useMemo(
    () => transformTasksToDisplayFormat(historyTasks, pageState.textModel, pageState.quality),
    [historyTasks, pageState.textModel, pageState.quality]
  );

  // ========== 隐藏/显示任务 ==========
  const handleHideTask = useCallback(
    (taskId: string) => {
      hideTask(taskId);
      console.log('👁️ 隐藏任务:', taskId);
    },
    [hideTask]
  );

  const handleUnhideTask = useCallback(
    (taskId: string) => {
      unhideTask(taskId);
      console.log('👁️ 显示任务:', taskId);
    },
    [unhideTask]
  );

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
      onHideTask={handleHideTask}
      hiddenTaskIds={hiddenTaskIds}
      onUnhideTask={handleUnhideTask}
      configPanel={
        <ConfigPanel onClose={() => pageActions.setShowConfig(false)} onSave={loadBrandConfig} />
      }
      loginSettings={
        <LoginSettings
          isOpen={pageState.showLoginSettings}
          onClose={() => pageActions.setShowLoginSettings(false)}
          onSave={saveLoginConfigWrapped}
          currentConfig={pageState.loginConfig}
        />
      }
      imagePreview={
        pageState.previewImage && (
          <ImagePreview src={pageState.previewImage} onClose={handleClosePreview} />
        )
      }
      displayTasks={displayTasks}
    />
  );
}
