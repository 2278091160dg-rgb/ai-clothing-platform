/**
 * Degradation Health Checkers
 * 服务健康检查器
 */

import type { ServiceType } from './degradation.types';

/**
 * 检查飞书服务健康
 */
export async function checkFeishuHealth(): Promise<boolean> {
  try {
    const { getFeishuService } = await import('../feishu.service');
    const feishuService = getFeishuService();

    // 尝试获取访问令牌
    await feishuService.getAccessToken();
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查n8n服务健康
 */
export async function checkN8nHealth(): Promise<boolean> {
  try {
    const { getN8nService } = await import('../n8n.service');
    const n8nService = getN8nService();

    return await n8nService.healthCheck();
  } catch {
    return false;
  }
}

/**
 * 检查数据库健康
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { prisma } = await import('../../prisma');
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

/**
 * 服务健康检查映射
 */
export const HEALTH_CHECKERS: Record<ServiceType, () => Promise<boolean>> = {
  feishu: checkFeishuHealth,
  n8n: checkN8nHealth,
  database: checkDatabaseHealth,
};
