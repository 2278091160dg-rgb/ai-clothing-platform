/**
 * Degradation Utils
 * 降级服务工具函数
 */

import { getEventBus } from '../../events/event-bus';
import type { ServiceType, DegradationLevel } from './degradation.types';
import { DEGRADATION_LEVELS } from './degradation.types';

interface ServiceHealthInternal {
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: number;
  failureCount: number;
  lastError?: string;
}

/**
 * 更新服务健康状态
 */
export function updateServiceHealth(
  serviceHealth: Map<ServiceType, ServiceHealthInternal>,
  service: ServiceType,
  isHealthy: boolean
) {
  const health = serviceHealth.get(service)!;

  if (isHealthy) {
    health.status = 'healthy';
    health.failureCount = 0;
    health.lastError = undefined;
  } else {
    health.failureCount++;
    health.lastError = new Date().toISOString();

    // 根据失败次数确定状态
    if (health.failureCount >= 5) {
      health.status = 'down';
    } else if (health.failureCount >= 2) {
      health.status = 'degraded';
    }
  }

  health.lastCheck = Date.now();

  console.log(
    `[Degradation] ${service} status: ${health.status} (failures: ${health.failureCount})`
  );
}

/**
 * 重新计算降级级别
 */
export function recalculateDegradationLevel(
  serviceHealth: Map<ServiceType, ServiceHealthInternal>,
  currentLevel: number,
  degradationLevels: DegradationLevel[]
): number {
  const services = Array.from(serviceHealth.values());
  const downCount = services.filter(s => s.status === 'down').length;
  const degradedCount = services.filter(s => s.status === 'degraded').length;

  let newLevel = 0;

  if (downCount >= 2) {
    newLevel = 3; // 严重降级
  } else if (downCount >= 1 || degradedCount >= 2) {
    newLevel = 2; // 中度降级
  } else if (degradedCount >= 1) {
    newLevel = 1; // 轻微降级
  }

  if (newLevel !== currentLevel) {
    console.log(`[Degradation] Level changed: ${currentLevel} → ${newLevel}`);

    // 发布降级事件
    const eventBus = getEventBus();
    eventBus.emit('degradation.level_changed', {
      level: newLevel,
      config: degradationLevels[newLevel],
      timestamp: Date.now(),
    });
  }

  return newLevel;
}
