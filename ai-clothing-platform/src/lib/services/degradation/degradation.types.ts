/**
 * Degradation Types
 * 降级服务类型定义
 */

export type ServiceStatus = 'healthy' | 'degraded' | 'down';
export type ServiceType = 'feishu' | 'n8n' | 'database';

export interface ServiceHealth {
  status: ServiceStatus;
  lastCheck: number;
  failureCount: number;
  lastError?: string;
}

export interface DegradationLevel {
  level: number;
  name: string;
  description: string;
  actions: string[];
}

/**
 * 降级级别定义
 */
export const DEGRADATION_LEVELS: DegradationLevel[] = [
  {
    level: 0,
    name: '正常',
    description: '所有服务正常运行',
    actions: [],
  },
  {
    level: 1,
    name: '轻微降级',
    description: '部分服务响应慢，启用队列缓冲',
    actions: ['飞书同步写入队列', 'n8n调用增加超时时间', '显示服务降级提示'],
  },
  {
    level: 2,
    name: '中度降级',
    description: '部分服务不可用，启用本地缓存',
    actions: ['飞书同步暂停，仅写入PostgreSQL', '禁用实时进度推送', '启用定时重试机制'],
  },
  {
    level: 3,
    name: '严重降级',
    description: '核心服务不可用，仅保留基本功能',
    actions: ['仅允许只读操作', '显示紧急维护通知', '记录所有失败操作到队列'],
  },
];
