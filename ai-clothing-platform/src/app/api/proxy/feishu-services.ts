/**
 * Feishu Services
 * 飞书相关服务 - token获取、图片上传、记录创建
 */

import type { FeishuCreateRecordResponse, FeishuMediaUploadResponse } from './proxy-types';

/**
 * 获取飞书 tenant_access_token
 */
export async function getFeishuToken(): Promise<string> {
  console.log('开始获取飞书 tenant_access_token...');

  const appId = process.env.LARK_APP_ID;
  const appSecret = process.env.LARK_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('❌ 环境变量 LARK_APP_ID 或 LARK_APP_SECRET 未配置');
  }

  console.log('  - App ID:', appId);

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
  console.log('✅ tenant_access_token 获取成功');
  return tenantAccessToken;
}

/**
 * 上传图片到飞书
 */
export async function uploadImageToFeishu(
  file: File,
  tenantAccessToken: string,
  baseId: string,
  imageType: 'product' | 'scene'
): Promise<string> {
  console.log(`开始上传${imageType === 'product' ? '商品' : '场景'}图片...`);

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
    parent_node: baseId,
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

  console.log(`✅ ${imageType === 'product' ? '商品' : '场景'}图片上传成功, file_token =`, fileToken);
  return fileToken;
}

/**
 * 创建飞书多维表格记录
 */
export async function createFeishuRecord(
  tenantAccessToken: string,
  baseId: string,
  tableId: string,
  prompt: string,
  negativePrompt: string | null,
  ratio: string,
  model: string,
  productImageToken?: string,
  sceneImageToken?: string
): Promise<string> {
  console.log('开始创建飞书多维表格记录...');
  console.log('  - Table ID:', tableId);

  // 构建记录字段
  const recordFields: Record<string, unknown> = {
    提示词: prompt,
    反向提示词: negativePrompt || '',
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

  console.log('✅ 飞书记录创建成功, record_id =', recordId);
  return recordId;
}
