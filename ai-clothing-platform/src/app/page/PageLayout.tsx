/**
 * PageLayout - 主页面布局组件
 *
 * 渲染主页面的Bento Grid布局结构
 */

import { Toaster } from '@/components/ui/toaster';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { UploadPanel } from '@/components/workspace/UploadPanel';
import { ParamsPanel } from '@/components/workspace/ParamsPanel';
import { SidebarTabs } from '@/components/workspace/SidebarTabs';
import { LoadingAnimation } from '@/components/workspace/LoadingAnimation';
import { MainContentRenderer } from './MainContentRenderer';
import type { PageState } from '@/hooks/use-page-state';
import type { BrandConfig } from '@/hooks/use-brand-config';
import type { ViewMode, ImageItem, BatchObject } from '@/hooks/use-canvas-view-mode';
import type { TextModel, ImageModel } from '@/lib/types';
import type { TaskData } from '@/lib/types';

interface PageLayoutProps {
  // 品牌配置
  brandConfig?: BrandConfig | null;
  onSaveBrandConfig?: () => void;

  // 页面状态
  pageState: PageState;

  // 图片上传相关
  productImagePreview: string;
  sceneImagePreview: string;
  handleProductUpload: () => void;
  handleSceneUpload: () => void;
  clearProductImage: () => void;
  clearSceneImage: () => void;

  // 画布视图相关
  viewMode: ViewMode;
  singleImage: ImageItem | null;
  activeBatch: BatchObject | null;
  selectedImages: ImageItem[];
  resetView: () => void;

  // 任务生成相关
  isGenerating: boolean;
  isConfigured: boolean;

  // 事件处理
  onLogout: () => void;
  onConfig: () => void;
  onLoginSettings: () => void;
  onModeChange: (mode: 'scene' | 'tryon' | 'wear' | 'combine') => void;
  onPromptChange: (value: string) => void;
  onTextModelChange: (model: TextModel) => void;
  onImageModelChange: (model: ImageModel) => void;
  onAspectRatioChange: (ratio: '1:1' | '3:4' | '16:9' | '9:16') => void;
  onGenerate: () => void;
  onImageClick: (image: ImageItem) => void;
  onBatchClick: (batch: BatchObject) => void;
  onTabChange: (tab: 'web' | 'table') => void;

  // 其他组件
  configPanel: React.ReactNode;
  loginSettings: React.ReactNode;
  imagePreview: React.ReactNode;
  displayTasks: TaskData[];
}

export function PageLayout({
  brandConfig,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSaveBrandConfig,
  pageState,
  productImagePreview,
  sceneImagePreview,
  handleProductUpload,
  handleSceneUpload,
  clearProductImage,
  clearSceneImage,
  viewMode,
  singleImage,
  activeBatch,
  selectedImages,
  resetView,
  isGenerating,
  isConfigured,
  onLogout,
  onConfig,
  onLoginSettings,
  onModeChange,
  onPromptChange,
  onTextModelChange,
  onImageModelChange,
  onAspectRatioChange,
  onGenerate,
  onImageClick,
  onBatchClick,
  onTabChange,
  configPanel,
  loginSettings,
  imagePreview,
  displayTasks,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-grid-pattern">
      <Toaster />

      {/* 顶部导航栏 */}
      <WorkspaceHeader
        brandConfig={brandConfig || { title: 'AI场景图生成器', subtitle: '智能电商商拍工具', icon: '🎨' }}
        onLoginSettings={onLoginSettings}
        onConfig={onConfig}
        onLogout={onLogout}
        userInitial="D"
      />

      {/* 主内容区 - Bento Grid 布局 */}
      <main className="p-6 overflow-hidden h-[calc(100vh-64px)] relative">
        <div className="flex gap-5 h-full">
          {/* 左侧栏 - 参数区域 */}
          <div className="w-[360px] flex-shrink-0 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-3 pb-3">
              <UploadPanel
                mode={pageState.mode}
                productImagePreview={productImagePreview}
                sceneImagePreview={sceneImagePreview}
                onProductUpload={handleProductUpload}
                onSceneUpload={handleSceneUpload}
                onProductClear={clearProductImage}
                onSceneClear={clearSceneImage}
              />
              <ParamsPanel
                mode={pageState.mode}
                onModeChange={onModeChange}
                prompt={pageState.prompt}
                textModel={pageState.textModel}
                imageModel={pageState.imageModel}
                aspectRatio={pageState.aspectRatio}
                quality={pageState.quality}
                onPromptChange={onPromptChange}
                onTextModelChange={onTextModelChange}
                onImageModelChange={onImageModelChange}
                onAspectRatioChange={onAspectRatioChange}
                onGenerate={onGenerate}
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
              generatedImage={pageState.generatedImage}
              uploadedImage={pageState.uploadedImage}
              sceneImagePreview={sceneImagePreview}
              aspectRatio={pageState.aspectRatio}
              activeBatch={activeBatch}
              selectedImages={selectedImages}
              resetView={resetView}
            />
          </div>

          {/* 右侧栏 - 历史记录 */}
          <div className="w-[300px] flex flex-col">
            <SidebarTabs
              tasks={displayTasks}
              onImageClick={onImageClick}
              onBatchClick={onBatchClick}
              selectedImageIds={selectedImages.map(img => img.id)}
              activeTab={pageState.activeTab}
              onTabChange={onTabChange}
            />
          </div>
        </div>
      </main>

      {/* 配置面板 */}
      {pageState.showConfig && configPanel}

      {/* 登录页面设置模态框 */}
      {loginSettings}

      {/* 图片预览模态框 */}
      {imagePreview}
    </div>
  );
}
