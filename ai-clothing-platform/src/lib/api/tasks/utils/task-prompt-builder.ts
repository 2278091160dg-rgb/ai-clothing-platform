/**
 * Task Prompt Builder
 * 为不同生成模式构建AI提示词
 */

import type { CreateTaskRequest } from '../types/create-task.types';

/**
 * 构建场景生图提示词
 */
export function buildScenePrompt(params: CreateTaskRequest): string {
  return params.prompt || 'Product photography';
}

/**
 * 构建虚拟试衣提示词
 */
export function buildTryOnPrompt(params: CreateTaskRequest): string {
  const {
    clothingDescription = 'clothing item',
    modelDescription = 'young Asian female model',
    sceneDescription = 'studio background',
    tryonMode = 'single',
  } = params;

  return `# Virtual Try-On Task

## Product
- **Clothing**: ${params.clothingDescription}
- **Try-On Mode**: ${tryonMode}

${
  params.tryonReferenceImageUrl
    ? `
## Reference
- **Reference Image**: Provided
`
    : ''
}

${
  params.tryonModelImageUrl || modelDescription
    ? `
## Model
- **Model**: ${params.tryonModelImageUrl || modelDescription}
`
    : ''
}

${
  params.sceneDescription
    ? `
## Scene
- **Environment**: ${params.sceneDescription}
`
    : ''
}

## Instructions
1. Maintain all original design elements (color, pattern, logo)
2. Adapt clothing to figure pose naturally
3. Realistic fabric draping and folds
4. Seamless integration with body

---

Professional virtual try-on photography, ${clothingDescription}, ${modelDescription}, ${sceneDescription}, realistic fabric draping, natural fit, maintain original design, photo-realistic, 8k quality, commercial fashion photography.`;
}

/**
 * 构建智能穿戴提示词
 */
export function buildWearPrompt(params: CreateTaskRequest): string {
  const {
    wearProductDescription = 'product',
    productType = 'shoes',
    wearReferenceDescription = 'model pose',
    viewType = 'single',
  } = params;

  const positionMap: Record<string, string> = {
    shoes: 'on feet',
    bag: 'on shoulder or in hand',
    watch: 'on wrist',
    jewelry: 'on body',
    hat: 'on head',
    scarf: 'around neck',
  };

  return `# Smart Product Wearing Task

## Product
- **Product**: ${wearProductDescription}
- **Type**: ${productType}
- **Target Position**: ${positionMap[productType]}

## Reference
- **Reference**: ${wearReferenceDescription}

## Instructions
1. Place product on appropriate position (${positionMap[productType]})
2. Natural size and proportion
3. Seamless integration

---

Professional product photography, ${productType} ${wearProductDescription}, ${positionMap[productType]}, ${viewType} angle view, natural integration, photo-realistic, 8k quality.`;
}

/**
 * 构建自由搭配提示词
 */
export function buildCombinePrompt(params: CreateTaskRequest): string {
  const {
    materialImageUrls = [],
    combinationCount = 4,
    modelType = 'any',
    stylePreference = 'casual',
  } = params;

  const materialCount = materialImageUrls.length;

  return `# Free Combination Generation Task

## Task
Create ${combinationCount} unique outfit combinations from ${materialCount} material items.

## Materials
${materialImageUrls.map((m, i) => `- Item ${i + 1}: ${m}`).join('\n')}

## Style
- **Style**: ${stylePreference}
- **Model**: ${modelType}

## Instructions
1. Create ${combinationCount} distinct combinations
2. Maximize variety across looks
3. Each combination should be stylish and cohesive

---

Professional fashion photography, ${combinationCount} outfit combinations, using ${materialCount} materials, ${stylePreference} style, ${modelType} model, high quality, 8k resolution.`;
}

/**
 * 根据mode构建对应的提示词
 */
export function buildPromptByMode(params: CreateTaskRequest): string {
  switch (params.mode) {
    case 'scene':
      return buildScenePrompt(params);
    case 'tryon':
      return buildTryOnPrompt(params);
    case 'wear':
      return buildWearPrompt(params);
    case 'combine':
      return buildCombinePrompt(params);
    default:
      return params.prompt || 'Product photography';
  }
}
