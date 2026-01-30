/**
 * 数据库连接诊断 API
 * 用于检查数据库连接状态和诊断问题
 */

import { NextResponse } from 'next/server';

interface DiagnosticTest {
  name: string;
  status: 'running' | 'success' | 'failed';
  result: string;
  url?: string;
  host?: string;
  hint?: string;
  error?: string;
  count?: number;
}

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    tests: [] as DiagnosticTest[],
  };

  try {
    // 测试 1: 检查环境变量
    diagnostics.tests.push({
      name: '环境变量检查',
      status: 'running',
      result: '检查中...',
    });

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      diagnostics.tests[0].status = 'failed';
      diagnostics.tests[0].result = 'DATABASE_URL 环境变量未设置';
      diagnostics.tests[0].hint = '请在 Vercel Dashboard 中设置 DATABASE_URL 环境变量';
    } else {
      // 隐藏密码部分
      const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
      diagnostics.tests[0].status = 'success';
      diagnostics.tests[0].result = 'DATABASE_URL 已设置';
      diagnostics.tests[0].url = maskedUrl;
      diagnostics.tests[0].host = dbUrl.split('@')[1]?.split('/')[0];
    }

    // 测试 2: 尝试连接数据库
    diagnostics.tests.push({
      name: '数据库连接测试',
      status: 'running',
      result: '连接中...',
    });

    const { prisma } = await import('@/lib/prisma');

    try {
      await prisma.$connect();
      diagnostics.tests[1].status = 'success';
      diagnostics.tests[1].result = '✅ 数据库连接成功';

      // 测试 3: 检查表是否存在
      diagnostics.tests.push({
        name: '表结构检查',
        status: 'running',
        result: '检查中...',
      });

      try {
        const count = await prisma.loginPageConfig.count();
        diagnostics.tests[2].status = 'success';
        diagnostics.tests[2].result = `✅ 表存在，当前有 ${count} 条配置记录`;
      } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'P2021') {
          diagnostics.tests[2].status = 'failed';
          diagnostics.tests[2].result = '❌ 表不存在';
          diagnostics.tests[2].hint = "需要点击'初始化数据库'按钮创建表";
        } else {
          throw error;
        }
      }

      await prisma.$disconnect();
    } catch (error) {
      diagnostics.tests[1].status = 'failed';
      diagnostics.tests[1].result = '❌ 数据库连接失败';
      diagnostics.tests[1].error = error instanceof Error ? error.message : String(error);

      // 分析常见错误
      if (error instanceof Error && 'code' in error && error.code === 'P1001') {
        diagnostics.tests[1].hint =
          '无法连接到数据库服务器。可能原因：1) Supabase 项目未暂停 2) 连接字符串错误 3) 网络防火墙';
      } else if (error instanceof Error && 'code' in error && error.code === 'P3007') {
        diagnostics.tests[1].hint = '数据库认证失败。请检查密码是否正确';
      } else if (error instanceof Error && 'code' in error && error.code === 'P3A000') {
        diagnostics.tests[1].hint = '连接被拒绝。可能数据库正在重启或连接数已达上限';
      }
    }

    return NextResponse.json({
      success: true,
      diagnostics,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: '诊断失败',
        diagnostics,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
