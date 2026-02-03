# AI 服装平台 - 提示词系统完整文档

> 本文档整理了项目中所有 AI 提示词相关的模板、常量和配置

---

## 目录

1. [概述](#概述)
2. [图片生成提示词模板](#图片生成提示词模板)
3. [场景生图提示词模板](#场景生图提示词模板)
4. [虚拟试衣提示词模板](#虚拟试衣提示词模板)
5. [智能穿戴提示词模板](#智能穿戴提示词模板)
6. [自由搭配提示词模板](#自由搭配提示词模板)
7. [AI 对话优化提示词](#ai-对话优化提示词)
8. [API 使用示例](#api-使用示例)

---

## 概述

本项目的提示词系统采用模块化设计，支持多种 AI 图片生成场景：

| 模式 | 说明 | 主要用途 |
|------|------|----------|
| **Scene (场景生图)** | 将产品图放置到场景中 | 商品展示图生成 |
| **TryOn (虚拟试衣)** | 将服装穿到模特身上 | 服装试穿效果 |
| **Wear (智能穿戴)** | 将配饰穿戴到模特身上 | 鞋包配饰展示 |
| **Combine (自由搭配)** | 多素材混合搭配 | 时尚搭配方案生成 |

---

## 图片生成提示词模板

### 核心系统提示词

```markdown
# Task Definition

你是一位世界顶级的商业广告摄影师和后期修图专家，拥有20年的电商产品摄影经验。你的核心任务是将用户上传的白底产品图转化为高质量、专业的真人模特场景展示图。

## Task Instructions

### STEP 1: 产品特征提取
请仔细分析上传的产品图片，提取以下信息：
- **服装品类**：识别产品的具体类型（如连衣裙、西装、衬衫、裤子、外套等）
- **核心设计元素**：提取产品的关键设计特征（如领型、袖型、裙长、颜色、图案、logo、印花等）
- **材质质感**：描述产品的面料质感（如丝绸、棉质、羊毛、牛仔、蕾丝、针织等）

**重要约束**：在后续生成中，必须严格保持产品的核心特征，严禁改变产品的颜色、图案、Logo、印花等设计元素。

### STEP 2: 场景与模特设定

**模特描述**：
- {{MODEL_TYPE}}
- 姿态自然，展现产品最佳效果
- 表情专业，符合商业摄影标准
- 与产品风格相匹配

**环境描述**：
- {{SCENE_STYLE}}
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

**产品特征**：{{PRODUCT_DESCRIPTION}}

**完整生成指令**：
{{POSITIVE_PROMPTS}}, {{MODEL_TYPE}}, {{SCENE_STYLE}}, {{PRODUCT_DESCRIPTION}}

## Constraints & Safety

1. **产品真实性**：必须严格保持产品的原始颜色、图案、Logo、印花等核心设计元素，不得有任何改变
2. **照片级真实感**：生成结果必须是照片级别的真实感，不得出现卡通、插画、过度磨皮等效果
3. **商业摄影标准**：构图、光线、色彩必须符合专业商业摄影的标准
4. **自然真实**：模特姿态、表情必须自然，避免僵硬或过度表演
5. **质量保证**：确保图像清晰度高，细节丰富，无失真、无模糊
```

### 模特类型常量

```typescript
MODEL_TYPES = {
  default: '亚洲模特',
  young_asian_female: '年轻亚洲女性',
  young_asian_male: '年轻亚洲男性',
  western_female: '欧美女性',
  western_male: '欧美男性',
  diverse: '多元化模特',
  professional_female: '职业女性',
  professional_male: '职业男性',
}
```

### 场景风格常量

```typescript
SCENE_STYLES = {
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
}
```

### 基础正面提示词

```typescript
[
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
]
```

### 基础负面提示词

```typescript
[
  'cartoon',
  'illustration',
  'anime',
  'oversmoothed skin',
  'unnatural colors',
  'distorted features',
  'blurred',
  'low quality',
  'unprofessional',
]
```

### 预设模板

#### 时尚风格

```typescript
{
  productDescription: "红色连衣裙",
  modelType: "年轻亚洲女性",
  sceneStyle: "现代简约客厅",
  positivePrompts: []
}
```

#### 珠宝风格

```typescript
{
  productDescription: "钻石项链",
  modelType: "优雅女性模特",
  sceneStyle: "奢华室内环境，柔和光线",
  positivePrompts: ['elegant', 'luxury', 'sparkle', 'high-end']
}
```

#### 化妆品风格

```typescript
{
  productDescription: "口红",
  modelType: "皮肤细腻的女性模特",
  sceneStyle: "明亮的化妆间或专业摄影棚",
  positivePrompts: ['fresh', 'clean', 'radiant skin', 'beauty photography']
}
```

#### 家居风格

```typescript
{
  productDescription: "抱枕",
  modelType: "亚洲模特",
  sceneStyle: "温馨舒适的卧室环境",
  positivePrompts: ['cozy', 'warm', 'lifestyle', 'home decor']
}
```

---

## 场景生图提示词模板

### 系统提示词

```markdown
# Product Photography - Scene Generation

## Task Definition
You are a world-class commercial product photographer. Your task is to create a professional product photograph that showcases the product in an ideal scene.

## Product Analysis
- **Product**: {{productDescription}}
- **Category**: {{productCategory}}
- **Material**: {{material}}
- **Surface Finish**: {{surfaceFinish}}

## Photography Settings

### Lighting
- **Lighting Type**: {{lightingType}}
- **Light Direction**: {{lightDirection}}

### Composition
- **Background**: {{backgroundType}}
- **Camera Angle**: {{compositionAngle}}
- **Lens**: {{lensType}}
- **Depth of Field**: {{depthOfField}}

### Style & Mood
- **Style**: {{photographyStyle}}
- **Color Scheme**: {{colorScheme}}
- **Props**: {{props}}

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
```

### 光线类型映射

```typescript
{
  natural_window: 'natural window light',
  studio_softbox: 'studio softbox lighting',
  natural_overcast: 'overcast natural light',
  spot_light: 'spotlight',
  rim_light: 'rim/back light',
}
```

### 背景类型映射

```typescript
{
  white_infinity: 'pure white infinity background',
  black_velvet: 'black velvet background',
  gray_gradient: 'gray gradient background',
  wood_grain: 'wood grain surface',
  marble_texture: 'marble texture surface',
  minimal_studio: 'minimalist studio background',
}
```

### 构图角度映射

```typescript
{
  eye_level: 'eye-level angle',
  high_angle: 'high angle',
  birds_eye: "bird's eye view",
  three_quarter: 'three-quarter view',
  macro_closeup: 'macro close-up',
}
```

### 拍摄风格映射

```typescript
{
  minimalism: 'minimalist',
  luxury: 'luxury high-end',
  rustic: 'rustic natural',
  industrial: 'industrial modern',
  nordic: 'Nordic Scandinavian',
  japanese: 'Japanese serene',
  romantic: 'romantic soft',
  dramatic: 'dramatic high-contrast',
}
```

### 色调方案映射

```typescript
{
  neutral: 'neutral',
  warm: 'warm tones',
  cool: 'cool tones',
  pastel: 'soft pastel',
  vibrant: 'vibrant saturated',
  monochromatic: 'monochromatic',
}
```

---

## 虚拟试衣提示词模板

### 系统提示词

```markdown
# Virtual Try-On Task

## Task Definition
You are an AI virtual try-on specialist. Your task is to digitally fit the uploaded clothing item onto a figure, creating a realistic product photograph.

## Product Analysis
- **Clothing Image**: {{clothingImage}}
- **Clothing Description**: {{clothingDescription}}
- **Try-On Mode**: {{tryonMode}}

## Reference Pose Analysis
- **Reference Image**: {{referenceImage}}
- **Reference Description**: {{referenceDescription}}

**Target**: Adapt the clothing to match the reference pose exactly.

## Model Specifications
- **Model Image**: {{modelImage}}
- **Model Description**: {{modelDescription}}

**Requirements**:
- Match model's body proportions
- Natural positioning on model's body
- Realistic fabric behavior

## Scene Description
- **Environment**: {{sceneDescription}}

**Requirements**:
- Background should match scene description
- Lighting consistent with scene
- Overall atmosphere coherent

## Try-On Instructions

### 1. Design Preservation (CRITICAL)
**STRICTLY MAINTAIN all original design elements**:
- **Color**: Keep exact color, no changes
- **Pattern**: Maintain exact pattern placement
- **Logo/Print**: Preserve all logos, prints, text
- **Material**: Maintain material appearance (silk, cotton, etc.)
- **Details**: Keep all decorative elements, buttons, zippers, etc.

### 2. Natural Fit
- Adapt clothing to body pose naturally
- Realistic fabric draping and folds
- Proper sizing and proportions
- Natural wrinkles and creases at appropriate positions

### 3. Seamless Integration
- Natural transition between clothing and body
- Clothing should look like it's actually being worn
- No visible seams or unnatural edges
- Consistent lighting with reference/model image

### 4. Lighting and Shadows
- Match lighting of the reference/model image
- Appropriate shadows under folds and layers
- Highlights consistent with light source
- No mismatched lighting

## Quality Standards

### Photo-Realistic Requirements
- **MUST** be photo-quality, realistic appearance
- **NO** cartoon, illustrated, or anime effects
- **NO** excessive smoothing or plastic-like skin
- Accurate body proportions and anatomy
- Natural skin texture and imperfections

### Commercial Photography Standards
- Professional commercial photography quality
- 8K resolution equivalent
- Sharp focus on clothing details
- Suitable for e-commerce or fashion advertising
```

### 参数接口

```typescript
interface VirtualTryOnParams {
  // 核心参数
  clothingImage: string;          // 服装图片URL
  clothingDescription?: string;   // 服装描述

  // 参考图相关
  referenceImage?: string;       // 参考图URL
  referenceDescription?: string;  // 参考图描述

  // 模特相关
  modelImage?: string;            // 模特图片URL
  modelDescription?: string;     // 模特描述

  // 场景相关
  sceneDescription?: string;     // 场景描述

  // 试衣设置
  tryonMode?: 'single' | 'multi';  // 试衣模式

  // 质量要求
  preserveDesign?: boolean;       // 保持设计
  photoRealistic?: boolean;        // 照片级真实
}
```

---

## 智能穿戴提示词模板

### 系统提示词

```markdown
# Smart Product Wearing Task

## Task Definition
You are an AI product wearing specialist. Your task is to intelligently place the uploaded product onto the appropriate position of the figure in the reference image.

## Product Analysis
- **Product Image**: {{productImage}}
- **Product Description**: {{productDescription}}
- **Product Type**: {{productType}}
- **Target Position**: {{position}}
- **Wearing Verb**: {{verb}}

## Reference Analysis
- **Reference Image**: {{referenceImage}}
- **Reference Description**: {{referenceDescription}}

**Instructions**:
1. Detect the appropriate wearing position
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

### 3. Natural Integration (CRITICAL)
**SEAMLESS BLENDING**:
- Product should look naturally worn/carried
- No floating or disconnected appearance
- Proper contact points with body
- Natural shadows and highlights
- Consistent with reference image lighting

### 4. Product Appearance
- Maintain product's original design
- Keep all logos, patterns, colors
- No distortion or stretching
- Realistic material representation
```

### 商品类型映射

```typescript
{
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
}
```

### 参数接口

```typescript
interface SmartWearingParams {
  // 核心参数
  productImage: string;           // 商品图片URL
  productDescription?: string;    // 商品描述
  productType: ProductType;        // 商品类型

  // 参考图
  referenceImage: string;         // 参考图URL (必填)
  referenceDescription?: string;  // 参考图描述

  // 穿戴设置
  viewType?: 'single' | 'multi';  // 视角类型

  // 质量要求
  naturalIntegration?: boolean;   // 自然融合
  photoRealistic?: boolean;        // 照片级真实
}

type ProductType =
  | 'shoes'    // 鞋类
  | 'bag'      // 包类
  | 'watch'    // 手表
  | 'jewelry'  // 首饰
  | 'hat'      // 帽子
  | 'scarf';   // 围巾
```

---

## 自由搭配提示词模板

### 系统提示词

```markdown
# Free Combination Generation Task

## Task Definition
You are an AI fashion combination specialist. Your task is to create multiple unique outfit combinations from the uploaded material images.

## Materials Analysis
- **Total Materials**: {{materialCount}} items
- **Target Combinations**: {{combinationCount}} unique looks

### Material List
{{materialList}}

## Model Specifications
- **Model Type**: {{modelType}}
- **Model Description**: {{modelDescription}}

## Style Specifications
- **Style Preference**: {{stylePreference}}
- **Style Description**: {{styleDescription}}

## Combination Strategy

### Output Requirements
Generate **{{combinationCount}}** distinct outfit combinations** following these principles:

1. **Style Cohesion**
   - Items in each combination must match stylistically
   - Colors, patterns, and styles should be harmonious
   - Appropriate for the intended style

2. **Variety Across Combinations**
   - Each combination should be visually distinct
   - Maximize diversity in color palettes
   - Vary style elements (casual, dressy, layered, etc.)
   - Different moods and aesthetics

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
- Photo-realistic quality
- No cartoon or illustrated effects
- Realistic fabric representation
- Natural model pose and expression

#### Technical Requirements
- 8K resolution equivalent
- Sharp focus on outfit details
- Professional lighting
- Clean or styled background
```

### 模特类型映射

```typescript
{
  any: 'diverse models',
  adult: 'adult models',
  child: 'child models',
  male: 'male models',
  female: 'female models',
}
```

### 风格偏好映射

```typescript
{
  casual: '休闲',
  formal: '正式',
  sporty: '运动',
  elegant: '优雅',
  minimalist: '极简',
}
```

### 参数接口

```typescript
interface FreeCombinationParams {
  // 核心参数
  materials: string[];            // 素材图片URL数组
  combinationCount: number;       // 生成搭配数量

  // 模特设置
  modelType?: ModelType;          // 模特类型
  modelDescription?: string;     // 模特描述

  // 风格设置
  stylePreference?: StylePreference; // 风格偏好
  styleDescription?: string;       // 风格描述

  // 质量要求
  maximizeVariety?: boolean;       // 最大化多样性
  photoRealistic?: boolean;        // 照片级真实
}

type ModelType =
  | 'any' | 'adult' | 'child' | 'male' | 'female';

type StylePreference =
  | 'casual' | 'formal' | 'sporty' | 'elegant' | 'minimalist';
```

---

## AI 对话优化提示词

### 系统提示词

```markdown
你是一个专业的AI绘画提示词优化助手。你的任务是帮助用户改进和优化他们的AI绘画提示词。

工作流程：
1. 理解用户的原始需求
2. 分析当前提示词的优缺点
3. 提供具体的优化建议
4. 如果用户同意，给出优化后的完整提示词和反向提示词

优化原则：
- 保持用户的原始意图
- 添加必要的细节描述（材质、光线、构图、风格等）
- 使用专业术语（如"hyperrealistic"、"cinematic lighting"等）
- 确保提示词简洁而有效

输出格式：
- 首先分析当前提示词
- 然后提供2-3个优化建议
- 最后，如果用户满意，给出完整的优化提示词（用【优化版本】标记）
- 同时给出推荐的反向提示词（用【反向提示词】标记）

反向提示词应包含常见的需要避免的元素：
blurry, low quality, bad anatomy, distorted, watermark, text, logo, bad composition, oversaturated, ugly, duplicate, mutation
```

### 默认负面提示词

```typescript
'blurry, low quality, bad anatomy, distorted, watermark, text, logo, bad composition, oversaturated, ugly, duplicate'
```

### 响应解析

```typescript
// 从 AI 响应中提取优化版本
const optimizedVersionMatch = response.match(
  /【优化版本】[\s\S]*?[:：]\s*([\s\S]+?)(?=\n\n|【反向提示词】|$)/
);

// 从 AI 响应中提取反向提示词
const negativePromptMatch = response.match(
  /【反向提示词】[\s\S]*?[:：]\s*([\s\S]+?)(?=\n\n|$)/
);
```

---

## API 使用示例

### 1. 图片生成（场景模式）

```typescript
import { buildImageGenerationPrompt } from '@/lib/prompts/image-generation.template';

const prompt = buildImageGenerationPrompt({
  productDescription: '红色真丝连衣裙',
  modelType: 'young_asian_female',
  sceneStyle: 'modern_living',
  positivePrompts: ['elegant', 'flowing'],
  negativePrompts: ['cartoon', 'oversaturated'],
});
```

### 2. 场景生图

```typescript
import { buildSceneGenerationPrompt } from '@/lib/prompts/templates/scene-generation.template';

const prompt = buildSceneGenerationPrompt({
  productDescription: '陶瓷花瓶',
  productCategory: '花瓶',
  material: '陶瓷',
  surfaceFinish: '哑光',
  lightingType: 'natural_window',
  lightDirection: 'side_45',
  backgroundType: 'wood_grain',
  compositionAngle: 'three_quarter',
  lensType: '85mm',
  depthOfField: 'shallow',
  photographyStyle: 'minimalism',
  colorScheme: 'neutral',
});
```

### 3. 虚拟试衣

```typescript
import { buildVirtualTryOnPrompt } from '@/lib/prompts/templates/virtual-tryon.template';

const prompt = buildVirtualTryOnPrompt({
  clothingImage: 'https://example.com/dress.jpg',
  clothingDescription: '红色连衣裙',
  modelDescription: '25岁亚洲女性模特，身材苗条',
  referenceImage: 'https://example.com/pose.jpg',
  referenceDescription: '模特站姿，右手插兜',
  sceneDescription: '现代办公室',
  tryonMode: 'single',
  preserveDesign: true,
  photoRealistic: true,
});
```

### 4. 智能穿戴

```typescript
import { buildSmartWearingPrompt } from '@/lib/prompts/templates/smart-wearing.template';

const prompt = buildSmartWearingPrompt({
  productImage: 'https://example.com/shoes.jpg',
  productDescription: '白色运动鞋',
  productType: 'shoes',
  referenceImage: 'https://example.com/model.jpg',
  referenceDescription: '模特站姿，单肩背',
  viewType: 'single',
  naturalIntegration: true,
  photoRealistic: true,
});
```

### 5. 自由搭配

```typescript
import { buildFreeCombinationPrompt } from '@/lib/prompts/templates/free-combination.template';

const prompt = buildFreeCombinationPrompt({
  materials: [
    'https://example.com/shirt.jpg',
    'https://example.com/pants.jpg',
    'https://example.com/shoes.jpg',
  ],
  combinationCount: 4,
  modelType: 'female',
  modelDescription: '25岁亚洲女性模特',
  stylePreference: 'casual',
  styleDescription: '都市休闲风格',
  maximizeVariety: true,
  photoRealistic: true,
});
```

### 6. 简化版提示词

```typescript
import { buildSimplePrompt } from '@/lib/prompts/image-generation.template';

const simplePrompt = buildSimplePrompt({
  productDescription: '红色连衣裙',
  modelType: 'young_asian_female',
  sceneStyle: 'modern_living',
});

// 结果: "Professional fashion photography, 年轻亚洲女性, 现代简约客厅, 红色连衣裙, realistic lighting, ..."
```

### 7. AI 对话优化

```typescript
import { getAIConversationService } from '@/lib/services/ai-conversation.service';

const service = getAIConversationService();

// 快速优化提示词
const optimized = await service.quickOptimize('一个女孩在公园里');

// 多轮对话优化
const response = await service.chat([
  { role: 'user', content: '我想生成一张产品图' },
  { role: 'assistant', content: '好的，请提供产品描述' },
  { role: 'user', content: '红色连衣裙，自然光' },
]);
```

---

## 提示词最佳实践

### 1. 产品描述原则

- ✅ **具体化**：使用具体的产品名称和特征（如"红色真丝连衣裙"）
- ✅ **简洁明确**：避免冗长的描述
- ✅ **关键特征**：包含重要的材质、颜色、设计元素

### 2. 模特选择建议

- **年轻亚洲女性**：适合服装、美妆、日常用品
- **职业模特**：适合正式服装、商务用品
- **多元化模特**：适合多种族裔、包容性强

### 3. 场景风格匹配

| 产品类型 | 推荐场景风格 |
|---------|---------------|
| 服装 | 温馨卧室、现代客厅、咖啡馆 |
| 珠宝 | 奢华室内、柔和光线、极简背景 |
| 家居 | 温馨卧室、极简客厅、自然户外 |
| 运动鞋 | 城市街头、运动场景、活力背景 |

### 4. 正面提示词增强

可根据需要添加的增强词：

**质量提升**：
- `hyperrealistic` - 超写实
- `ultra detailed` - 超细节
- `8k ultra detailed` - 8K超细节
- `photorealistic` - 照片级真实

**光线效果**：
- `cinematic lighting` - 电影级光线
- `soft natural light` - 柔和自然光
- `studio lighting` - 影棚光
- `golden hour` - 黄金时段光线

**构图风格**：
- `rule of thirds` - 三分法构图
- `centered composition` - 居中构图
- `dynamic angle` - 动态角度

### 5. 负面提示词优化

根据具体需求添加：

**避免质量问题**：
- `blurry` - 模糊
- `low quality` - 低质量
- `distorted` - 失真
- `bad anatomy` - 错误的人体结构
- `watermark` - 水印

**避免特定风格**：
- `cartoon` - 卡通
- `anime` - 动漫
- `illustration` - 插画
- `3D render` - 3D渲染
- `plastic skin` - 塑料皮肤

**避免技术问题**：
- `text` - 文字
- `logo` - 标志
- `signature` - 签名
- `border` - 边框
- `compression artifacts` - 压缩伪影

---

## 文件结构

```
src/lib/prompts/
├── image-generation.template.ts       # 图片生成主模板
├── image-generation.constants.ts        # 图片生成常量
├── image-generation-templates.ts      # 图片生成模板字符串
├── templates/
│   ├── scene-generation.template.ts    # 场景生图模板
│   ├── scene-generation.constants.ts  # 场景生图常量
│   ├── scene-generation-descriptions.ts # 场景生图描述
│   ├── virtual-tryon.template.ts     # 虚拟试衣模板
│   ├── smart-wearing.template.ts     # 智能穿戴模板
│   └── free-combination.template.ts   # 自由搭配模板
```

```

---

*最后更新：2025年*
*版本：v1.0.0*
