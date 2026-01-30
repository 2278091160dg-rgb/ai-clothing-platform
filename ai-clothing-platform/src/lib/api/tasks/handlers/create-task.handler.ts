/**
 * Create Task Handler
 * 处理任务创建请求 - 支持4种生成模式
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTaskRepository } from '@/lib/repositories/task.repository';
import { getN8nService } from '@/lib/services/n8n.service';
import { eventPublisher } from '@/lib/events/handlers';
import { initializeApp } from '@/lib/app-initialization';
import { ensureDefaultUser, getDefaultUserId, formatErrorResponse } from '../../tasks-api.utils';

// ==================== 类型定义 ====================

/**
 * 生成模式类型
 */
export type GenerationMode = 'scene' | 'tryon' | 'wear' | 'combine';

/**
 * 创建任务请求 - 支持所有模式
 */
export interface CreateTaskRequest {
  // === 通用参数 ===
  mode: GenerationMode;
  userId?: string;
  callbackUrl?: string;

  // === 场景生图参数 ===
  productImageUrl?: string;
  sceneImageUrl?: string;
  prompt?: string;
  negativePrompt?: string;

  // === 虚拟试衣参数 ===
  clothingImageUrl?: string;
  clothingDescription?: string;
  tryonReferenceImageUrl?: string;
  tryonModelImageUrl?: string;
  modelDescription?: string;
  sceneDescription?: string;
  tryonMode?: 'single' | 'multi';

  // === 智能穿戴参数 ===
  wearProductImageUrl?: string;
  wearProductDescription?: string;
  wearReferenceImageUrl?: string;
  wearReferenceDescription?: string;
  productType?: 'shoes' | 'bag' | 'watch' | 'jewelry' | 'hat' | 'scarf';
  viewType?: 'single' | 'multi';

  // === 自由搭配参数 ===
  materialImageUrls?: string[];
  combinationCount?: number;
  modelType?: 'any' | 'adult' | 'child' | 'male' | 'female';
  stylePreference?: 'casual' | 'formal' | 'sporty' | 'elegant' | 'minimalist';

  // === 通用生成参数 ===
  aiModel?: string;
  aspectRatio?: string;
  imageCount?: number;
  quality?: string;
  batchId?: string;
  deerApiKey?: string;
}

// ==================== 提示词构建函数 ====================

/**
 * 构建场景生图提示词
 */
function buildScenePrompt(params: CreateTaskRequest): string {
  return params.prompt || 'Product photography';
}

/**
 * 构建虚拟试衣提示词
 */
function buildTryOnPrompt(params: CreateTaskRequest): string {
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
function buildWearPrompt(params: CreateTaskRequest): string {
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
function buildCombinePrompt(params: CreateTaskRequest): string {
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
function buildPromptByMode(params: CreateTaskRequest): string {
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

// ==================== 主处理函数 ====================

/**
 * 处理 POST /api/tasks 请求
 */
export async function handleCreateTask(req: NextRequest) {
  try {
    // 初始化应用（确保飞书监听器已注册）
    initializeApp();

    console.log('=== [API] 收到任务创建请求 ===');

    // 确保默认用户存在
    await ensureDefaultUser();
    const userId = getDefaultUserId();

    // 解析请求体
    console.log('[API] 解析请求体...');
    const body = await req.json();
    const { mode, aiModel = 'Gemini-3-Pro-Image', aspectRatio = '3:4' } = body;

    console.log('[API] 生成模式:', mode);

    // 验证mode参数
    if (!mode || !['scene', 'tryon', 'wear', 'combine'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid or missing mode parameter' }, { status: 400 });
    }

    // 根据mode验证必填字段
    const validation = validateRequestByMode(body);
    if (!validation.valid) {
      console.log('[API] ❌', validation.error);
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    console.log('[API] ✅ 请求验证通过');
    console.log('[API] 初始化 TaskRepository...');
    const taskRepo = getTaskRepository();
    console.log('[API] ✅ TaskRepository 初始化成功');

    console.log('[API] 创建数据库记录...');
    // 创建任务记录
    const task = await taskRepo.create({
      userId,
      mode,
      // 存储所有模式相关的字段
      ...body,
      aiModel,
      aspectRatio,
      imageCount: body.imageCount || 4,
      quality: body.quality || 'high',
      batchId: body.batchId,
    });
    console.log('[API] ✅ 任务创建成功:', { id: task.id, mode, status: task.status });

    // 发布任务创建事件
    try {
      eventPublisher.taskCreated({
        taskId: task.id,
        userId,
        data: { mode, ...body },
      });
      console.log('[API] ✅ 事件发布成功');
    } catch (eventError) {
      console.error('[API] ⚠️  事件发布失败:', eventError);
    }

    // 构建提示词
    const finalPrompt = buildPromptByMode(body);
    console.log('[API] 提示词长度:', finalPrompt.length);

    // 触发N8N工作流
    try {
      const n8nService = getN8nService();
      console.log('[API] N8N 服务初始化成功');

      // 确定回调 URL
      const finalCallbackUrl =
        body.callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/n8n/callback`;

      await n8nService.triggerGeneration({
        taskId: task.id,
        userId,
        mode,
        prompt: finalPrompt,
        // 传递所有原始参数
        ...body,
        aiModel,
        aspectRatio,
        imageCount: body.imageCount || 4,
        quality: body.quality || 'high',
        deerApiKey: body.deerApiKey,
        callbackUrl: finalCallbackUrl,
      });
      console.log('[API] ✅ N8N 工作流触发成功，mode:', mode);
    } catch (n8nError) {
      console.error('[API] ⚠️  N8N 工作流触发失败:', n8nError);
    }

    return NextResponse.json({
      success: true,
      task: {
        id: task.id,
        mode,
        status: task.status,
        createdAt: task.createdAt,
      },
    });
  } catch (error) {
    console.error('=== [API] ❌ 任务创建失败 ===');
    const errorResponse = formatErrorResponse(error, true);
    console.log('[API] 返回错误响应:', errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * 根据mode验证请求
 */
function validateRequestByMode(body: CreateTaskRequest): {
  valid: boolean;
  error?: string;
} {
  switch (body.mode) {
    case 'scene':
      if (!body.productImageUrl) {
        return { valid: false, error: '商品图不能为空' };
      }
      break;

    case 'tryon':
      if (!body.clothingImageUrl) {
        return { valid: false, error: '服装图不能为空' };
      }
      break;

    case 'wear':
      if (!body.wearProductImageUrl || !body.wearReferenceImageUrl) {
        return { valid: false, error: '商品图和参考图不能为空' };
      }
      break;

    case 'combine':
      if (!body.materialImageUrls || body.materialImageUrls.length === 0) {
        return { valid: false, error: '素材图不能为空' };
      }
      break;

    default:
      return { valid: false, error: '无效的生成模式' };
  }

  return { valid: true };
}
