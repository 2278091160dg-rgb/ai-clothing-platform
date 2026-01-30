/**
 * Upload API Route - Vercel Compatible
 * 使用 Base64 编码存储图片（适合小图片，< 5MB）
 *
 * 注意：生产环境建议使用 Vercel Blob 或其他云存储服务
 */

import { NextRequest, NextResponse } from 'next/server';

// 简单的内存存储（部署后每次重启会清空）
const uploadedFiles = new Map<
  string,
  {
    data: string;
    contentType: string;
    timestamp: number;
  }
>();

// 清理过期文件（每小时执行一次）
setInterval(
  () => {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 小时

    for (const [key, value] of uploadedFiles.entries()) {
      if (now - value.timestamp > maxAge) {
        uploadedFiles.delete(key);
      }
    }
  },
  60 * 60 * 1000
);

/**
 * POST /api/upload - 上传图片（Vercel 兼容版本）
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

    // 验证文件大小（限制 5MB，因为使用 base64）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // 转换为 base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileKey = `${timestamp}-${randomStr}`;

    // 存储到内存
    uploadedFiles.set(fileKey, {
      data: base64,
      contentType: file.type,
      timestamp: Date.now(),
    });

    // 返回可访问的 URL
    const url = `/api/upload/file/${fileKey}`;

    return NextResponse.json({
      success: true,
      url,
      fileName: file.name,
      fileKey,
    });
  } catch (error) {
    console.error('[API] Failed to upload file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
