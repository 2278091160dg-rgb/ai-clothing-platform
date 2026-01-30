/**
 * AI图片生成提示词模板
 *
 * 参考实际业务场景的结构化提示词设计
 * 目标：用简洁的用户输入，生成高质量的专业商业摄影提示词
 *
 * 使用方式：
 * ```ts
 * import { buildImageGenerationPrompt } from '@/lib/prompts/image-generation.template';
 *
 * const prompt = buildImageGenerationPrompt({
 *   productDescription: '红色连衣裙',
 *   modelType: 'young_asian_female',
 *   sceneStyle: 'cozy_bedroom'
 * });
 * ```
 */

export interface PromptTemplateParams {
  /**
   * 产品描述（必填）
   * 用户输入的产品简短描述，如"红色连衣裙"、"蓝色西装"
   */
  productDescription: string;

  /**
   * 模特类型（可选）
   * 如果不提供，使用默认值"亚洲模特"
   */
  modelType?: string;

  /**
   * 场景风格（可选）
   * 如果不提供，使用默认值"极简高级居家/商业环境"
   */
  sceneStyle?: string;

  /**
   * 额外的正面提示词（可选）
   * 用于增强特定效果，如"soft lighting"、"bokeh"等
   */
  positivePrompts?: string[];

  /**
   * 负面提示词（可选）
   * 明确不想要的效果
   */
  negativePrompts?: string[];
}

/**
 * 模特类型选项
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

/**
 * 场景风格选项
 */
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

/**
 * 构建AI图片生成的完整提示词
 *
 * @param params - 提示词模板参数
 * @returns 完整的结构化提示词
 */
export function buildImageGenerationPrompt(params: PromptTemplateParams): string {
  const {
    productDescription,
    modelType = MODEL_TYPES.default,
    sceneStyle = SCENE_STYLES.default,
    positivePrompts = [],
    negativePrompts = [],
  } = params;

  // 基础正面提示词
  const basePositivePrompts = [
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
    ...positivePrompts,
  ];

  // 基础负面提示词
  const baseNegativePrompts = [
    'cartoon',
    'illustration',
    'anime',
    'oversmoothed skin',
    'unnatural colors',
    'distorted features',
    'blurred',
    'low quality',
    'unprofessional',
    ...negativePrompts,
  ];

  // 构建STEP 3的图像生成指令
  const step3Prompt = `**产品特征**：${productDescription}

**完整生成指令**：
${basePositivePrompts.join(', ')}, ${modelType}, ${sceneStyle}, ${productDescription}`;

  // 构建完整提示词
  const template = `# Task Definition

你是一位世界顶级的商业广告摄影师和后期修图专家，拥有20年的电商产品摄影经验。你的核心任务是将用户上传的白底产品图转化为高质量、专业的真人模特场景展示图。

## Task Instructions

### STEP 1: 产品特征提取
请仔细分析上传的产品图片，提取以下信息：
- **服装品类**：识别产品的具体类型（如连衣裙、西装、衬衫、裤子、外套等）
- **核心设计元素**：提取产品的关键设计特征（如领型、袖型、裙长、颜色、图案、logo、印花等）
- **材质质感**：描述产品的面料质感（如丝绸、棉质、羊毛、牛仔、蕾丝、针织等）

**重要约束**：在后续生成中，必须严格保持产品的核心特征，严禁改变产品的颜色、图案、Logo、印花等设计元素。

### STEP 2: 场景与模特设定
根据以下设定构建场景：

**模特描述**：
- ${modelType}
- 姿态自然，展现产品最佳效果
- 表情专业，符合商业摄影标准
- 与产品风格相匹配

**环境描述**：
- ${sceneStyle}
- 光线柔和自然，突出产品质感
- 背景简洁，不喧宾夺主
- 整体色调和谐统一

**构图要求**：
- 全身或膝盖以上中景
- 产品居中或采用三分法构图
- 留有适当呼吸空间
- 符合商业摄影的构图标准

### STEP 3: 图像生成

基于以上分析，使用以下提示词逻辑生成图像：

${step3Prompt}

## Constraints & Safety

1. **产品真实性**：必须严格保持产品的原始颜色、图案、Logo、印花等核心设计元素，不得有任何改变
2. **照片级真实感**：生成结果必须是照片级别的真实感，不得出现卡通、插画、过度磨皮等效果
3. **商业摄影标准**：构图、光线、色彩必须符合专业商业摄影的标准
4. **自然真实**：模特姿态、表情必须自然，避免僵硬或过度表演
5. **质量保证**：确保图像清晰度高，细节丰富，无失真、无模糊

## User Input Variables

- **[Input_Image]**: 用户上传的白底产品图
- **[Product_Description]**: ${productDescription}
- **[Model_Type]**: ${modelType}
- **[Scene_Style]**: ${sceneStyle}

## Negative Constraints

避免以下效果：
${baseNegativePrompts.map(p => `- ${p}`).join('\n')}

请严格按照以上指令执行，确保生成高质量、真实、专业的商业产品展示图。`;

  return template;
}

/**
 * 构建简化版提示词（用于不使用结构化模板的场景）
 *
 * @param params - 提示词参数
 * @returns 简化版提示词
 */
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

/**
 * 从预设模板快速生成提示词
 *
 * @param templateType - 模板类型
 * @param productDescription - 产品描述
 * @returns 生成的提示词
 */
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
