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
  const [autoDetectedUrl, setAutoDetectedUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.origin;
      setAutoDetectedUrl(`${currentUrl}/api/webhooks/n8n/callback`);

      if (!config.callbackUrl) {
        setConfig(prev => ({ ...prev, callbackUrl: currentUrl }));
      }
    }
  }, []);

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
