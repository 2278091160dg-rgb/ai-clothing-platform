/**
 * 数据库初始化 API
 * 用于在生产环境中初始化 Supabase 数据库表结构
 */

import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_LOGIN_CONFIG } from '@/config/login-defaults';

export async function POST(req: NextRequest) {
  try {
    console.log('[Init DB] Starting database initialization...');

    // 动态导入 prisma
    const { prisma } = await import('@/lib/prisma');

    // 检查数据库连接
    console.log('[Init DB] Testing database connection...');
    try {
      await prisma.$connect();
      console.log('[Init DB] ✓ Database connection successful');
    } catch (error: any) {
      console.error('[Init DB] ✗ Database connection failed:', error);
      return NextResponse.json(
        {
          success: false,
          error: '数据库连接失败',
          details: `无法连接到 Supabase 数据库。请检查 DATABASE_URL 环境变量。\n错误: ${error.message}`,
        },
        { status: 500 }
      );
    }

    // 尝试创建默认配置（Prisma 会自动创建表）
    console.log('[Init DB] Creating default config...');
    try {
      const config = await prisma.loginPageConfig.upsert({
        where: { id: 'default-config' },
        update: {},
        create: {
          id: 'default-config',
          ...DEFAULT_LOGIN_CONFIG,
          backgroundImageUrl: DEFAULT_LOGIN_CONFIG.backgroundImageUrl || null,
          isActive: true,
        },
      });
      console.log('[Init DB] ✓ Default config created:', config.id);
    } catch (error: any) {
      console.error('[Init DB] ✗ Failed to create config:', error);
      return NextResponse.json(
        {
          success: false,
          error: '创建配置失败',
          details: `Prisma 无法创建表或记录。\n错误: ${error.message}\n\n请确保 Supabase 项目已创建，且 DATABASE_URL 配置正确。`,
        },
        { status: 500 }
      );
    }

    // 验证配置是否成功创建
    const verifyConfig = await prisma.loginPageConfig.findUnique({
      where: { id: 'default-config' },
    });

    if (!verifyConfig) {
      throw new Error('配置创建后无法读取');
    }

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: '✅ 数据库初始化成功！',
      data: {
        configId: verifyConfig.id,
        title: verifyConfig.title,
      },
    });
  } catch (error: any) {
    console.error('[Init DB] Initialization failed:', error);

    // 尝试断开连接
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.$disconnect();
    } catch (e) {
      // 忽略断开连接的错误
    }

    return NextResponse.json(
      {
        success: false,
        error: '数据库初始化失败',
        details: error.message || '未知错误',
        hint: '请检查：1) Supabase 项目是否已创建 2) DATABASE_URL 环境变量是否正确 3) 数据库密码是否正确',
      },
      { status: 500 }
    );
  }
}

// GET 方法用于检查数据库状态
export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma');

    await prisma.$connect();

    const config = await prisma.loginPageConfig.findFirst({
      where: { isActive: true },
    });

    await prisma.$disconnect();

    if (config) {
      return NextResponse.json({
        success: true,
        initialized: true,
        message: '数据库已初始化',
        data: {
          id: config.id,
          title: config.title,
          logoEmoji: config.logoEmoji,
        },
      });
    } else {
      return NextResponse.json({
        success: true,
        initialized: false,
        message: '数据库未初始化，需要点击初始化按钮',
      });
    }
  } catch (error: any) {
    console.error('[Init DB] Check failed:', error);

    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.$disconnect();
    } catch (e) {
      // 忽略断开连接的错误
    }

    return NextResponse.json(
      {
        success: false,
        initialized: false,
        error: '数据库检查失败',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
