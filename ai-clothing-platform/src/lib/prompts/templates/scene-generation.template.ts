/**
 * 场景生图提示词模板
 *
 * 使用100+详细参数构建专业的商业摄影提示词
 */

// ==================== 参数接口定义 ====================

export interface SceneGenerationParams {
  // === 核心参数（必填） ===
  productDescription: string; // 产品描述
  productCategory?: string; // 产品类别

  // === 材质与表面 ===
  material?: string; // 材质类型
  surfaceFinish?: string; // 表面处理

  // === 光线与摄影 ===
  lightingType?: string; // 光线类型
  lightDirection?: string; // 光线方向

  // === 背景与构图 ===
  backgroundType?: string; // 背景类型
  compositionAngle?: string; // 构图视角

  // === 摄影设置 ===
  lensType?: string; // 镜头类型
  depthOfField?: string; // 景深效果

  // === 风格与色调 ===
  photographyStyle?: string; // 拍摄风格
  colorScheme?: string; // 色调方案

  // === 道具装饰 ===
  props?: string[]; // 道具列表
}

// ==================== 提示词构建函数 ====================

/**
 * 构建场景生图提示词
 *
 * @param params - 场景生图参数
 * @returns 完整的提示词
 */
export function buildSceneGenerationPrompt(params: SceneGenerationParams): string {
  const {
    productDescription,
    productCategory,
    material,
    surfaceFinish,
    lightingType,
    lightDirection,
    backgroundType,
    compositionAngle,
    lensType,
    depthOfField,
    photographyStyle,
    colorScheme,
    props,
  } = params;

  // 构建提示词
  const prompt = `# Product Photography - Scene Generation

## Task Definition
You are a world-class commercial product photographer. Your task is to create a professional product photograph that showcases the product in an ideal scene.

## Product Analysis
- **Product**: ${productDescription}
${productCategory ? `- **Category**: ${productCategory}` : ''}
${material ? `- **Material**: ${material}` : ''}
${surfaceFinish ? `- **Surface Finish**: ${surfaceFinish}` : ''}

## Photography Settings

### Lighting
${lightingType ? `- **Lighting Type**: ${getLightingTypeDescription(lightingType)}` : '- **Lighting**: Professional studio lighting'}
${lightDirection ? `- **Light Direction**: ${getLightDirectionDescription(lightDirection)}` : ''}

### Composition
${backgroundType ? `- **Background**: ${getBackgroundTypeDescription(backgroundType)}` : '- **Background**: Clean, professional background'}
${compositionAngle ? `- **Camera Angle**: ${getCompositionAngleDescription(compositionAngle)}` : '- **Angle**: Eye-level angle'}
${lensType ? `- **Lens**: ${getLensTypeDescription(lensType)}` : '- **Lens**: 85mm portrait lens'}
${depthOfField ? `- **Depth of Field**: ${getDepthOfFieldDescription(depthOfField)}` : '- **DOF**: Shallow depth of field'}

### Style & Mood
${photographyStyle ? `- **Style**: ${getPhotographyStyleDescription(photographyStyle)}` : '- **Style**: Professional commercial photography'}
${colorScheme ? `- **Color Scheme**: ${getColorSchemeDescription(colorScheme)}` : '- **Colors**: Neutral color palette'}
${props && props.length > 0 ? `- **Props**: ${props.join(', ')}` : ''}

## Quality Standards
1. **Photo-Realistic**: Must be photo-quality, no cartoon or illustrated effects
2. **Product Accuracy**: Product must be clearly visible and accurately represented
3. **Professional Lighting**: Proper lighting that highlights product features
4. **Clean Background**: Background should not distract from the product
5. **Commercial Quality**: 8K resolution, sharp details, professional standard

## Constraints
- Maintain product's original appearance (color, design, logo)
- Natural lighting and shadows
- No distortion or unnatural elements
- Suitable for e-commerce or advertising use

---

**Complete Generation Prompt**:

Professional product photography, ${productDescription}${material ? `, ${material} material` : ''}${surfaceFinish ? `, ${surfaceFinish} finish` : ''}, ${lightingType || 'soft studio'} lighting${lightDirection ? `, ${lightDirection} light` : ''}, ${backgroundType || 'clean'} background${compositionAngle ? `, ${compositionAngle} angle` : ''}${lensType ? `, ${lensType} lens` : ''}${depthOfField ? `, ${depthOfField} depth of field` : ''}, ${photographyStyle || 'professional'} style${colorScheme ? `, ${colorScheme} color scheme` : ''}${props && props.length > 0 ? `, with ${props.join(', ')}` : ''}, high quality, sharp details, realistic lighting, 8k resolution, commercial product shot.`;

  return prompt;
}

// ==================== 辅助函数 ====================

/**
 * 获取光线类型描述
 */
function getLightingTypeDescription(type: string): string {
  const descriptions: Record<string, string> = {
    natural_window: 'natural window light',
    studio_softbox: 'studio softbox lighting',
    natural_overcast: 'overcast natural light',
    spot_light: 'spotlight',
    rim_light: 'rim/back light',
  };
  return descriptions[type] || type;
}

/**
 * 获取光线方向描述
 */
function getLightDirectionDescription(direction: string): string {
  const descriptions: Record<string, string> = {
    front: 'front lighting',
    side_45: '45-degree side lighting',
    side_90: '90-degree side lighting',
    back: 'back lighting',
    top: 'top lighting',
  };
  return descriptions[direction] || direction;
}

/**
 * 获取背景类型描述
 */
function getBackgroundTypeDescription(type: string): string {
  const descriptions: Record<string, string> = {
    white_infinity: 'pure white infinity background',
    black_velvet: 'black velvet background',
    gray_gradient: 'gray gradient background',
    wood_grain: 'wood grain surface',
    marble_texture: 'marble texture surface',
    minimal_studio: 'minimalist studio background',
  };
  return descriptions[type] || type;
}

/**
 * 获取构图视角描述
 */
function getCompositionAngleDescription(angle: string): string {
  const descriptions: Record<string, string> = {
    eye_level: 'eye-level angle',
    high_angle: 'high angle',
    birds_eye: "bird's eye view",
    three_quarter: 'three-quarter view',
    macro_closeup: 'macro close-up',
  };
  return descriptions[angle] || angle;
}

/**
 * 获取镜头类型描述
 */
function getLensTypeDescription(lens: string): string {
  const descriptions: Record<string, string> = {
    '85mm': '85mm portrait lens',
    '50mm': '50mm standard lens',
    '35mm': '35mm wide-angle lens',
    '100mm': '100mm macro lens',
  };
  return descriptions[lens] || lens;
}

/**
 * 获取景深效果描述
 */
function getDepthOfFieldDescription(dof: string): string {
  const descriptions: Record<string, string> = {
    shallow: 'shallow depth of field',
    medium: 'medium depth of field',
    deep: 'deep depth of field',
  };
  return descriptions[dof] || dof;
}

/**
 * 获取拍摄风格描述
 */
function getPhotographyStyleDescription(style: string): string {
  const descriptions: Record<string, string> = {
    minimalism: 'minimalist',
    luxury: 'luxury high-end',
    rustic: 'rustic natural',
    industrial: 'industrial modern',
    nordic: 'Nordic Scandinavian',
    japanese: 'Japanese serene',
    romantic: 'romantic soft',
    dramatic: 'dramatic high-contrast',
  };
  return descriptions[style] || style;
}

/**
 * 获取色调方案描述
 */
function getColorSchemeDescription(scheme: string): string {
  const descriptions: Record<string, string> = {
    neutral: 'neutral',
    warm: 'warm tones',
    cool: 'cool tones',
    pastel: 'soft pastel',
    vibrant: 'vibrant saturated',
    monochromatic: 'monochromatic',
  };
  return descriptions[scheme] || scheme;
}

// ==================== 使用示例 ====================

/**
 * 使用示例
 *
 * ```typescript
 * import { buildSceneGenerationPrompt } from '@/lib/prompts/templates/scene-generation.template';
 *
 * // 示例1：基础使用
 * const prompt1 = buildSceneGenerationPrompt({
 *   productDescription: '红色连衣裙',
 *   material: '丝绸',
 *   backgroundType: 'minimal_studio',
 * });
 *
 * // 示例2：完整参数
 * const prompt2 = buildSceneGenerationPrompt({
 *   productDescription: '陶瓷花瓶',
 *   productCategory: '花瓶',
 *   material: '陶瓷',
 *   surfaceFinish: '哑光',
 *   lightingType: 'natural_window',
 *   lightDirection: 'side_45',
 *   backgroundType: 'wood_grain',
 *   compositionAngle: 'three_quarter',
 *   lensType: '85mm',
 *   depthOfField: 'shallow',
 *   photographyStyle: 'minimalism',
 *   colorScheme: 'neutral',
 *   props: ['干花', '书籍'],
 * });
 * ```
 */
