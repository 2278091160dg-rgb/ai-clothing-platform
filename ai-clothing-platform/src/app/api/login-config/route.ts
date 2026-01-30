/**
 * Login Page Configuration API
 * 获取和更新登录页面配置
 * 本地使用 SQLite，生产使用 Supabase
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_LOGIN_CONFIG } from '@/config/login-defaults';
import type { PrismaClient } from '@prisma/client';

// GET - 获取登录页面配置
export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma');

    const config = await prisma.loginPageConfig.findFirst({
      where: { isActive: true },
    });

    await prisma.$disconnect();

    if (config) {
      return NextResponse.json({ success: true, data: config });
    }

    // 返回默认配置
    return NextResponse.json({
      success: true,
      data: DEFAULT_LOGIN_CONFIG,
    });
  } catch (error) {
    console.error('[API] Get login config error:', error);
    return NextResponse.json({
      success: true,
      data: DEFAULT_LOGIN_CONFIG,
    });
  }
}

// PUT - 更新登录页面配置
export async function PUT(req: NextRequest) {
  let prismaInstance: PrismaClient | null = null;
  try {
    const body = await req.json();
    const {
      logoUrl,
      logoEmoji,
      title,
      subtitle1,
      subtitle2,
      passwordLabel,
      passwordPlaceholder,
      buttonText,
      buttonLoadingText,
      footerText,
      copyrightText,
      backgroundImageUrl,
      backgroundStyle,
    } = body;

    const { prisma: prismaImport } = await import('@/lib/prisma');
    prismaInstance = prismaImport;

    const existingConfig = await prismaInstance.loginPageConfig.findFirst({
      where: { isActive: true },
    });

    let result;
    if (existingConfig) {
      result = await prismaInstance.loginPageConfig.update({
        where: { id: existingConfig.id },
        data: {
          ...(logoUrl !== undefined && { logoUrl }),
          ...(logoEmoji !== undefined && { logoEmoji }),
          ...(title !== undefined && { title }),
          ...(subtitle1 !== undefined && { subtitle1 }),
          ...(subtitle2 !== undefined && { subtitle2 }),
          ...(passwordLabel !== undefined && { passwordLabel }),
          ...(passwordPlaceholder !== undefined && { passwordPlaceholder }),
          ...(buttonText !== undefined && { buttonText }),
          ...(buttonLoadingText !== undefined && { buttonLoadingText }),
          ...(footerText !== undefined && { footerText }),
          ...(copyrightText !== undefined && { copyrightText }),
          ...(backgroundImageUrl !== undefined && { backgroundImageUrl }),
          ...(backgroundStyle !== undefined && { backgroundStyle }),
          updatedAt: new Date(),
        },
      });
    } else {
      result = await prismaInstance.loginPageConfig.create({
        data: {
          logoUrl: logoUrl || null,
          logoEmoji: logoEmoji || DEFAULT_LOGIN_CONFIG.logoEmoji,
          title: title || DEFAULT_LOGIN_CONFIG.title,
          subtitle1: subtitle1 || DEFAULT_LOGIN_CONFIG.subtitle1,
          subtitle2: subtitle2 || DEFAULT_LOGIN_CONFIG.subtitle2,
          passwordLabel: passwordLabel || DEFAULT_LOGIN_CONFIG.passwordLabel,
          passwordPlaceholder: passwordPlaceholder || DEFAULT_LOGIN_CONFIG.passwordPlaceholder,
          buttonText: buttonText || DEFAULT_LOGIN_CONFIG.buttonText,
          buttonLoadingText: buttonLoadingText || DEFAULT_LOGIN_CONFIG.buttonLoadingText,
          footerText: footerText || DEFAULT_LOGIN_CONFIG.footerText,
          copyrightText: copyrightText || DEFAULT_LOGIN_CONFIG.copyrightText,
          backgroundImageUrl: backgroundImageUrl || null,
          backgroundStyle: backgroundStyle || DEFAULT_LOGIN_CONFIG.backgroundStyle,
          isActive: true,
        },
      });
    }

    await prismaInstance.$disconnect();

    return NextResponse.json({
      success: true,
      data: result,
      message: '配置保存成功！',
    });
  } catch (error: unknown) {
    console.error('[API] Update login config error:', error);

    if (prismaInstance) {
      try {
        await prismaInstance.$disconnect();
      } catch (_e) {
        // 忽略断开连接的错误
      }
    }

    const errorMessage = error instanceof Error ? error.message : '未知错误';

    return NextResponse.json(
      {
        success: false,
        error: '保存配置失败',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
