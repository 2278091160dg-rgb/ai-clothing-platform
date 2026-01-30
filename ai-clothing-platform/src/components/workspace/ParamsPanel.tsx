/**
 * ParamsPanel - 参数配置面板
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
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

type GenerationMode = 'scene' | 'tryon' | 'wear' | 'combine';

// 模式配置
const MODES = [
  { id: 'scene' as const, name: '场景生图', icon: '🏞️', disabled: false },
  { id: 'tryon' as const, name: '虚拟试衣', icon: '👔', disabled: false },
  { id: 'wear' as const, name: '智能穿戴', icon: '👟', disabled: true },
  { id: 'combine' as const, name: '自由搭配', icon: '🎨', disabled: true },
];

// 根据模式获取提示词占位符
function getPromptPlaceholder(mode: GenerationMode): string {
  const placeholders = {
    scene: '描述您想要的场景效果，如：温馨卧室、自然窗光、极简风格...',
    tryon: '描述服装和模特要求，如：年轻亚洲女性、站立姿势、温馨卧室...',
    wear: '描述商品和穿戴场景，如：运动鞋、年轻女性、户外运动场景...',
    combine: '描述搭配风格和模特要求，如：休闲时尚风格、年轻女性模特...',
  };
  return placeholders[mode];
}

// 根据模式获取生成按钮文字
function getGenerateButtonText(mode: GenerationMode): string {
  const texts = {
    scene: '开始生成场景图',
    tryon: '开始生成试衣图',
    wear: '开始生成穿戴图',
    combine: '开始生成搭配图',
  };
  return texts[mode];
}

interface ParamsPanelProps {
  mode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
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
  productName: _productName,
  textModel,
  imageModel,
  aspectRatio,
  quality,
  onPromptChange,
  onProductNameChange: _onProductNameChange,
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
  // AI对话状态
  const [showAIConversation, setShowAIConversation] = useState(false);
  const [conversationId] = useState<string>();

  // 打开AI对话
  const handleOpenAIConversation = () => {
    setShowAIConversation(true);
  };

  // AI对话完成回调
  const handleAIConversationComplete = (
    optimizedPrompt: string,
    _optimizedNegativePrompt?: string
  ) => {
    onPromptChange(optimizedPrompt);
    onAIConversationComplete?.(optimizedPrompt, _optimizedNegativePrompt);
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
          {/* 模式选择器 */}
          <div>
            <label className="text-[11px] text-muted-foreground mb-1.5 block font-medium">
              📷 生成模式
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {MODES.map(m => {
                const isActive = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => !m.disabled && onModeChange(m.id)}
                    disabled={m.disabled}
                    className={`
                      flex flex-col items-center justify-center py-2 px-1.5 rounded-lg transition-all
                      ${
                        isActive
                          ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30'
                          : m.disabled
                            ? 'bg-card/30 text-muted-foreground/50 cursor-not-allowed'
                            : 'bg-card/50 text-muted-foreground hover:bg-card/80 border border-blue-500/10'
                      }
                    `}
                    title={m.disabled ? '开发中，敬请期待' : m.name}
                  >
                    <span className="text-lg mb-0.5">{m.icon}</span>
                    <span className="text-[9px] font-semibold leading-tight">{m.name}</span>
                    {m.disabled && <span className="text-[7px] opacity-60 mt-0.5">开发中</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 提示词 */}
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
              placeholder={getPromptPlaceholder(mode)}
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
                { value: '9:16', label: '9:16竖版' },
                { value: '3:4', label: '3:4竖版' },
                { value: '1:1', label: '1:1方版' },
                { value: '16:9', label: '16:9横版' },
              ].map(ratio => (
                <button
                  key={ratio.value}
                  onClick={() =>
                    onAspectRatioChange(ratio.value as '1:1' | '3:4' | '16:9' | '9:16')
                  }
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

          {/* 生成按钮 */}
          <Button
            onClick={() => {
              console.log('🔵 按钮被点击了！isConfigured:', isConfigured);
              onGenerate();
            }}
            disabled={isGenerating}
            className="h-11 text-[13px] font-bold w-full btn-primary rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            size="lg"
          >
            {!isConfigured ? (
              <>
                <Zap size={14} className="mr-2 animate-spin-slow" />
                请先配置API
              </>
            ) : isGenerating ? (
              <>
                <Zap size={14} className="mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Zap size={14} className="mr-2" />
                {getGenerateButtonText(mode)}
              </>
            )}
          </Button>
        </div>
      </div>

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
