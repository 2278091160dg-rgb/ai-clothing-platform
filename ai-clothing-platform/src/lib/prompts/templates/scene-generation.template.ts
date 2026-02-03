/**
 * 场景生图提示词模板
 */

export interface SceneGenerationParams {
  productDescription: string;
  productCategory?: string;
  material?: string;
  surfaceFinish?: string;
  lightingType?: string;
  lightDirection?: string;
  backgroundType?: string;
  compositionAngle?: string;
  lensType?: string;
  depthOfField?: string;
  photographyStyle?: string;
  colorScheme?: string;
  props?: string[];
}
import {
  getLightingTypeDescription,
  getLightDirectionDescription,
  getBackgroundTypeDescription,
  getCompositionAngleDescription,
  getLensTypeDescription,
  getDepthOfFieldDescription,
  getPhotographyStyleDescription,
  getColorSchemeDescription,
} from './scene-generation-descriptions';

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
