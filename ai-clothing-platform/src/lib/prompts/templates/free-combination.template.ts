/**
 * 自由搭配提示词模板
 *
 * 用于融合多个素材生成多套搭配的提示词
 */

// ==================== 参数接口定义 ====================

export interface FreeCombinationParams {
  // === 核心参数 ===
  materials: string[]; // 素材图片URL数组（1-9张）
  combinationCount: number; // 生成搭配数量

  // === 模特设置 ===
  modelType?: ModelType; // 模特类型
  modelDescription?: string; // 模特详细描述

  // === 风格设置 ===
  stylePreference?: StylePreference; // 风格偏好
  styleDescription?: string; // 风格详细描述

  // === 质量要求 ===
  maximizeVariety?: boolean; // 最大化多样性
  photoRealistic?: boolean; // 照片级真实
}

// ==================== 类型定义 ====================

export type ModelType =
  | 'any' // 不限
  | 'adult' // 成人
  | 'child' // 儿童
  | 'male' // 男性
  | 'female'; // 女性

export type StylePreference =
  | 'casual' // 休闲
  | 'formal' // 正式
  | 'sporty' // 运动
  | 'elegant' // 优雅
  | 'minimalist'; // 极简

// ==================== 提示词构建函数 ====================

/**
 * 构建自由搭配提示词
 *
 * @param params - 自由搭配参数
 * @returns 完整的提示词
 */
export function buildFreeCombinationPrompt(params: FreeCombinationParams): string {
  const {
    materials,
    combinationCount,
    modelType = 'any',
    modelDescription,
    stylePreference,
    styleDescription,
    maximizeVariety = true,
    photoRealistic = true,
  } = params;

  const materialCount = materials.length;

  const prompt = `# Free Combination Generation Task

## Task Definition
You are an AI fashion combination specialist. Your task is to create multiple unique outfit combinations from the uploaded material images.

## Materials Analysis
- **Total Materials**: ${materialCount} items
- **Target Combinations**: ${combinationCount} unique looks

### Material List
${materials.map((m, i) => `- **Item ${i + 1}**: ${m}`).join('\n')}

## Model Specifications
- **Model Type**: ${getModelTypeDescription(modelType)}
${modelDescription ? `- **Model Description**: ${modelDescription}` : ''}

## Style Specifications
- **Style Preference**: ${stylePreference || 'various'}
${styleDescription ? `- **Style Description**: ${styleDescription}` : ''}

## Combination Strategy

### Output Requirements
Generate **${combinationCount} distinct outfit combinations** following these principles:

1. **Style Cohesion** ${maximizeVariety ? '(within each combination)' : ''}
   - Items in each combination must match stylistically
   - Colors, patterns, and styles should be harmonious
   - Appropriate for ${stylePreference || 'the intended'} style

2. ${maximizeVariety ? '**Variety Across Combinations**' : '**Consistent Style**'}
${
  maximizeVariety
    ? `
   - Each combination should be visually distinct
   - Maximize diversity in color palettes
   - Vary style elements (casual, dressy, layered, etc.)
   - Different moods and aesthetics
`
    : `
   - Maintain consistent style across combinations
   - Cohesive overall look
`
}

3. **Utilization**
   - Use all provided materials across combinations
   - Some items may appear in multiple combinations
   - Each combination should feature 2-5 items

### Generation Guidelines

#### Composition Principles
- Professional model photography standard
- Balanced outfit composition
- Appropriate layering and pairing
- Natural color transitions

#### Quality Standards
${
  photoRealistic
    ? `
- Photo-realistic quality
- No cartoon or illustrated effects
- Realistic fabric representation
- Natural model pose and expression
`
    : ''
}

#### Technical Requirements
- 8K resolution equivalent
- Sharp focus on outfit details
- Professional lighting
- Clean or styled background

## Constraints
- Maintain original design of materials
- No distortion of products
- Suitable for fashion/ecommerce use
- Professional commercial quality

---

## Complete Generation Prompt

Professional fashion photography, ${combinationCount} different outfit combinations${maximizeVariety ? ', maximum variety across looks' : ', consistent style'}, using ${materialCount} material items${modelType !== 'any' ? `, on ${getModelTypeDescription(modelType)} model` : ''}${stylePreference ? `, ${stylePreference} style` : ''}${maximizeVariety ? ', unique color palettes in each combination' : ', cohesive color schemes'}, professional model photography${photoRealistic ? ', photo-realistic quality' : ', high quality'}, 8k resolution, commercial fashion shoot, sharp details, realistic lighting.`;

  return prompt;
}

// ==================== 辅助函数 ====================

/**
 * 获取模特类型描述
 */
function getModelTypeDescription(type: ModelType): string {
  const descriptions: Record<ModelType, string> = {
    any: 'diverse models',
    adult: 'adult models',
    child: 'child models',
    male: 'male models',
    female: 'female models',
  };
  return descriptions[type];
}

// ==================== 使用示例 ====================

/**
 * 使用示例
 *
 * ```typescript
 * import { buildFreeCombinationPrompt } from '@/lib/prompts/templates/free-combination.template';
 *
 * // 示例1：基础使用
 * const prompt1 = buildFreeCombinationPrompt({
 *   materials: [
 *     'https://example.com/shirt.jpg',
 *     'https://example.com/pants.jpg',
 *     'https://example.com/shoes.jpg',
 *   ],
 *   combinationCount: 4,
 *   stylePreference: 'casual',
 * });
 *
 * // 示例2：完整参数
 * const prompt2 = buildFreeCombinationPrompt({
 *   materials: [
 *     'https://example.com/top1.jpg',
 *     'https://example.com/top2.jpg',
 *     'https://example.com/bottom1.jpg',
 *     'https://example.com/bottom2.jpg',
 *     'https://example.com/dress.jpg',
 *     'https://example.com/jacket.jpg',
 *   ],
 *   combinationCount: 6,
 *   modelType: 'female',
 *   modelDescription: '25岁亚洲女性模特',
 *   stylePreference: 'elegant',
 *   styleDescription: '都市优雅风格，适合职场',
 *   maximizeVariety: true,
 *   photoRealistic: true,
 * });
 * ```
 */
