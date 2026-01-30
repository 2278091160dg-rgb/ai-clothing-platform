/**
 * 虚拟试衣提示词模板
 *
 * 用于将服装白底图智能适配到模特身上的提示词
 */

// ==================== 参数接口定义 ====================

export interface VirtualTryOnParams {
  // === 核心参数 ===
  clothingImage: string; // 服装图片URL
  clothingDescription?: string; // 服装描述

  // === 参考图相关 ===
  referenceImage?: string; // 参考图URL（姿势参考）
  referenceDescription?: string; // 参考图描述

  // === 模特相关 ===
  modelImage?: string; // 模特图片URL
  modelDescription?: string; // 模特描述（年龄、性别、体型等）

  // === 场景相关 ===
  sceneDescription?: string; // 场景描述

  // === 试衣设置 ===
  tryonMode?: 'single' | 'multi'; // 试衣模式：单件/多件

  // === 质量要求 ===
  preserveDesign?: boolean; // 是否严格保持设计（默认true）
  photoRealistic?: boolean; // 是否照片级真实（默认true）
}

// ==================== 提示词构建函数 ====================

/**
 * 构建虚拟试衣提示词
 *
 * @param params - 虚拟试衣参数
 * @returns 完整的提示词
 */
export function buildVirtualTryOnPrompt(params: VirtualTryOnParams): string {
  const {
    clothingImage,
    clothingDescription = 'clothing item',
    referenceImage,
    referenceDescription,
    modelImage,
    modelDescription,
    sceneDescription,
    tryonMode = 'single',
    preserveDesign = true,
    photoRealistic = true,
  } = params;

  const prompt = `# Virtual Try-On Task

## Task Definition
You are an AI virtual try-on specialist. Your task is to digitally fit the uploaded clothing item onto a figure, creating a realistic product photograph.

## Product Analysis
- **Clothing Image**: ${clothingImage}
- **Clothing Description**: ${clothingDescription}
- **Try-On Mode**: ${tryonMode === 'single' ? 'Single item' : 'Multiple items'}

${
  referenceImage
    ? `
## Reference Pose Analysis
- **Reference Image**: ${referenceImage}
${referenceDescription ? `- **Reference Description**: ${referenceDescription}` : ''}

**Target**: Adapt the clothing to match the reference pose exactly.
`
    : ''
}

${
  modelImage || modelDescription
    ? `
## Model Specifications
${modelImage ? `- **Model Image**: ${modelImage}` : ''}
${modelDescription ? `- **Model Description**: ${modelDescription}` : ''}

**Requirements**:
- Match model's body proportions
- Natural positioning on model's body
- Realistic fabric behavior
`
    : ''
}

${
  sceneDescription
    ? `
## Scene Description
- **Environment**: ${sceneDescription}

**Requirements**:
- Background should match scene description
- Lighting consistent with scene
- Overall atmosphere coherent
`
    : ''
}

## Try-On Instructions

### 1. Design Preservation ${preserveDesign ? '(CRITICAL)' : ''}
${
  preserveDesign
    ? `
**STRICTLY MAINTAIN all original design elements**:
- **Color**: Keep exact color, no changes
- **Pattern**: Maintain exact pattern placement
- **Logo/Print**: Preserve all logos, prints, text
- **Material**: Maintain material appearance (silk, cotton, etc.)
- **Details**: Keep all decorative elements, buttons, zippers, etc.
`
    : `
Maintain the general design and appearance of the clothing.`
}

### 2. Natural Fit
- Adapt clothing to body pose naturally
- Realistic fabric draping and folds
- Proper sizing and proportions
- Natural wrinkles and creases at appropriate positions

### 3. Seamless Integration
- Natural transition between clothing and body
- Clothing should look like it's actually being worn
- No visible seams or unnatural edges
- Consistent lighting with reference/model

### 4. Lighting and Shadows
- Match lighting of the reference/model image
- Appropriate shadows under folds and layers
- Highlights consistent with light source
- No mismatched lighting

## Quality Standards
${
  photoRealistic
    ? `
### Photo-Realistic Requirements
- **MUST** be photo-quality, realistic appearance
- **NO** cartoon, illustrated, or anime effects
- **NO** excessive smoothing or plastic-like skin
- Accurate body proportions and anatomy
- Natural skin texture and imperfections
`
    : ''
}

### Commercial Photography Standards
- Professional commercial photography quality
- 8K resolution equivalent
- Sharp focus on clothing details
- Suitable for e-commerce or fashion advertising

### Technical Requirements
- Clear visibility of clothing design
- Proper fit on body
- Natural pose and expression
- Clean, professional background ${sceneDescription ? 'matching scene description' : ''}

---

## Complete Generation Prompt

Professional virtual try-on photography, ${clothingDescription}${modelDescription ? `, on ${modelDescription}` : ''}${referenceImage ? ', matching reference pose' : ', natural standing pose'}${sceneDescription ? `, ${sceneDescription} scene` : ', studio background'}${tryonMode === 'single' ? ', single clothing item' : ', multiple clothing items'}, realistic fabric draping, natural fit to body${preserveDesign ? ', maintain original design and colors exactly' : ''}, ${photoRealistic ? 'photo-realistic quality, no cartoon effects' : 'high quality'}, 8k resolution, commercial fashion photography, professional lighting, sharp focus on clothing details.`;

  return prompt;
}

// ==================== 辅助函数 ====================

/**
 * 构建简化的试衣提示词（用于快速生成）
 */
export function buildSimpleTryOnPrompt(
  clothingDescription: string,
  modelDescription: string = 'young Asian female model'
): string {
  return buildVirtualTryOnPrompt({
    clothingImage: 'CLOTHING_IMAGE',
    clothingDescription,
    modelDescription,
    tryonMode: 'single',
    preserveDesign: true,
    photoRealistic: true,
  });
}

// ==================== 使用示例 ====================

/**
 * 使用示例
 *
 * ```typescript
 * import { buildVirtualTryOnPrompt } from '@/lib/prompts/templates/virtual-tryon.template';
 *
 * // 示例1：基础使用
 * const prompt1 = buildVirtualTryOnPrompt({
 *   clothingImage: 'https://example.com/dress.jpg',
 *   clothingDescription: '红色连衣裙',
 *   modelDescription: '年轻亚洲女性模特',
 * });
 *
 * // 示例2：带参考图
 * const prompt2 = buildVirtualTryOnPrompt({
 *   clothingImage: 'https://example.com/dress.jpg',
 *   clothingDescription: '蓝色西装套装',
 *   referenceImage: 'https://example.com/pose.jpg',
 *   referenceDescription: '模特站姿，右手插兜',
 *   modelDescription: '30岁亚洲男性，商务风格',
 *   sceneDescription: '现代办公室',
 * });
 *
 * // 示例3：完整参数
 * const prompt3 = buildVirtualTryOnPrompt({
 *   clothingImage: 'https://example.com/shirt.jpg',
 *   clothingDescription: '白色丝绸衬衫',
 *   referenceImage: 'https://example.com/pose.jpg',
 *   modelImage: 'https://example.com/model.jpg',
 *   modelDescription: '25岁欧美女性模特，身材苗条',
 *   sceneDescription: '温馨卧室，柔和光线',
 *   tryonMode: 'single',
 *   preserveDesign: true,
 *   photoRealistic: true,
 * });
 * ```
 */
