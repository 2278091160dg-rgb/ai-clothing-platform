/**
 * Get Uploaded File API
 * 返回已上传的图片（Base64 格式）
 */

import { NextRequest, NextResponse } from 'next/server';

// 简单的内存存储（与 upload/vercel-route.ts 共享）
const uploadedFiles = new Map<
  string,
  {
    data: string;
    contentType: string;
    timestamp: number;
  }
>();

// 导出存储供其他模块使用
export { uploadedFiles };

/**
 * GET /api/upload/file/:fileKey - 获取已上传的文件
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ fileKey: string }> }) {
  try {
    const { fileKey } = await params;

    const file = uploadedFiles.get(fileKey);

    if (!file) {
      return NextResponse.json({ error: 'File not found or expired' }, { status: 404 });
    }

    // 返回 base64 图片
    return new NextResponse(Buffer.from(file.data, 'base64'), {
      headers: {
        'Content-Type': file.contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[API] Failed to get file:', error);
    return NextResponse.json({ error: 'Failed to get file' }, { status: 500 });
  }
}
