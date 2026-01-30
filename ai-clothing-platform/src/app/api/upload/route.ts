/**
 * Upload API Route
 * 上传图片到飞书 Drive API
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToDrive } from '@/lib/services/lark.service';

/**
 * POST /api/upload - 上传图片到飞书 Drive
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ code: -1, msg: '未提供文件' }, { status: 400 });
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ code: -1, msg: '文件类型错误' }, { status: 400 });
    }

    // 上传到飞书 Drive
    const { fileToken } = await uploadFileToDrive(file);

    return NextResponse.json({
      code: 0,
      data: { file_token: fileToken },
    });
  } catch (error) {
    console.error('[API] Failed to upload file:', error);
    return NextResponse.json(
      {
        code: -1,
        msg: '上传失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload - 健康检查
 */
export async function GET() {
  return NextResponse.json({
    code: 0,
    service: 'upload-api',
    version: '3.0',
    description: '图片上传 API - 飞书 Drive',
  });
}
