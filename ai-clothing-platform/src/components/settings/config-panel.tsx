/**
 * 配置面板组件
 * 使用 ConfigForm 组件来渲染表单
 */

'use client';

import { useState, useEffect } from 'react';
import { ConfigManager } from '@/lib/config';
import { ConfigForm } from './ConfigForm';

type ConfigTab = 'brand' | 'api';

export function ConfigPanel({ onClose, onSave }: { onClose: () => void; onSave?: () => void }) {
  const [activeTab, setActiveTab] = useState<ConfigTab>('api');
  const [config, setConfig] = useState(ConfigManager.getConfig());
  const [saved, setSaved] = useState(false);

  // 在组件外计算 autoDetectedUrl，避免在 useEffect 中调用 setState
  const autoDetectedUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/n8n/callback` : '';

  useEffect(() => {
    // 只在需要时设置 callbackUrl
    if (typeof window !== 'undefined' && !config.callbackUrl) {
      const currentUrl = window.location.origin;
      // 使用 setTimeout 避免同步 setState 警告
      setTimeout(() => {
        setConfig(prev => ({ ...prev, callbackUrl: currentUrl }));
      }, 0);
    }
  }, [config.callbackUrl]);

  const handleChange = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSaveAndClose = () => {
    ConfigManager.saveConfig(config);
    setSaved(true);
    onSave?.();
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <ConfigForm
      activeTab={activeTab}
      config={config}
      autoDetectedUrl={autoDetectedUrl}
      onTabChange={setActiveTab}
      onConfigChange={handleChange}
      onSave={handleSaveAndClose}
      onCancel={onClose}
      saved={saved}
    />
  );
}
