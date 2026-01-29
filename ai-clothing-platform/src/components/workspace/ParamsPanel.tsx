/**
 * ParamsPanel - 参数配置面板
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Zap, MessageSquare } from 'lucide-react';
import { AIConversationSidebar } from '@/components/conversation';
import type { TextModel, ImageModel } from '@/lib/types';

interface ParamsPanelProps {
  prompt: string;
  productName: string;
  textModel: TextModel;
  imageModel: ImageModel;
  aspectRatio: '1:1' | '3:4' | '16:9' | '9:16';
  quality: 'standard' | 'high';
  onPromptChange: (value: string) => void;
  onProductNameChange: (value: string) => void;
  onTextModelChange: (value: TextModel) => void;
  onImageModelChange: (value: ImageModel) => void;
  onAspectRatioChange: (value: '1:1' | '3:4' | '16:9' | '9:16') => void;
  onGenerate: () => void;
  onAIConversationComplete?: (optimizedPrompt: string) => void;
  isConfigured: boolean;
  productImageUrl?: string;
  sceneImageUrl?: string;
}

export function ParamsPanel({
  prompt,
  productName,
  textModel,
  imageModel,
  aspectRatio,
  quality,
  onPromptChange,
  onProductNameChange,
  onTextModelChange,
  onImageModelChange,
  onAspectRatioChange,
  onGenerate,
  onAIConversationComplete,
  isConfigured,
  productImageUrl,
  sceneImageUrl,
}: ParamsPanelProps) {
  // AI对话状态
  const [showAIConversation, setShowAIConversation] = useState(false);
  const [conversationId, setConversationId] = useState<string>();

  // 打开AI对话
  const handleOpenAIConversation = () => {
    setShowAIConversation(true);
  };

  // AI对话完成回调
  const handleAIConversationComplete = (optimizedPrompt: string) => {
    onPromptChange(optimizedPrompt);
    onAIConversationComplete?.(optimizedPrompt);
    setShowAIConversation(false);
  };

  return (
    <>
      {/* 参数配置区 */}
      <div className="theme-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="step-number">02</span>
          <h3 className="text-[14px] font-bold text-foreground">生成参数</h3>
        </div>

        <div className="space-y-3">
          {/* 提示词 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] text-muted-foreground font-medium">
                提示词 <span className="text-primary">（必填）</span>
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleOpenAIConversation}
                className="h-6 text-[10px] px-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
              >
                <MessageSquare size={12} className="mr-1" />
                AI对话优化
              </Button>
            </div>
            <Textarea
              value={prompt}
              onChange={e => onPromptChange(e.target.value)}
              placeholder="描述您想要的场景效果..."
              className="min-h-[60px] text-sm resize-none bg-card/50 border-border/30 focus:border-blue-500/50 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* 图片比例 */}
          <div>
            <label className="text-[11px] text-muted-foreground mb-1.5 block font-medium">
              图片比例
            </label>
            <div className="flex gap-2">
              {[
                { value: '3:4', label: '3:4竖版' },
                { value: '1:1', label: '1:1方版' },
                { value: '16:9', label: '16:9横版' },
              ].map(ratio => (
                <button
                  key={ratio.value}
                  onClick={() => onAspectRatioChange(ratio.value as any)}
                  className={`flex-1 py-2 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                    aspectRatio === ratio.value
                      ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30'
                      : 'bg-card/50 text-muted-foreground hover:bg-card/50 border border-blue-500/10'
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* 模型选择 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block font-medium">
                文本模型
              </label>
              <Select value={textModel} onValueChange={v => onTextModelChange(v as TextModel)}>
                <SelectTrigger className="h-8 bg-card/50 border-border/30 text-[11px] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-xl border-border/30">
                  <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash</SelectItem>
                  <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                  <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                  <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block font-medium">
                生图模型
              </label>
              <Select value={imageModel} onValueChange={v => onImageModelChange(v as ImageModel)}>
                <SelectTrigger className="h-8 bg-card/50 border-border/30 text-[11px] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-xl border-border/30">
                  <SelectItem value="Gemini-3-Pro-Image">Gemini 3.0 Pro ⚡</SelectItem>
                  <SelectItem value="Gemini-2-Flash">Gemini 2.0 Flash ⚡</SelectItem>
                  <SelectItem value="flux-1.1-pro">FLUX 1.1 Pro</SelectItem>
                  <SelectItem value="flux-realism">FLUX Realism</SelectItem>
                  <SelectItem value="sd3">Stable Diffusion 3</SelectItem>
                  <SelectItem value="mj-v6">Midjourney V6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 模型说明 */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
            <p className="text-[10px] text-blue-400 flex items-center gap-1">
              <Zap size={12} />
              选择的模型将直接影响DeerAPI调用
            </p>
          </div>
        </div>
      </div>

      {/* 生成按钮 */}
      <Button
        onClick={onGenerate}
        className="h-12 text-[14px] font-bold w-full btn-primary rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
        size="lg"
      >
        {!isConfigured ? (
          <>
            <Zap size={16} className="mr-2 animate-spin-slow" />
            请先配置API
          </>
        ) : (
          <>
            <Zap size={16} className="mr-2" />
            开始生成场景图
          </>
        )}
      </Button>

      {/* AI对话侧边栏 */}
      <AIConversationSidebar
        open={showAIConversation}
        onClose={() => setShowAIConversation(false)}
        originalPrompt={prompt}
        conversationId={conversationId}
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
