/**
 * Upload API Route
 * 处理图片上传并返回 Base64 编码
 * Vercel 兼容：不使用本地文件系统
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/upload - 上传图片并返回 Base64
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // 验证文件大小（限制 10MB）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // 将文件转换为 Base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // 返回 Base64 数据 URI
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      success: true,
      dataUrl,
      fileName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('[API] Failed to upload file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload - 健康检查
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'upload-api',
    version: '2.0',
    description: '图片上传 API - 返回 Base64 格式（Vercel 兼容）',
  });
}
