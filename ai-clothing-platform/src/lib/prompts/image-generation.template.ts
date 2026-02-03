/**
 * AI图片生成提示词模板
 */

export interface PromptTemplateParams {
  productDescription: string;
  modelType?: string;
  sceneStyle?: string;
  positivePrompts?: string[];
  negativePrompts?: string[];
}
import {
  MODEL_TYPES,
  SCENE_STYLES,
  getPositivePrompts,
  getNegativePrompts,
} from './image-generation.constants';
import { buildSystemTemplate } from './image-generation-templates';

export { MODEL_TYPES, SCENE_STYLES };

export function buildImageGenerationPrompt(params: PromptTemplateParams): string {
  const {
    productDescription,
    modelType = MODEL_TYPES.default,
    sceneStyle = SCENE_STYLES.default,
    positivePrompts = [],
    negativePrompts = [],
  } = params;

  const basePositive = getPositivePrompts(positivePrompts);
  const baseNegative = getNegativePrompts(negativePrompts);

  const step3Prompt = `**产品特征**：${productDescription}\n\n**完整生成指令**：\n${basePositive.join(', ')}, ${modelType}, ${sceneStyle}, ${productDescription}`;

  const negativeList = baseNegative.map(p => `- ${p}`).join('\n');

  return buildSystemTemplate(
    productDescription,
    modelType,
    sceneStyle,
    step3Prompt,
    negativeList
  );
}

export function buildSimplePrompt(params: PromptTemplateParams): string {
  const {
    productDescription,
    modelType = MODEL_TYPES.default,
    sceneStyle = SCENE_STYLES.default,
  } = params;

  const positivePrompts = [
    'Professional fashion photography',
    modelType,
    sceneStyle,
    productDescription,
    'realistic lighting',
    'high fidelity',
    'commercial product shot',
    '8k quality',
    'studio lighting',
    'sharp focus',
    'clean background',
  ];

  return positivePrompts.join(', ');
}

export function buildPromptFromTemplate(
  templateType: 'fashion' | 'jewelry' | 'cosmetics' | 'home',
  productDescription: string
): string {
  const templates = {
    fashion: buildImageGenerationPrompt({
      productDescription,
      modelType: MODEL_TYPES.young_asian_female,
      sceneStyle: SCENE_STYLES.modern_living,
    }),

    jewelry: buildImageGenerationPrompt({
      productDescription,
      modelType: '优雅女性模特',
      sceneStyle: '奢华室内环境，柔和光线',
      positivePrompts: ['elegant', 'luxury', 'sparkle', 'high-end'],
    }),

    cosmetics: buildImageGenerationPrompt({
      productDescription,
      modelType: '皮肤细腻的女性模特',
      sceneStyle: '明亮的化妆间或专业摄影棚',
      positivePrompts: ['fresh', 'clean', 'radiant skin', 'beauty photography'],
    }),

    home: buildImageGenerationPrompt({
      productDescription,
      modelType: MODEL_TYPES.default,
      sceneStyle: SCENE_STYLES.cozy_bedroom,
      positivePrompts: ['cozy', 'warm', 'lifestyle', 'home decor'],
    }),
  };

  return templates[templateType];
}
