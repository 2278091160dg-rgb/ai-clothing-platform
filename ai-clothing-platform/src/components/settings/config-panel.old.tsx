/**
 * 配置面板组件
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ConfigManager } from '@/lib/config';

// 图片压缩函数
const compressImage = (
  file: File,
  maxWidth: number = 200,
  maxHeight: number = 200,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        // 计算压缩后的尺寸
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // 创建 canvas 进行压缩
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法获取 canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // 转换为 base64（JPEG 格式以获得更好的压缩）
        const base64 = canvas.toDataURL('image/jpeg', quality);
        resolve(base64);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function ConfigPanel({ onClose, onSave }: { onClose: () => void; onSave?: () => void }) {
  const [config, setConfig] = useState(ConfigManager.getConfig());
  const [saved, setSaved] = useState(false);

  const handleChange = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  // 处理 Logo 图片上传
  const handleLogoUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/svg+xml,image/webp';
    input.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          // 自动压缩图片（最大 200x200，质量 0.8）
          const compressed = await compressImage(file, 200, 200, 0.8);
          setConfig(prev => ({ ...prev, brandLogoImage: compressed }));
          setSaved(false);
        } catch (error) {
          console.error('图片压缩失败:', error);
          alert('图片处理失败，请重试');
        }
      }
    };
    input.click();
  };

  // 删除 Logo 图片
  const handleLogoRemove = () => {
    setConfig(prev => ({ ...prev, brandLogoImage: undefined }));
    setSaved(false);
  };

  const handleSave = () => {
    ConfigManager.saveConfig(config);
    setSaved(true);
    // 通知父组件配置已保存，触发重新加载
    onSave?.();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[85vh] overflow-y-auto p-5 bg-background">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">系统配置</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="space-y-4">
          {/* 品牌配置 */}
          <div className="space-y-2 pb-3 border-b border-border/30">
            <h3 className="text-xs font-semibold text-primary mb-2">🎨 品牌配置</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">主标题</label>
                <Input
                  placeholder="AI场景图生成器"
                  value={config.brandTitle || ''}
                  onChange={e => handleChange('brandTitle', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">副标题</label>
                <Input
                  placeholder="智能电商商拍工具"
                  value={config.brandSubtitle || ''}
                  onChange={e => handleChange('brandSubtitle', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Logo图标</label>
                <Input
                  placeholder="🎨"
                  value={config.brandIcon || ''}
                  onChange={e => handleChange('brandIcon', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>

              {/* Logo 图片上传 */}
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Logo图片</label>
                <div
                  onClick={handleLogoUpload}
                  className="w-full h-8 border-2 border-dashed border-border/50 rounded-md flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  {config.brandLogoImage ? (
                    <div className="relative w-full h-full flex items-center justify-center p-1">
                      <img
                        src={config.brandLogoImage}
                        alt="Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleLogoRemove();
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] hover:bg-red-600 transition-colors shadow-sm"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">📷 上传</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* API配置 */}
          <div className="space-y-2 pb-3 border-t border-border/30">
            <h3 className="text-xs font-semibold text-primary mb-2">🔧 API配置</h3>

            {/* DeerAPI配置 */}
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">
                  DeerAPI Endpoint
                </label>
                <Input
                  placeholder="https://api.deerapi.com"
                  value={config.deerApiEndpoint || ''}
                  onChange={e => handleChange('deerApiEndpoint', e.target.value)}
                  className="h-8 text-sm font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">DeerAPI Key</label>
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={config.deerApiKey || ''}
                  onChange={e => handleChange('deerApiKey', e.target.value)}
                  className="h-8 text-sm font-mono"
                />
              </div>
            </div>

            {/* N8N配置 */}
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">
                  N8N Webhook URL（可选）
                </label>
                <Input
                  placeholder="https://n8n.denggui.top/webhook/ai-clothing-generation"
                  value={config.n8nWebhookUrl || ''}
                  onChange={e => handleChange('n8nWebhookUrl', e.target.value)}
                  className="h-8 text-sm font-mono"
                />
                <p className="text-[9px] text-muted-foreground mt-1">留空则使用后端默认配置</p>
              </div>

              {/* 回调 URL 配置 */}
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">n8n 回调 URL</label>
                <Input
                  placeholder="https://your-domain.com/api/webhooks/n8n/callback"
                  value={config.callbackUrl || ''}
                  onChange={e => handleChange('callbackUrl', e.target.value)}
                  className="h-8 text-sm font-mono"
                />
                <p className="text-[9px] text-muted-foreground mt-1">
                  {config.callbackUrl ? (
                    <span className="text-green-500">✓ 已配置自定义回调</span>
                  ) : (
                    <span className="text-yellow-500">⚠️ 需要配置公网URL</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* 说明信息 */}
          <div className="pt-3 border-t border-border/30">
            <div className="bg-muted/50 rounded-md p-3 text-[10px] text-muted-foreground space-y-1">
              <p className="font-medium">📌 配置说明</p>
              <p>
                • <strong>品牌配置</strong>：自定义界面标题和Logo
              </p>
              <p>
                • <strong>DeerAPI</strong>：AI图片生成服务（选配）
              </p>
              <p>
                • <strong>N8N Webhook</strong>：自定义N8N实例（可选）
              </p>
              <p>• 所有配置保存在浏览器本地，安全私密</p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1 h-9 text-sm">
              {saved ? '✓ 已保存' : '保存配置'}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1 h-9 text-sm">
              关闭
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
