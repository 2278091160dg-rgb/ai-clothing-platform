/**
 * Records API - 获取飞书多维表格记录
 * GET /api/records - 获取所有任务记录（按创建时间倒序）
 */

import { NextResponse } from 'next/server';

interface FeishuListRecordsResponse {
  code: number;
  msg: string;
  data?: {
    items?: Array<{
      record_id: string;
      record_id_v2: string;
      fields: Record<string, unknown>;
      created_time: number;
    }>;
    has_more: boolean;
    page_token: string;
  };
}

interface TaskRecord {
  record_id: string;
  prompt: string;
  status: string;
  productImageUrl?: string;
  sceneImageUrl?: string;
  resultImageUrl?: string;
  negativePrompt?: string;
  ratio?: string;
  model?: string;
  created_time: number;
  source?: string; // '网页端' or '表格端'
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: Request) {
  console.log('===== 开始获取记录列表 =====');

  try {
    // === Step 1: 获取飞书 tenant_access_token ===
    const appId = process.env.LARK_APP_ID;
    const appSecret = process.env.LARK_APP_SECRET;
    const baseId = process.env.NEXT_PUBLIC_LARK_BASE_ID;
    const tableId = process.env.NEXT_PUBLIC_LARK_TABLE_ID;

    if (!appId || !appSecret || !baseId || !tableId) {
      throw new Error('❌ 飞书配置环境变量未设置');
    }

    // 获取 tenant_access_token
    const tokenResponse = await fetch(
      'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: appId,
          app_secret: appSecret,
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || tokenData.code !== 0) {
      throw new Error(`获取 token 失败: ${tokenData.msg || '未知错误'}`);
    }

    const tenantAccessToken = tokenData.tenant_access_token;

    // === Step 2: 获取多维表格记录 ===
    // 按 created_time 倒序排列
    const listUrl = new URL(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${baseId}/tables/${tableId}/records`
    );

    listUrl.searchParams.set('page_size', '100');
    // 不要使用 order_by，因为 created_time 字段可能不可用
    // listUrl.searchParams.set("order_by", "[{\"field_name\":\"created_time\",\"desc\":true}]");

    const listResponse = await fetch(listUrl.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tenantAccessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const listData = (await listResponse.json()) as FeishuListRecordsResponse;
    console.log('  - 记录数量:', listData.data?.items?.length || 0);

    // 🔍 打印完整飞书响应（前3条记录）
    if (listData.data?.items && listData.data.items.length > 0) {
      console.log('===== 飞书原始数据样例 =====');
      console.log('样例记录1:', JSON.stringify(listData.data.items[0], null, 2));
      if (listData.data.items.length > 1) {
        console.log('样例记录2:', JSON.stringify(listData.data.items[1], null, 2));
      }
      console.log('========================');
    }

    if (!listResponse.ok || listData.code !== 0) {
      throw new Error(`获取记录失败: ${listData.msg || '未知错误'}`);
    }

    // === Step 3: 转换为前端格式并过滤脏数据 ===
    const records: TaskRecord[] = [];

    for (const item of listData.data?.items || []) {
      const fields = item.fields;

      // 🔍 调试：打印每条记录的所有字段
      const rawStatus = fields['状态'] as string;
      const allFieldNames = Object.keys(fields);
      console.log('📋 处理记录:', {
        record_id: item.record_id,
        来源: fields['来源'],
        提示词: (fields['提示词'] as string)?.slice(0, 30),
        原始状态: rawStatus,
        所有字段名: allFieldNames,
        字段数量: allFieldNames.length,
      });

      // 如果状态是"完成"，打印完整数据结构
      if (rawStatus === '完成' || rawStatus === '已完成') {
        console.log('  🎉 已完成任务完整数据:', JSON.stringify(fields, null, 2));
      }

      // 🔧 临时禁用来源过滤，显示所有记录
      // const source = (fields['来源'] as string) || '';
      // if (source !== '网页端') {
      //   continue; // 跳过非网页端创建的记录
      // }

      // 提取提示词
      const prompt = (fields['提示词'] as string) || '';
      if (!prompt || prompt.trim() === '') {
        console.log('  ⚠️ 跳过：无提示词');
        continue; // 跳过没有提示词的脏数据
      }

      // 提取商品图片 URL
      const productImageAttachments = fields['商品图片'] as
        | Array<{ file_token: string; url: string }>
        | undefined;
      const productImageUrl =
        productImageAttachments && productImageAttachments.length > 0
          ? productImageAttachments[0].url ||
            `https://open.feishu.cn/open-apis/drive/v1/medias/${productImageAttachments[0].file_token}/download?tenant_access_token=${tenantAccessToken}`
          : undefined;

      // 提取场景图片 URL
      const sceneImageAttachments = fields['场景图'] as
        | Array<{ file_token: string; url: string }>
        | undefined;
      const sceneImageUrl =
        sceneImageAttachments && sceneImageAttachments.length > 0
          ? sceneImageAttachments[0].url ||
            `https://open.feishu.cn/open-apis/drive/v1/medias/${sceneImageAttachments[0].file_token}/download?tenant_access_token=${tenantAccessToken}`
          : undefined;

      // 提取结果图片 URL
      const resultAttachments = fields['生成结果'] as
        | Array<{ file_token: string; url: string }>
        | undefined;
      let resultImageUrl =
        resultAttachments && resultAttachments.length > 0
          ? resultAttachments[0].url ||
            `https://open.feishu.cn/open-apis/drive/v1/medias/${resultAttachments[0].file_token}/download?tenant_access_token=${tenantAccessToken}`
          : undefined;

      // 如果没有生成结果，尝试其他可能的字段名
      if (!resultImageUrl) {
        const altResultAttachments = fields['结果图'] as
          | Array<{ file_token: string; url: string }>
          | undefined;
        if (altResultAttachments && altResultAttachments.length > 0) {
          resultImageUrl =
            altResultAttachments[0].url ||
            `https://open.feishu.cn/open-apis/drive/v1/medias/${altResultAttachments[0].file_token}/download?tenant_access_token=${tenantAccessToken}`;
        }
      }

      // 🔍 调试：打印结果图片信息
      console.log('  📸 结果图片:', {
        has生成结果: !!resultAttachments,
        生成结果length: resultAttachments?.length || 0,
        has结果图: !!fields['结果图'],
        resultImageUrl: resultImageUrl ? 'YES' : 'NO',
      });

      // 验证 created_time 是否有效（必须是有效的时间戳，毫秒级）
      const createdTime = item.created_time;
      const isValidTimestamp =
        createdTime && createdTime > 1000000000000 && createdTime < 4000000000000;

      // 🔧 临时：如果 created_time 无效，使用当前时间
      const finalCreatedTime = isValidTimestamp ? createdTime : Date.now();

      if (!isValidTimestamp) {
        console.log('  ⚠️ 时间戳无效，使用当前时间替代:', createdTime, '->', finalCreatedTime);
      }

      records.push({
        record_id: item.record_id,
        prompt,
        status: (fields['状态'] as string) || '未知',
        productImageUrl,
        sceneImageUrl,
        resultImageUrl,
        negativePrompt: (fields['反向提示词'] as string) || undefined,
        ratio: (fields['尺寸比例'] as string) || undefined,
        model: (fields['AI模型'] as string) || undefined,
        created_time: finalCreatedTime,
        source: (fields['来源'] as string) || undefined,
      });
    }

    console.log('✅ 获取记录成功，返回', records.length, '条记录');

    // 🔍 调试：打印每条记录的关键信息
    console.log('📊 ===== 记录详情 =====');
    records.forEach((record, index) => {
      console.log(`记录 ${index + 1}/${records.length}:`);
      console.log(`  - record_id: ${record.record_id}`);
      console.log(`  - source: ${record.source || '(none)'}`);
      console.log(`  - status: ${record.status}`);
      console.log(`  - resultImageUrl: ${record.resultImageUrl ? 'YES' : 'NO'}`);
      console.log(`  - sceneImageUrl: ${record.sceneImageUrl ? 'YES' : 'NO'}`);
      console.log(`  - productImageUrl: ${record.productImageUrl ? 'YES' : 'NO'}`);
    });
    console.log('==================');

    // 🔍 调试：打印返回给前端的数据样例
    if (records.length > 0) {
      console.log('📤 返回给前端的数据样例:');
      console.log(JSON.stringify(records[0], null, 2));
    }

    return NextResponse.json({
      success: true,
      data: records,
    });
  } catch (error: unknown) {
    console.error('❌ 获取记录失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
