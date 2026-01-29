/**
 * 登录页面背景图片库
 * AI 电商主题背景
 */

import type { BackgroundImage } from './login-backgrounds.types';
import { TECH_AI_BACKGROUNDS } from './backgrounds/tech-ai';
import { NEURAL_NETWORK_BACKGROUNDS } from './backgrounds/neural-network';
import { DATA_FLOW_BACKGROUNDS } from './backgrounds/data-flow';
import { FUTURE_COMMERCE_BACKGROUNDS } from './backgrounds/future-commerce';
import { ALGORITHM_BACKGROUNDS } from './backgrounds/algorithm';
import { ECOMMERCE_BACKGROUNDS } from './backgrounds/ecommerce';

export type { BackgroundImage };

/**
 * 所有登录背景图片
 */
export const LOGIN_BACKGROUNDS: BackgroundImage[] = [
  ...TECH_AI_BACKGROUNDS,
  ...NEURAL_NETWORK_BACKGROUNDS,
  ...DATA_FLOW_BACKGROUNDS,
  ...FUTURE_COMMERCE_BACKGROUNDS,
  ...ALGORITHM_BACKGROUNDS,
  ...ECOMMERCE_BACKGROUNDS,
];

/**
 * 根据ID获取背景
 */
export function getBackgroundById(id: string): BackgroundImage | undefined {
  return LOGIN_BACKGROUNDS.find(bg => bg.id === id);
}

/**
 * 根据分类获取背景
 */
export function getBackgroundsByCategory(category: BackgroundImage['category']): BackgroundImage[] {
  return LOGIN_BACKGROUNDS.filter(bg => bg.category === category);
}

/**
 * 所有分类
 */
export const BACKGROUND_CATEGORIES = [
  { id: 'tech-ai', name: '科技AI', icon: '🤖' },
  { id: 'neural-network', name: '神经网络', icon: '🧠' },
  { id: 'data-flow', name: '数据流', icon: '💧' },
  { id: 'future-commerce', name: '未来电商', icon: '🛒' },
  { id: 'algorithm', name: '算法', icon: '⚡' },
  { id: 'ecommerce', name: '电商应用', icon: '🚀' },
] as const;
