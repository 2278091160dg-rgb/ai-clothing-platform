/**
 * 图片代理 API - 解决飞书图片跨域问题
 * GET /api/image-proxy?url=xxx
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    console.log('🖼️ 代理图片请求:', imageUrl);

    // 获取飞书 token
    const appId = process.env.LARK_APP_ID;
    const appSecret = process.env.LARK_APP_SECRET;

    if (!appId || !appSecret) {
      throw new Error('飞书配置未设置');
    }

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
      throw new Error(`获取 token 失败: ${tokenData.msg}`);
    }

    const tenantAccessToken = tokenData.tenant_access_token;

    // 代理获取图片
    const imageResponse = await fetch(imageUrl, {
      headers: {
        Authorization: `Bearer ${tenantAccessToken}`,
      },
    });

    if (!imageResponse.ok) {
      throw new Error(`获取图片失败: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    console.log('✅ 图片代理成功:', contentType, 'size:', imageBuffer.byteLength);

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('❌ 图片代理失败:', error);
    return NextResponse.json(
      { error: 'Failed to proxy image', details: error.message },
      { status: 500 }
    );
  }
}
