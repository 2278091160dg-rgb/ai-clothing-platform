/**
 * 智能穿戴提示词模板
 *
 * 用于将鞋包等配饰智能穿戴到模特身上的提示词
 */

// ==================== 参数接口定义 ====================

export interface SmartWearingParams {
  // === 核心参数 ===
  productImage: string; // 商品图片URL
  productDescription?: string; // 商品描述
  productType: ProductType; // 商品类型

  // === 参考图 ===
  referenceImage: string; // 参考图URL（必填）
  referenceDescription?: string; // 参考图描述

  // === 穿戴设置 ===
  viewType?: 'single' | 'multi'; // 视角类型

  // === 质量要求 ===
  naturalIntegration?: boolean; // 自然融合
  photoRealistic?: boolean; // 照片级真实
}

// ==================== 类型定义 ====================

export type ProductType =
  | 'shoes' // 鞋类
  | 'bag' // 包类
  | 'watch' // 手表
  | 'jewelry' // 首饰
  | 'hat' // 帽子
  | 'scarf'; // 围巾

// ==================== 提示词构建函数 ====================

/**
 * 构建智能穿戴提示词
 *
 * @param params - 智能穿戴参数
 * @returns 完整的提示词
 */
export function buildSmartWearingPrompt(params: SmartWearingParams): string {
  const {
    productImage,
    productDescription = 'product',
    productType,
    referenceImage,
    referenceDescription,
    viewType = 'single',
    naturalIntegration = true,
    photoRealistic = true,
  } = params;

  // 获取商品类型信息
  const typeInfo = getProductTypeInfo(productType);

  const prompt = `# Smart Product Wearing Task

## Task Definition
You are an AI product wearing specialist. Your task is to intelligently place the uploaded product onto the appropriate position of the figure in the reference image.

## Product Analysis
- **Product Image**: ${productImage}
- **Product Description**: ${productDescription}
- **Product Type**: ${productType}
- **Target Position**: ${typeInfo.position}
- **Wearing Verb**: ${typeInfo.verb}

## Reference Analysis
- **Reference Image**: ${referenceImage}
${referenceDescription ? `- **Reference Description**: ${referenceDescription}` : ''}

**Instructions**:
1. Detect the appropriate wearing position (${typeInfo.position})
2. Place product naturally on that position
3. Adapt product size proportionally
4. Orient product to match figure pose

## Wearing Instructions

### 1. Position Detection
- **Shoes**: Place on feet, match foot orientation
- **Bag**: Place on shoulder or in hand, based on bag type
- **Watch**: Place on wrist, natural position
- **Jewelry**: Place on appropriate body part (neck, ear, finger, etc.)
- **Hat**: Place on head, match head orientation
- **Scarf**: Place around neck, drape naturally

### 2. Size Adaptation
- Adjust product size proportionally to figure
- Maintain realistic product-to-body ratio
- No oversized or undersized appearance

### 3. Natural Integration ${naturalIntegration ? '(CRITICAL)' : ''}
${
  naturalIntegration
    ? `
**SEAMLESS BLENDING**:
- Product should look naturally worn/carried
- No floating or disconnected appearance
- Proper contact points with body
- Natural shadows and highlights
- Consistent with reference image lighting
`
    : ''
}

### 4. Product Appearance
- Maintain product's original design
- Keep all logos, patterns, colors
- No distortion or stretching
- Realistic material representation

## Quality Standards
${
  photoRealistic
    ? `
### Photo-Realistic Requirements
- Photo-quality realistic appearance
- No cartoon or illustrated effects
- Accurate material textures (leather, metal, fabric, etc.)
- Natural lighting and shadows
`
    : ''
}

### Commercial Standards
- Professional commercial photography quality
- 8K resolution equivalent
- Sharp focus on product details
- Suitable for e-commerce or advertising

---

## Complete Generation Prompt

Professional product photography, ${typeInfo.category} ${productDescription}, ${typeInfo.verb} by model${referenceDescription ? `, ${referenceDescription}` : ', natural pose'}, ${typeInfo.position} positioning, proper size and proportion${naturalIntegration ? ', natural seamless integration' : ''}${photoRealistic ? ', photo-realistic quality' : ', high quality'}, ${viewType === 'single' ? 'single angle view' : 'multiple angle views'}, realistic material texture, professional lighting, sharp details, 8k resolution, commercial product shot.`;

  return prompt;
}

// ==================== 辅助函数 ====================

interface ProductTypeInfo {
  category: string;
  position: string;
  verb: string;
}

/**
 * 获取商品类型信息
 */
function getProductTypeInfo(type: ProductType): ProductTypeInfo {
  const typeMap: Record<ProductType, ProductTypeInfo> = {
    shoes: {
      category: 'footwear',
      position: 'on feet',
      verb: 'being worn',
    },
    bag: {
      category: 'accessory',
      position: 'on shoulder or carried in hand',
      verb: 'being carried',
    },
    watch: {
      category: 'accessory',
      position: 'on wrist',
      verb: 'being worn',
    },
    jewelry: {
      category: 'accessory',
      position: 'on body',
      verb: 'being worn',
    },
    hat: {
      category: 'accessory',
      position: 'on head',
      verb: 'being worn',
    },
    scarf: {
      category: 'accessory',
      position: 'around neck',
      verb: 'being worn',
    },
  };

  return typeMap[type];
}

// ==================== 使用示例 ====================

/**
 * 使用示例
 *
 * ```typescript
 * import { buildSmartWearingPrompt } from '@/lib/prompts/templates/smart-wearing.template';
 *
 * // 示例1：鞋子穿戴
 * const prompt1 = buildSmartWearingPrompt({
 *   productImage: 'https://example.com/shoes.jpg',
 *   productDescription: '白色运动鞋',
 *   productType: 'shoes',
 *   referenceImage: 'https://example.com/model.jpg',
 * });
 *
 * // 示例2：包包穿戴
 * const prompt2 = buildSmartWearingPrompt({
 *   productImage: 'https://example.com/bag.jpg',
 *   productDescription: '黑色手提包',
 *   productType: 'bag',
 *   referenceImage: 'https://example.com/model.jpg',
 *   referenceDescription: '模特站姿，单肩背',
 *   viewType: 'single',
 * });
 *
 * // 示例3：手表穿戴
 * const prompt3 = buildSmartWearingPrompt({
 *   productImage: 'https://example.com/watch.jpg',
 *   productDescription: '瑞士机械手表',
 *   productType: 'watch',
 *   referenceImage: 'https://example.com/model.jpg',
 *   naturalIntegration: true,
 *   photoRealistic: true,
 * });
 * ```
 */
