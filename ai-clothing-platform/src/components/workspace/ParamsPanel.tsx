/**
 * ParamsPanel - 参数配置面板
 *
 * 拆分后的结构：
 * - params-panel-constants.ts: 常量和配置
 * - params-panel-hooks.ts: 状态管理 Hook
 * - params-panel-components.tsx: 子组件
 */

import { AIConversationSidebar } from '@/components/conversation';
import { useParamsPanel } from './params-panel-hooks';
import {
  ModeSelector,
  PromptInput,
  AspectRatioSelector,
  ModelSelector,
  GenerateButton,
} from './params-panel-components';
import type { GenerationMode } from './params-panel-constants';
import type { TextModel, ImageModel } from '@/lib/types';

interface ParamsPanelProps {
  mode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
  prompt: string;
  textModel: TextModel;
  imageModel: ImageModel;
  aspectRatio: '1:1' | '3:4' | '16:9' | '9:16';
  quality: 'standard' | 'high';
  onPromptChange: (value: string) => void;
  onTextModelChange: (value: TextModel) => void;
  onImageModelChange: (value: ImageModel) => void;
  onAspectRatioChange: (value: '1:1' | '3:4' | '16:9' | '9:16') => void;
  onGenerate: () => void;
  onAIConversationComplete?: (optimizedPrompt: string, optimizedNegativePrompt?: string) => void;
  isConfigured: boolean;
  productImageUrl?: string;
  sceneImageUrl?: string;
  isGenerating?: boolean;
}

export function ParamsPanel({
  mode,
  onModeChange,
  prompt,
  textModel,
  imageModel,
  aspectRatio,
  quality,
  onPromptChange,
  onTextModelChange,
  onImageModelChange,
  onAspectRatioChange,
  onGenerate,
  onAIConversationComplete,
  isConfigured,
  productImageUrl,
  sceneImageUrl,
  isGenerating = false,
}: ParamsPanelProps) {
  const {
    showAIConversation,
    handleOpenAIConversation,
    handleCloseAIConversation,
    handleAIConversationComplete,
  } = useParamsPanel({
    onPromptChange,
    onAIConversationComplete,
  });

  return (
    <>
      {/* 参数配置区 */}
      <div className="theme-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="step-number">02</span>
          <h3 className="text-[14px] font-bold text-foreground">生成参数</h3>
        </div>

        <div className="space-y-3">
          {/* 模式选择器 */}
          <ModeSelector mode={mode} onModeChange={onModeChange} />

          {/* 提示词 */}
          <PromptInput
            mode={mode}
            prompt={prompt}
            onPromptChange={onPromptChange}
            onOpenAIConversation={handleOpenAIConversation}
          />

          {/* 图片比例 */}
          <AspectRatioSelector
            aspectRatio={aspectRatio}
            onAspectRatioChange={onAspectRatioChange}
          />

          {/* 模型选择 */}
          <ModelSelector
            textModel={textModel}
            imageModel={imageModel}
            onTextModelChange={onTextModelChange}
            onImageModelChange={onImageModelChange}
          />

          {/* 生成按钮 */}
          <GenerateButton
            mode={mode}
            isConfigured={isConfigured}
            isGenerating={isGenerating}
            onGenerate={onGenerate}
          />
        </div>
      </div>

      {/* AI对话侧边栏 */}
      <AIConversationSidebar
        open={showAIConversation}
        onClose={handleCloseAIConversation}
        originalPrompt={prompt}
        recordId={undefined} // 如果有feishuRecordId可以传入
        taskData={{
          productImageUrl,
          sceneImageUrl,
          aiModel: imageModel,
          aspectRatio,
          quality,
        }}
        onApply={handleAIConversationComplete}
      />
    </>
  );
}
