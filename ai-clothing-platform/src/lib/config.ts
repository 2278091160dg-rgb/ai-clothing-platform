/**
 * API配置管理
 * 管理前端可见的品牌配置和N8N配置
 * 所有敏感信息（API tokens等）都在后端环境变量中
 */

import type { ApiConfig } from './types';

const DEFAULT_CONFIG: ApiConfig = {
  brandTitle: 'AI场景图生成器',
  brandSubtitle: '智能电商商拍工具',
  brandIcon: '🎨',
  // N8N默认配置（可以从环境变量读取，也支持用户自定义）
  n8nWebhookUrl: '',
  deerApiEndpoint: '',
  deerApiKey: '',
};

const CONFIG_KEY = 'ai_platform_config';

export class ConfigManager {
  /**
   * 获取配置
   */
  static getConfig(): ApiConfig {
    if (typeof window === 'undefined') {
      return DEFAULT_CONFIG;
    }

    // 客户端：从localStorage读取
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    }

    return DEFAULT_CONFIG;
  }

  /**
   * 保存配置到localStorage
   */
  static saveConfig(config: Partial<ApiConfig>): void {
    if (typeof window === 'undefined') return;

    const current = this.getConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
  }

  /**
   * 清除配置
   */
  static clearConfig(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CONFIG_KEY);
  }

  /**
   * 检查N8N配置是否完整
   */
  static hasN8nConfig(): boolean {
    const config = this.getConfig();
    return !!config.n8nWebhookUrl;
  }

  /**
   * 检查DeerAPI配置是否完整
   */
  static hasDeerApiConfig(): boolean {
    const config = this.getConfig();
    return !!(config.deerApiEndpoint && config.deerApiKey);
  }

  /**
   * 系统始终可用（后端配置了N8N和飞书）
   */
  static isConfigured(): boolean {
    return true;
  }
}
