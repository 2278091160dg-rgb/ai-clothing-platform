/**
 * TextTab - 文案配置标签
 */

import { Input } from '@/components/ui/input';

interface LoginConfig {
  title: string;
  subtitle1: string;
  subtitle2: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  buttonText: string;
  buttonLoadingText: string;
  footerText: string;
  copyrightText: string;
}

interface TextTabProps {
  config: Pick<
    LoginConfig,
    | 'title'
    | 'subtitle1'
    | 'subtitle2'
    | 'passwordLabel'
    | 'passwordPlaceholder'
    | 'buttonText'
    | 'buttonLoadingText'
    | 'footerText'
    | 'copyrightText'
  >;
  onConfigChange: (updates: Partial<LoginConfig>) => void;
}

export function TextTab({ config, onConfigChange }: TextTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-cyan-100 mb-2">主标题</label>
        <Input
          type="text"
          value={config.title}
          onChange={e => onConfigChange({ title: e.target.value })}
          className="bg-slate-800/50 border-cyan-500/30 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-cyan-100 mb-2">副标题 1</label>
        <Input
          type="text"
          value={config.subtitle1}
          onChange={e => onConfigChange({ subtitle1: e.target.value })}
          className="bg-slate-800/50 border-cyan-500/30 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-cyan-100 mb-2">副标题 2</label>
        <Input
          type="text"
          value={config.subtitle2}
          onChange={e => onConfigChange({ subtitle2: e.target.value })}
          className="bg-slate-800/50 border-cyan-500/30 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-cyan-100 mb-2">密码输入框标签</label>
        <Input
          type="text"
          value={config.passwordLabel}
          onChange={e => onConfigChange({ passwordLabel: e.target.value })}
          className="bg-slate-800/50 border-cyan-500/30 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-cyan-100 mb-2">密码输入框占位符</label>
        <Input
          type="text"
          value={config.passwordPlaceholder}
          onChange={e => onConfigChange({ passwordPlaceholder: e.target.value })}
          className="bg-slate-800/50 border-cyan-500/30 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-cyan-100 mb-2">按钮文字</label>
        <Input
          type="text"
          value={config.buttonText}
          onChange={e => onConfigChange({ buttonText: e.target.value })}
          className="bg-slate-800/50 border-cyan-500/30 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-cyan-100 mb-2">按钮加载文字</label>
        <Input
          type="text"
          value={config.buttonLoadingText}
          onChange={e => onConfigChange({ buttonLoadingText: e.target.value })}
          className="bg-slate-800/50 border-cyan-500/30 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-cyan-100 mb-2">底部文字</label>
        <Input
          type="text"
          value={config.footerText}
          onChange={e => onConfigChange({ footerText: e.target.value })}
          className="bg-slate-800/50 border-cyan-500/30 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-cyan-100 mb-2">版权文字</label>
        <Input
          type="text"
          value={config.copyrightText}
          onChange={e => onConfigChange({ copyrightText: e.target.value })}
          className="bg-slate-800/50 border-cyan-500/30 text-white"
        />
      </div>
    </div>
  );
}
