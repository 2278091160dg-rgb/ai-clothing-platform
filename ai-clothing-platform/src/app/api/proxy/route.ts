import { NextResponse } from 'next/server';

interface FeishuCreateRecordResponse {
  code: number;
  msg: string;
  data?: {
    record?: {
      record_id: string;
    };
  };
}

interface FeishuMediaUploadResponse {
  code: number;
  msg: string;
  data?: {
    file_token: string;
  };
}

interface N8NWebhookPayload {
  record_id: string;
  prompt: string;
  negative_prompt?: string;
  ratio?: string;
  model?: string;
  mode?: string;
  app_token: string;
  table_id: string;
  product_image_token?: string;
  scene_image_token?: string;
  source?: string;
}

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

    // === Step 1: 获取飞书 tenant_access_token ===
    console.log('Step 1: 开始获取飞书 tenant_access_token...');

    const appId = process.env.LARK_APP_ID;
    const appSecret = process.env.LARK_APP_SECRET;
    const baseId = process.env.NEXT_PUBLIC_LARK_BASE_ID;

    if (!appId || !appSecret) {
      throw new Error('❌ 环境变量 LARK_APP_ID 或 LARK_APP_SECRET 未配置');
    }
    if (!baseId) {
      throw new Error('❌ 环境变量 NEXT_PUBLIC_LARK_BASE_ID 未配置');
    }

    console.log('  - App ID:', appId);
    console.log('  - Base ID:', baseId);

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
    console.log('  - Token API 响应状态:', tokenResponse.status);

    if (!tokenResponse.ok || tokenData.code !== 0) {
      throw new Error(`❌ 获取 tenant_access_token 失败: ${tokenData.msg || '未知错误'}`);
    }

    const tenantAccessToken = tokenData.tenant_access_token;
    console.log('✅ Step 1 完成 - tenant_access_token 获取成功');

    // === Step 2: 上传图片到飞书 ===
    let productImageToken: string | undefined;
    let sceneImageToken: string | undefined;

    const uploadImageToFeishu = async (file: File, imageType: string): Promise<string> => {
      console.log(
        `Step 2.${imageType}: 开始上传${imageType === 'product' ? '商品' : '场景'}图片...`
      );

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log(`  - 文件名: ${file.name}`);
      console.log(`  - 文件大小: ${file.size} bytes`);
      console.log(`  - 文件类型: ${file.type}`);

      // 使用 bitable_image 类型上传到当前 Bitable
      const boundary = `----FormDataBoundary${Date.now()}`;

      // 构建完整的 multipart body
      const chunks: Buffer[] = [];

      // 添加各个参数字段
      const fields = {
        file_name: file.name,
        parent_type: 'bitable_image',
        parent_node: baseId, // 使用 baseId 作为 parent_node
        size: file.size.toString(),
      };

      for (const [key, value] of Object.entries(fields)) {
        let fieldPart = `--${boundary}\r\n`;
        fieldPart += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
        fieldPart += `${value}\r\n`;
        chunks.push(Buffer.from(fieldPart));
      }

      // 添加文件
      let fileHeader = `--${boundary}\r\n`;
      fileHeader += `Content-Disposition: form-data; name="file"; filename="${file.name}"\r\n`;
      fileHeader += `Content-Type: ${file.type || 'image/png'}\r\n\r\n`;

      chunks.push(Buffer.from(fileHeader));
      chunks.push(buffer);
      chunks.push(Buffer.from(`\r\n--${boundary}--\r\n`));

      const fullBody = Buffer.concat(chunks);

      console.log(`  - 请求体大小: ${fullBody.length} bytes`);
      console.log(`  - 参数:`, fields);

      const uploadResponse = await fetch(
        'https://open.feishu.cn/open-apis/drive/v1/medias/upload_all',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tenantAccessToken}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
          },
          body: fullBody,
        }
      );

      const uploadData = (await uploadResponse.json()) as FeishuMediaUploadResponse;
      console.log(`  - 上传 API 响应状态:`, uploadResponse.status);
      console.log(`  - 上传 API 响应数据:`, uploadData);

      if (!uploadResponse.ok || uploadData.code !== 0) {
        throw new Error(
          `❌ 上传${imageType === 'product' ? '商品' : '场景'}图片失败: ${uploadData.msg || '未知错误'} (code: ${uploadData.code})`
        );
      }

      const fileToken = uploadData.data?.file_token;
      if (!fileToken) {
        throw new Error(`❌ 飞书返回成功但未提供 ${imageType} file_token`);
      }

      console.log(
        `✅ Step 2.${imageType} 完成 - ${imageType === 'product' ? '商品' : '场景'}图片上传成功, file_token =`,
        fileToken
      );
      return fileToken;
    };

    if (productImage) {
      productImageToken = await uploadImageToFeishu(productImage, 'product');
    }

    if (sceneImage) {
      sceneImageToken = await uploadImageToFeishu(sceneImage, 'scene');
    }

    // === Step 3: 创建飞书多维表格记录 ===
    console.log('Step 3: 开始创建飞书多维表格记录...');

    const tableId = process.env.NEXT_PUBLIC_LARK_TABLE_ID;
    if (!tableId) {
      throw new Error('❌ 环境变量 NEXT_PUBLIC_LARK_TABLE_ID 未配置');
    }

    console.log('  - Table ID:', tableId);

    // 构建记录字段
    const recordFields: Record<string, unknown> = {
      提示词: prompt,
      反向提示词: negative_prompt || '',
      尺寸比例: ratio,
      AI模型: model,
      状态: '待处理',
      来源: '网页端',
    };

    // 如果有商品图片，添加到字段
    if (productImageToken) {
      recordFields['商品图片'] = [{ file_token: productImageToken }];
    }

    // 如果有场景图片，添加到字段
    if (sceneImageToken) {
      recordFields['场景图'] = [{ file_token: sceneImageToken }];
    }

    console.log('  - 记录字段:', recordFields);
    console.log('  - 来源标识: 网页端');

    const createResponse = await fetch(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${baseId}/tables/${tableId}/records`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tenantAccessToken}`,
        },
        body: JSON.stringify({ fields: recordFields }),
      }
    );

    const createData = (await createResponse.json()) as FeishuCreateRecordResponse;
    console.log('  - 创建记录 API 响应状态:', createResponse.status);
    console.log('  - 创建记录 API 响应数据:', createData);

    if (!createResponse.ok || createData.code !== 0) {
      throw new Error(`❌ 创建飞书记录失败: ${createData.msg || '未知错误'}`);
    }

    const recordId = createData.data?.record?.record_id;
    if (!recordId) {
      throw new Error('❌ 飞书返回成功但未提供 record_id');
    }

    console.log('✅ Step 3 完成 - 飞书记录创建成功, record_id =', recordId);

    // === Step 4: 转发请求给 N8N ===
    console.log('Step 4: 转发请求给 N8N...');

    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nUrl) {
      throw new Error('❌ 环境变量 N8N_WEBHOOK_URL 未配置');
    }

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

    console.log('  - N8N Webhook URL:', n8nUrl);
    console.log('  - 发送给 N8N 的数据:', n8nPayload);

    const n8nResponse = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload),
    });

    const n8nResponseText = await n8nResponse.text();
    console.log('  - N8N 响应状态:', n8nResponse.status);
    console.log('  - N8N 响应内容:', n8nResponseText);

    if (!n8nResponse.ok) {
      console.error(`❌ N8N 返回错误 [${n8nResponse.status}]:`, n8nResponseText);
      return NextResponse.json(
        {
          error: `N8N Error: ${n8nResponse.status}`,
          details: n8nResponseText,
          feishu_record_id: recordId,
        },
        { status: n8nResponse.status }
      );
    }

    // 解析 N8N 响应
    let n8nData;
    try {
      n8nData = JSON.parse(n8nResponseText);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e) {
      n8nData = { message: n8nResponseText };
    }

    console.log('✅ Step 4 完成 - N8N 请求成功');
    console.log('===== 全流程完成 =====');

    return NextResponse.json({
      success: true,
      message: 'Workflow started successfully',
      feishu_record_id: recordId,
      product_image_token: productImageToken,
      scene_image_token: sceneImageToken,
      n8n_response: n8nData,
    });
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
