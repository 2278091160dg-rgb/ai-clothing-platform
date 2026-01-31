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

export function useBrandConfig() {
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(() => {
    // 初始化时读取配置
    const config = ConfigManager.getConfig();
    return {
      title: config.brandTitle || 'AI场景图生成器',
      subtitle: config.brandSubtitle || '智能电商商拍工具',
      icon: config.brandIcon || '🎨',
      logoImage: config.brandLogoImage,
    };
  });

  const loadBrandConfig = useCallback(() => {
    const config = ConfigManager.getConfig();
    const newBrandConfig: BrandConfig = {
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

  // 只在挂载时加载一次配置
  useEffect(() => {
    const config = ConfigManager.getConfig();
    const newBrandConfig: BrandConfig = {
      title: config.brandTitle || 'AI场景图生成器',
      subtitle: config.brandSubtitle || '智能电商商拍工具',
      icon: config.brandIcon || '🎨',
      logoImage: config.brandLogoImage,
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBrandConfig(newBrandConfig);

    // 更新页面标题
    if (config.brandTitle) {
      document.title = `${config.brandTitle} - 智能电商商拍工具`;
    }
  }, []);

  return { brandConfig, loadBrandConfig };
}
