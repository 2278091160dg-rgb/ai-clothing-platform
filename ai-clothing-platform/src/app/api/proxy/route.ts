/**
 * Proxy API Route
 * 代理API路由 - 接收前端请求，转发到飞书和N8N
 *
 * 拆分后结构：
 * - proxy-types: 类型定义
 * - feishu-services: 飞书服务（token、上传、记录）
 * - n8n-forward.service: N8N转发服务
 */

import { NextResponse } from 'next/server';
import type { ProxyResponseData, N8NWebhookPayload } from './proxy-types';
import { getFeishuToken, uploadImageToFeishu, createFeishuRecord } from './feishu-services';
import { forwardToN8N, createN8NErrorResponse } from './n8n-forward.service';

export async function POST(request: Request) {
  console.log('===== 开始处理 API 请求 =====');

  try {
    // === Step 0: 接收前端数据 ===
    const formData = await request.formData();

    // 提取文件
    const productImage = formData.get('product_image') as File | null;
    const sceneImage = formData.get('scene_image') as File | null;

    // 提取其他字段
    const prompt = formData.get('prompt') as string | null;
    const negative_prompt = formData.get('negative_prompt') as string | null;
    const ratio = (formData.get('ratio') as string | null) || '3:4';
    const model = (formData.get('model') as string | null) || 'flux-1.1-pro';
    const mode = (formData.get('mode') as string | null) || 'scene';

    console.log('Step 0: 接收到前端数据:');
    console.log('  - prompt:', prompt);
    console.log('  - productImage:', productImage?.name || 'none');
    console.log('  - sceneImage:', sceneImage?.name || 'none');
    console.log('  - ratio:', ratio);
    console.log('  - model:', model);
    console.log('  - mode:', mode);

    if (!prompt) {
      throw new Error('❌ prompt 参数不能为空');
    }

    // 获取环境变量
    const baseId = process.env.NEXT_PUBLIC_LARK_BASE_ID;
    const tableId = process.env.NEXT_PUBLIC_LARK_TABLE_ID;

    if (!baseId) {
      throw new Error('❌ 环境变量 NEXT_PUBLIC_LARK_BASE_ID 未配置');
    }
    if (!tableId) {
      throw new Error('❌ 环境变量 NEXT_PUBLIC_LARK_TABLE_ID 未配置');
    }

    // === Step 1: 获取飞书 tenant_access_token ===
    const tenantAccessToken = await getFeishuToken();

    // === Step 2: 上传图片到飞书 ===
    let productImageToken: string | undefined;
    let sceneImageToken: string | undefined;

    if (productImage) {
      productImageToken = await uploadImageToFeishu(
        productImage,
        tenantAccessToken,
        baseId,
        'product'
      );
    }

    if (sceneImage) {
      sceneImageToken = await uploadImageToFeishu(sceneImage, tenantAccessToken, baseId, 'scene');
    }

    // === Step 3: 创建飞书多维表格记录 ===
    const recordId = await createFeishuRecord(
      tenantAccessToken,
      baseId,
      tableId,
      prompt,
      negative_prompt,
      ratio,
      model,
      productImageToken,
      sceneImageToken
    );

    // === Step 4: 转发请求给 N8N ===
    const n8nPayload: N8NWebhookPayload = {
      record_id: recordId,
      prompt,
      negative_prompt: negative_prompt || '',
      ratio,
      model,
      mode,
      app_token: baseId,
      table_id: tableId,
      product_image_token: productImageToken,
      scene_image_token: sceneImageToken,
      source: '网页端',
    };

    const n8nResult = await forwardToN8N(n8nPayload, recordId);

    if (!n8nResult.success) {
      return createN8NErrorResponse(500, n8nResult.error || 'Unknown N8N error', recordId);
    }

    console.log('===== 全流程完成 =====');

    const responseData: ProxyResponseData = {
      success: true,
      message: 'Workflow started successfully',
      feishu_record_id: recordId,
      product_image_token: productImageToken,
      scene_image_token: sceneImageToken,
      n8n_response: n8nResult.n8nResponse,
    };

    return NextResponse.json(responseData);
  } catch (error: unknown) {
    console.error('❌ API 路由内部崩溃:', error);
    console.error('   错误堆栈:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
