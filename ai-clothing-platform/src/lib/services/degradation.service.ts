/**
 * DegradationService - 多级降级策略
 * 当外部服务不可用时，实现优雅降级
 */

import type {
  ServiceStatus,
  ServiceType,
  ServiceHealth,
  DegradationLevel,
} from './degradation/degradation.types';
import { DEGRADATION_LEVELS } from './degradation/degradation.types';
import { HEALTH_CHECKERS } from './degradation/degradation.health-checkers';
import { updateServiceHealth, recalculateDegradationLevel } from './degradation/degradation-utils';

export type { ServiceStatus, ServiceType, ServiceHealth, DegradationLevel };

interface ServiceHealthInternal extends ServiceHealth {
  status: ServiceStatus;
  lastCheck: number;
  failureCount: number;
  lastError?: string;
}

export class DegradationService {
  private serviceHealth: Map<ServiceType, ServiceHealthInternal> = new Map();
  private degradationLevel = 0;
  private checkIntervals: Map<ServiceType, NodeJS.Timeout> = new Map();
  private degradationLevels = DEGRADATION_LEVELS;

  constructor() {
    this.initializeServiceHealth();
  }

  /**
   * 初始化服务健康状态
   */
  private initializeServiceHealth() {
    const services: ServiceType[] = ['feishu', 'n8n', 'database'];

    services.forEach(service => {
      this.serviceHealth.set(service, {
        status: 'healthy',
        lastCheck: Date.now(),
        failureCount: 0,
      });
    });
  }

  /**
   * 开始监控服务健康
   */
  startMonitoring() {
    console.log('[Degradation] Starting service health monitoring');

    // 每30秒检查一次服务健康
    this.checkServiceHealth('feishu');
    this.checkServiceHealth('n8n');
    this.checkServiceHealth('database');

    Object.entries({
      feishu: 30000,
      n8n: 30000,
      database: 10000,
    }).forEach(([service, interval]) => {
      const timer = setInterval(() => {
        this.checkServiceHealth(service as ServiceType);
      }, interval);
      this.checkIntervals.set(service as ServiceType, timer);
    });
  }

  /**
   * 停止监控
   */
  stopMonitoring() {
    this.checkIntervals.forEach(timer => clearInterval(timer));
    this.checkIntervals.clear();
  }

  /**
   * 检查服务健康状态
   */
  private async checkServiceHealth(service: ServiceType) {
    try {
      const healthChecker = HEALTH_CHECKERS[service];
      const isHealthy = await healthChecker();

      updateServiceHealth(this.serviceHealth, service, isHealthy);
      this.degradationLevel = recalculateDegradationLevel(
        this.serviceHealth,
        this.degradationLevel,
        this.degradationLevels
      );
    } catch (error) {
      console.error(`[Degradation] Error checking ${service} health:`, error);
      updateServiceHealth(this.serviceHealth, service, false);
      this.degradationLevel = recalculateDegradationLevel(
        this.serviceHealth,
        this.degradationLevel,
        this.degradationLevels
      );
    }
  }

  /**
   * 获取当前降级级别
   */
  getDegradationLevel(): DegradationLevel {
    return this.degradationLevels[this.degradationLevel];
  }

  /**
   * 获取服务健康状态
   */
  getServiceHealth(service: ServiceType): ServiceHealth {
    return (
      this.serviceHealth.get(service) || {
        status: 'down',
        lastCheck: 0,
        failureCount: 0,
      }
    );
  }

  /**
   * 获取所有服务健康状态
   */
  getAllServiceHealth(): Record<ServiceType, ServiceHealth> {
    return Object.fromEntries(this.serviceHealth) as Record<ServiceType, ServiceHealth>;
  }

  /**
   * 判断是否应该执行降级操作
   */
  shouldDegrade(service: ServiceType): boolean {
    const health = this.serviceHealth.get(service);
    return health?.status !== 'healthy';
  }

  /**
   * 获取建议的重试延迟（指数退避）
   */
  getRetryDelay(service: ServiceType, attempt: number): number {
    const health = this.serviceHealth.get(service);

    if (health?.status === 'down') {
      return Math.min(1000 * Math.pow(2, attempt), 60000); // 最大1分钟
    } else if (health?.status === 'degraded') {
      return Math.min(500 * Math.pow(2, attempt), 30000); // 最大30秒
    }

    return 1000 * attempt; // 正常情况：线性增长
  }
}

// 创建单例实例
let degradationServiceInstance: DegradationService | null = null;

export function getDegradationService(): DegradationService {
  if (!degradationServiceInstance) {
    degradationServiceInstance = new DegradationService();
  }
  return degradationServiceInstance;
}

/**
 * 在应用启动时启动监控
 */
export function initializeDegradationMonitoring() {
  const service = getDegradationService();
  service.startMonitoring();

  // 优雅关闭
  if (typeof process !== 'undefined') {
    process.on('beforeExit', () => {
      service.stopMonitoring();
    });
  }

  console.log('[Degradation] Monitoring initialized');
}
