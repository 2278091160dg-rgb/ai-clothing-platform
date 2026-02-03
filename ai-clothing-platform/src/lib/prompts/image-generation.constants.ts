/**
 * AI图片生成提示词常量
 */

export const MODEL_TYPES = {
  default: '亚洲模特',
  young_asian_female: '年轻亚洲女性',
  young_asian_male: '年轻亚洲男性',
  western_female: '欧美女性',
  western_male: '欧美男性',
  diverse: '多元化模特',
  professional_female: '职业女性',
  professional_male: '职业男性',
} as const;

export const SCENE_STYLES = {
  default: '极简高级居家/商业环境',
  cozy_bedroom: '温馨舒适的卧室环境',
  modern_living: '现代简约客厅',
  urban_street: '城市街头场景',
  minimal_studio: '极简主义摄影棚',
  nature_outdoor: '自然户外环境',
  luxury_interior: '奢华室内环境',
  cafe_restaurant: '咖啡馆或餐厅',
  office_workspace: '办公工作空间',
  beach_resort: '海滩度假村',
} as const;

const BASE_POSITIVE_PROMPTS = [
  'Professional fashion photography',
  'realistic lighting',
  'high fidelity',
  'commercial product shot',
  '8k quality',
  'studio lighting',
  'sharp focus',
  'authentic product representation',
  'natural skin texture',
  'professional photography',
  'cinematic lighting',
  'clean background',
] as const;

const BASE_NEGATIVE_PROMPTS = [
  'cartoon',
  'illustration',
  'anime',
  'oversmoothed skin',
  'unnatural colors',
  'distorted features',
  'blurred',
  'low quality',
  'unprofessional',
] as const;

export function getPositivePrompts(extra: string[] = []): string[] {
  return [...BASE_POSITIVE_PROMPTS, ...extra];
}

export function getNegativePrompts(extra: string[] = []): string[] {
  return [...BASE_NEGATIVE_PROMPTS, ...extra];
}
