/**
 * ConfigForm - 配置表单主组件
 */

import { Button } from '@/components/ui/button';
import { ConfigManager } from '@/lib/config';
import { ApiConfigForm } from './forms/ApiConfigForm';
import { BrandConfigForm } from './forms/BrandConfigForm';

type ConfigTab = 'brand' | 'api';

interface ConfigFormProps {
  activeTab: ConfigTab;
  config: ReturnType<typeof ConfigManager.getConfig>;
  autoDetectedUrl: string;
  onTabChange: (tab: ConfigTab) => void;
  onConfigChange: (field: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saved: boolean;
}

export function ConfigForm({
  activeTab,
  config,
  autoDetectedUrl,
  onTabChange,
  onConfigChange,
  onSave,
  onCancel,
  saved,
}: ConfigFormProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-background rounded-lg border border-border/30 shadow-lg">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          <h2 className="text-base font-semibold">系统配置</h2>
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs text-green-500">✓ 已保存</span>}
            <Button variant="ghost" size="sm" onClick={onCancel}>
              ✕
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border/30">
          <button
            onClick={() => onTabChange('api')}
            className={`flex-1 px-4 py-3 text-xs font-medium transition-colors ${
              activeTab === 'api'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🔧 API 配置
          </button>
          <button
            onClick={() => onTabChange('brand')}
            className={`flex-1 px-4 py-3 text-xs font-medium transition-colors ${
              activeTab === 'brand'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🎨 品牌配置
          </button>
        </div>

        {/* 内容区 */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {activeTab === 'api' && (
            <ApiConfigForm
              config={config}
              autoDetectedUrl={autoDetectedUrl}
              onConfigChange={onConfigChange}
            />
          )}
          {activeTab === 'brand' && (
            <BrandConfigForm config={config} onConfigChange={onConfigChange} />
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-2 p-4 border-t border-border/30">
          <Button variant="outline" onClick={onCancel} className="flex-1 h-9 text-sm">
            取消
          </Button>
          <Button
            onClick={onSave}
            className="flex-[2] h-9 text-sm bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
          >
            {saved ? '✓ 已保存' : '✓ 保存并关闭'}
          </Button>
        </div>
      </div>
    </div>
  );
}
