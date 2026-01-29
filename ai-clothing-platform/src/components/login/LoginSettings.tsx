/**
 * 登录页面设置编辑组件
 * 支持自定义LOGO、文案、背景等
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogoTab } from './tabs/LogoTab';
import { TextTab } from './tabs/TextTab';
import { BackgroundTab } from './tabs/BackgroundTab';
import { LoginPreviewModal } from './LoginPreviewModal';
import type { LoginConfig } from '@/config/login-defaults';

interface LoginSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: LoginConfig) => void;
  currentConfig: LoginConfig;
}

export function LoginSettings({ isOpen, onClose, onSave, currentConfig }: LoginSettingsProps) {
  const [config, setConfig] = useState<LoginConfig>(currentConfig);
  const [activeTab, setActiveTab] = useState<'logo' | 'text' | 'background'>('logo');
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setConfig(currentConfig);
  }, [currentConfig]);

  if (!isOpen) return null;

  const handleLogoUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setUploadingLogo(true);
        try {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) throw new Error('上传失败');

          const data = await response.json();
          if (data.success && data.dataUrl) {
            setConfig({ ...config, logoUrl: data.dataUrl });
          }
        } catch (error) {
          console.error('Logo upload error:', error);
          alert('上传失败，请重试');
        } finally {
          setUploadingLogo(false);
        }
      }
    };
    input.click();
  };

  const handleBackgroundUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setUploadingBackground(true);
        try {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) throw new Error('上传失败');

          const data = await response.json();
          if (data.success && data.dataUrl) {
            setConfig({ ...config, backgroundImageUrl: data.dataUrl, backgroundStyle: 'custom' });
          }
        } catch (error) {
          console.error('Background upload error:', error);
          alert('上传失败，请重试');
        } finally {
          setUploadingBackground(false);
        }
      }
    };
    input.click();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(config);
      onClose();
    } catch (error) {
      console.error('Save config error:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleConfigChange = (updates: Partial<LoginConfig>) => {
    setConfig({ ...config, ...updates });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-cyan-500/20 flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            登录页面设置
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="text-cyan-100/80 hover:text-cyan-100"
            >
              👁️ 预览
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-cyan-500/20">
          <button
            onClick={() => setActiveTab('logo')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'logo'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-cyan-100/60 hover:text-cyan-100'
            }`}
          >
            🖼️ LOGO
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'text'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-cyan-100/60 hover:text-cyan-100'
            }`}
          >
            📝 文案
          </button>
          <button
            onClick={() => setActiveTab('background')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'background'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-cyan-100/60 hover:text-cyan-100'
            }`}
          >
            🎨 背景
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'logo' && (
            <LogoTab
              config={config}
              uploading={uploadingLogo}
              onConfigChange={handleConfigChange}
              onUpload={handleLogoUpload}
            />
          )}
          {activeTab === 'text' && <TextTab config={config} onConfigChange={handleConfigChange} />}
          {activeTab === 'background' && (
            <BackgroundTab
              config={config}
              uploading={uploadingBackground}
              selectedCategory={selectedCategory}
              onConfigChange={handleConfigChange}
              onUpload={handleBackgroundUpload}
              onCategoryChange={setSelectedCategory}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-cyan-500/20 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-cyan-100/60 hover:text-cyan-100"
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500"
          >
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && <LoginPreviewModal config={config} onClose={() => setShowPreview(false)} />}
    </div>
  );
}
