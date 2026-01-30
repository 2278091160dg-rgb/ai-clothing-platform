/**
 * LogoTab - LOGO 配置标签
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface LoginConfig {
  logoUrl?: string;
  logoEmoji: string;
}

interface LogoTabProps {
  config: Pick<LoginConfig, 'logoUrl' | 'logoEmoji'>;
  uploading: boolean;
  onConfigChange: (updates: Partial<LoginConfig>) => void;
  onUpload: () => void;
}

export function LogoTab({ config, uploading, onConfigChange, onUpload }: LogoTabProps) {
  return (
    <div className="space-y-5">
      {/* 上传LOGO图片 */}
      <div className="bg-slate-800/30 rounded-lg p-5 border border-cyan-500/20">
        <label className="block text-sm font-medium text-cyan-100 mb-3">上传LOGO图片</label>
        <Button
          onClick={onUpload}
          disabled={uploading}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500"
        >
          {uploading ? '上传中...' : '📤 点击上传LOGO图片'}
        </Button>
        <p className="text-xs text-cyan-100/50 mt-2">支持 PNG、JPG、GIF 格式，建议尺寸 200x200px</p>
      </div>

      {/* Emoji */}
      <div>
        <label className="block text-sm font-medium text-cyan-100 mb-2">或使用 Emoji</label>
        <Input
          type="text"
          value={config.logoEmoji}
          onChange={e => onConfigChange({ logoEmoji: e.target.value })}
          className="bg-slate-800/50 border-cyan-500/30 text-white"
          placeholder="输入emoji，如 🏭️"
        />
      </div>

      {/* Preview */}
      <div className="bg-slate-800/30 rounded-lg p-5 border border-cyan-500/20">
        <p className="text-xs text-cyan-100/50 mb-3">预览效果：</p>
        <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          {config.logoUrl ? (
            <Image
              src={config.logoUrl}
              alt="Logo"
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
              unoptimized
            />
          ) : (
            <span className="text-3xl">{config.logoEmoji}</span>
          )}
        </div>
      </div>
    </div>
  );
}
