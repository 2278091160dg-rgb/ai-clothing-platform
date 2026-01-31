/**
 * ParamsPanel Constants - 参数面板常量和辅助函数
 */

import type { TextModel, ImageModel } from '@/lib/types';

export type GenerationMode = 'scene' | 'tryon' | 'wear' | 'combine';

export interface ModeConfig {
  id: GenerationMode;
  name: string;
  icon: string;
  disabled: boolean;
}

// 模式配置
export const MODES: ModeConfig[] = [
  { id: 'scene', name: '场景生图', icon: '🏞️', disabled: false },
  { id: 'tryon', name: '虚拟试衣', icon: '👔', disabled: false },
  { id: 'wear', name: '智能穿戴', icon: '👟', disabled: true },
  { id: 'combine', name: '自由搭配', icon: '🎨', disabled: true },
];

// 根据模式获取提示词占位符
export function getPromptPlaceholder(mode: GenerationMode): string {
  const placeholders = {
    scene: '描述您想要的场景效果，如：温馨卧室、自然窗光、极简风格...',
    tryon: '描述服装和模特要求，如：年轻亚洲女性、站立姿势、温馨卧室...',
    wear: '描述商品和穿戴场景，如：运动鞋、年轻女性、户外运动场景...',
    combine: '描述搭配风格和模特要求，如：休闲时尚风格、年轻女性模特...',
  };
  return placeholders[mode];
}

// 根据模式获取生成按钮文字
export function getGenerateButtonText(mode: GenerationMode): string {
  const texts = {
    scene: '开始生成场景图',
    tryon: '开始生成试衣图',
    wear: '开始生成穿戴图',
    combine: '开始生成搭配图',
  };
  return texts[mode];
}

// 图片比例选项
export const ASPECT_RATIOS = [
  { value: '9:16', label: '9:16竖版' },
  { value: '3:4', label: '3:4竖版' },
  { value: '1:1', label: '1:1方版' },
  { value: '16:9', label: '16:9横版' },
] as const;

// 文本模型选项
export const TEXT_MODELS = [
  { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'gpt-4o', label: 'GPT-4o' },
] as const satisfies readonly { value: TextModel; label: string }[];

// 生图模型选项
export const IMAGE_MODELS = [
  { value: 'Gemini-3-Pro-Image', label: 'Gemini 3.0 Pro ⚡' },
  { value: 'Gemini-2-Flash', label: 'Gemini 2.0 Flash ⚡' },
  { value: 'flux-1.1-pro', label: 'FLUX 1.1 Pro' },
  { value: 'flux-realism', label: 'FLUX Realism' },
  { value: 'sd3', label: 'Stable Diffusion 3' },
  { value: 'mj-v6', label: 'Midjourney V6' },
] as const satisfies readonly { value: ImageModel; label: string }[];
