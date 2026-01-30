/**
 * BrandConfigForm - 品牌配置表单组件
 */

import { Input } from '@/components/ui/input';
import { compressImage } from '@/lib/utils/image';
import Image from 'next/image';

interface BrandConfigFormProps {
  config: {
    brandTitle?: string;
    brandSubtitle?: string;
    brandIcon?: string;
    brandLogoImage?: string;
  };
  onConfigChange: (field: string, value: string) => void;
}

export function BrandConfigForm({ config, onConfigChange }: BrandConfigFormProps) {
  const handleLogoUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/svg+xml,image/webp';
    input.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const compressed = await compressImage(file, 200, 200, 0.8);
          onConfigChange('brandLogoImage', compressed);
        } catch (error) {
          console.error('图片压缩失败:', error);
          alert('图片处理失败，请重试');
        }
      }
    };
    input.click();
  };

  const handleLogoRemove = () => {
    onConfigChange('brandLogoImage', '');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">主标题</label>
          <Input
            placeholder="AI场景图生成器"
            value={config.brandTitle || ''}
            onChange={e => onConfigChange('brandTitle', e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">副标题</label>
          <Input
            placeholder="智能电商商拍工具"
            value={config.brandSubtitle || ''}
            onChange={e => onConfigChange('brandSubtitle', e.target.value)}
            className="h-9 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">Logo 图标</label>
          <Input
            placeholder="🎨"
            value={config.brandIcon || ''}
            onChange={e => onConfigChange('brandIcon', e.target.value)}
            className="h-9 text-sm"
          />
        </div>

        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">Logo 图片</label>
          <div
            onClick={handleLogoUpload}
            className="w-full h-9 border-2 border-dashed border-border/50 rounded-md flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            {config.brandLogoImage ? (
              <div className="relative w-full h-full flex items-center justify-center p-1">
                <Image
                  src={config.brandLogoImage}
                  alt="Logo"
                  width={32}
                  height={32}
                  className="max-w-full max-h-full object-contain"
                  unoptimized
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
                <span className="text-[10px] text-muted-foreground">📷 点击上传</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 预览 */}
      {(config.brandTitle || config.brandSubtitle || config.brandLogoImage) && (
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-[10px] text-muted-foreground mb-2">预览效果</p>
          <div className="flex items-center gap-3">
            {config.brandLogoImage ? (
              <Image
                src={config.brandLogoImage}
                alt="Logo"
                width={32}
                height={32}
                className="w-8 h-8 rounded"
                unoptimized
              />
            ) : config.brandIcon ? (
              <span className="text-2xl">{config.brandIcon}</span>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xs">
                AI
              </div>
            )}
            <div>
              <p className="text-sm font-semibold">{config.brandTitle || 'AI场景图生成器'}</p>
              <p className="text-[10px] text-muted-foreground">
                {config.brandSubtitle || '智能电商商拍工具'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
