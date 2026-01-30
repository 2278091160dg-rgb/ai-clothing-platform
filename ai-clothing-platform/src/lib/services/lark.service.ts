/**
 * Lark Service - 飞书开放平台集成服务
 */

import * as lark from '@larksuiteoapi/node-sdk';

// 初始化飞书客户端
const client = new lark.Client({
  appId: process.env.LARK_APP_ID || '',
  appSecret: process.env.LARK_APP_SECRET || '',
});

/**
 * 上传文件到飞书 Drive
 */
export async function uploadFileToDrive(file: File): Promise<{ fileToken: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await client.drive.media.uploadAll({
      data: {
        file_name: file.name,
        parent_type: 'base_global',
        parent_node: 'root',
        size: file.size,
        file: buffer,
      },
    }) as unknown as { code?: number; msg?: string; file_token?: string };

    if (result.code !== 0 || !result.file_token) {
      throw new Error(`上传失败: ${result.msg || '未知错误'}`);
    }

    return { fileToken: result.file_token };
  } catch (error) {
    throw new Error(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 在多维表格中创建记录
 */
export async function createBitableRecord(params: {
  productToken: string;
  sceneToken?: string;
  prompt: string;
  negativePrompt?: string;
  ratio: string;
  model: string;
}): Promise<{ recordId: string }> {
  const baseId = process.env.NEXT_PUBLIC_LARK_BASE_ID || '';
  const tableId = process.env.NEXT_PUBLIC_LARK_TABLE_ID || '';
  const appToken = baseId;

  // 构建记录数据
  const fields: Record<string, unknown> = {
    '商品图片': [{ file_token: params.productToken }],
    '提示词': params.prompt,
    '尺寸比例': params.ratio,
    'AI模型': params.model,
    '状态': '待处理',
  };

  if (params.sceneToken) {
    fields['场景图'] = [{ file_token: params.sceneToken }];
  }

  if (params.negativePrompt) {
    fields['反向提示词'] = params.negativePrompt;
  }

  try {
    const response = await client.bitable.appTableRecord.create({
      path: {
        app_token: appToken,
        table_id: tableId,
      },
      data: {
        fields: fields as Record<string, never>,
      },
    }) as unknown as { code?: number; msg?: string; data?: { record?: { record_id?: string } } };

    if (response.code !== 0 || !response.data?.record?.record_id) {
      throw new Error(`创建记录失败: ${response.msg || '未返回 record_id'}`);
    }

    return { recordId: response.data.record.record_id };
  } catch (error) {
    throw new Error(`创建记录失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 查询记录状态
 */
export async function getRecordStatus(recordId: string): Promise<{
  status: string;
  resultUrl: string | null;
}> {
  const baseId = process.env.NEXT_PUBLIC_LARK_BASE_ID || '';
  const tableId = process.env.NEXT_PUBLIC_LARK_TABLE_ID || '';
  const appToken = baseId;

  try {
    const response = await client.bitable.appTableRecord.get({
      path: {
        app_token: appToken,
        table_id: tableId,
        record_id: recordId,
      },
    }) as unknown as { code?: number; msg?: string; data?: { record?: { fields?: Record<string, unknown> } } };

    if (response.code !== 0 || !response.data?.record?.fields) {
      throw new Error(`查询记录失败: ${response.msg || '未知错误'}`);
    }

    const fields = response.data.record.fields as Record<string, unknown>;
    const status = (fields['状态'] as string) || '未知';
    const resultAttachments = fields['生成结果'] as Array<{ url: string }> | undefined;

    let resultUrl: string | null = null;
    if (resultAttachments && resultAttachments.length > 0) {
      resultUrl = resultAttachments[0].url || null;
    }

    return { status, resultUrl };
  } catch (error) {
    throw new Error(`查询记录失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 触发 N8N 工作流
 */
export async function triggerN8nWebhook(params: {
  recordId: string;
  appToken: string;
  tableId: string;
}): Promise<void> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL || '';

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      record_id: params.recordId,
      app_token: params.appToken,
      table_id: params.tableId,
    }),
  });

  if (!response.ok) {
    throw new Error(`触发 N8N 失败: ${response.statusText}`);
  }
}
