/**
 * ApiConfigForm - API 配置表单组件
 */

import { Input } from '@/components/ui/input';

interface ApiConfigFormProps {
  config: {
    callbackUrl?: string;
    deerApiEndpoint?: string;
    deerApiKey?: string;
    n8nWebhookUrl?: string;
  };
  autoDetectedUrl: string;
  onConfigChange: (field: string, value: string) => void;
}

export function ApiConfigForm({ config, autoDetectedUrl, onConfigChange }: ApiConfigFormProps) {
  return (
    <div className="space-y-4">
      {/* 回调 URL 配置 */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-primary">🌐 n8n 回调 URL</label>
          <span className="text-[9px] px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full">
            必填
          </span>
        </div>

        <div className="bg-background/50 rounded p-2 mb-2">
          <p className="text-[10px] text-muted-foreground mb-1">
            💡 <strong>自动检测：</strong>当前访问地址是
          </p>
          <code className="text-[9px] text-primary block p-1 bg-primary/10 rounded">
            {autoDetectedUrl}
          </code>
        </div>

        <Input
          placeholder="https://your-domain.com/api/webhooks/n8n/callback"
          value={config.callbackUrl || autoDetectedUrl}
          onChange={e => onConfigChange('callbackUrl', e.target.value)}
          className="h-9 text-sm font-mono mb-2"
        />

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
          <p className="text-[10px] text-yellow-600 dark:text-yellow-400 mb-1">
            ⚠️ 小白必读：如何获取回调 URL
          </p>
          <ol className="text-[9px] text-muted-foreground space-y-1 list-decimal list-inside">
            <li>本系统已自动检测你的访问地址</li>
            <li>如果你在本地开发，需要使用隧道工具（如 Cloudflare Tunnel）</li>
            <li>复制隧道的公网地址，粘贴到上方输入框</li>
            <li>如果你不配置，将无法收到 n8n 的通知</li>
          </ol>
        </div>
      </div>

      {/* DeerAPI 配置 */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground">🦌 DeerAPI（可选）</label>
        <Input
          placeholder="DeerAPI Endpoint (可选)"
          value={config.deerApiEndpoint || ''}
          onChange={e => onConfigChange('deerApiEndpoint', e.target.value)}
          className="h-9 text-sm font-mono"
        />
        <Input
          type="password"
          placeholder="DeerAPI Key (可选)"
          value={config.deerApiKey || ''}
          onChange={e => onConfigChange('deerApiKey', e.target.value)}
          className="h-9 text-sm font-mono"
        />
      </div>

      {/* N8N 配置 */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground">
          ⚙️ N8N Webhook（可选）
        </label>
        <Input
          placeholder="留空使用默认配置"
          value={config.n8nWebhookUrl || ''}
          onChange={e => onConfigChange('n8nWebhookUrl', e.target.value)}
          className="h-9 text-sm font-mono"
        />
      </div>
    </div>
  );
}
