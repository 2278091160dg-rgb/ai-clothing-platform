/**
 * useBrandConfig - 品牌配置管理 Hook
 */

import { useState, useCallback, useEffect } from 'react';
import { ConfigManager } from '@/lib/config';

interface BrandConfig {
  title: string;
  subtitle: string;
  icon: string;
  logoImage?: string;
}

const DEFAULT_BRAND_CONFIG: BrandConfig = {
  title: 'AI场景图生成器',
  subtitle: '智能电商商拍工具',
  icon: '🎨',
  logoImage: undefined,
};

export function useBrandConfig() {
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(DEFAULT_BRAND_CONFIG);

  const loadBrandConfig = useCallback(() => {
    const config = ConfigManager.getConfig();
    const newBrandConfig = {
      title: config.brandTitle || 'AI场景图生成器',
      subtitle: config.brandSubtitle || '智能电商商拍工具',
      icon: config.brandIcon || '🎨',
      logoImage: config.brandLogoImage,
    };
    setBrandConfig(newBrandConfig);

    // 更新页面标题
    if (config.brandTitle) {
      document.title = `${config.brandTitle} - 智能电商商拍工具`;
    }
  }, []);

  useEffect(() => {
    loadBrandConfig();
  }, [loadBrandConfig]);

  return { brandConfig, loadBrandConfig };
}
