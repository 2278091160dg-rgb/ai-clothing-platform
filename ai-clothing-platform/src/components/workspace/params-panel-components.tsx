/**
 * ParamsPanel Subcomponents - 参数面板子组件
 */

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
import type { GenerationMode } from './params-panel-constants';
import type { TextModel, ImageModel } from '@/lib/types';
import {
  MODES,
  ASPECT_RATIOS,
  TEXT_MODELS,
  IMAGE_MODELS,
  getPromptPlaceholder,
  getGenerateButtonText,
} from './params-panel-constants';

interface ModeSelectorProps {
  mode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
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
  );
}

interface PromptInputProps {
  mode: GenerationMode;
  prompt: string;
  onPromptChange: (value: string) => void;
  onOpenAIConversation: () => void;
}

export function PromptInput({
  mode,
  prompt,
  onPromptChange,
  onOpenAIConversation,
}: PromptInputProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] text-muted-foreground font-medium">
          提示词 <span className="text-primary">（必填）</span>
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onOpenAIConversation}
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
  );
}

interface AspectRatioSelectorProps {
  aspectRatio: '1:1' | '3:4' | '16:9' | '9:16';
  onAspectRatioChange: (value: '1:1' | '3:4' | '16:9' | '9:16') => void;
}

export function AspectRatioSelector({
  aspectRatio,
  onAspectRatioChange,
}: AspectRatioSelectorProps) {
  return (
    <div>
      <label className="text-[11px] text-muted-foreground mb-1.5 block font-medium">图片比例</label>
      <div className="flex gap-2">
        {ASPECT_RATIOS.map(ratio => (
          <button
            key={ratio.value}
            onClick={() => onAspectRatioChange(ratio.value)}
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
  );
}

interface ModelSelectorProps {
  textModel: TextModel;
  imageModel: ImageModel;
  onTextModelChange: (value: TextModel) => void;
  onImageModelChange: (value: ImageModel) => void;
}

export function ModelSelector({
  textModel,
  imageModel,
  onTextModelChange,
  onImageModelChange,
}: ModelSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="text-[11px] text-muted-foreground mb-1 block font-medium">文本模型</label>
        <Select value={textModel} onValueChange={v => onTextModelChange(v as TextModel)}>
          <SelectTrigger className="h-8 bg-card/50 border-border/30 text-[11px] text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card/95 backdrop-blur-xl border-border/30">
            {TEXT_MODELS.map(model => (
              <SelectItem key={model.value} value={model.value}>
                {model.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-[11px] text-muted-foreground mb-1 block font-medium">生图模型</label>
        <Select value={imageModel} onValueChange={v => onImageModelChange(v as ImageModel)}>
          <SelectTrigger className="h-8 bg-card/50 border-border/30 text-[11px] text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card/95 backdrop-blur-xl border-border/30">
            {IMAGE_MODELS.map(model => (
              <SelectItem key={model.value} value={model.value}>
                {model.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

interface GenerateButtonProps {
  mode: GenerationMode;
  isConfigured: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function GenerateButton({
  mode,
  isConfigured,
  isGenerating,
  onGenerate,
}: GenerateButtonProps) {
  return (
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
  );
}
