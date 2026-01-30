/**
 * BackgroundTab - 背景配置标签
 */

import { Button } from '@/components/ui/button';
import { LOGIN_BACKGROUNDS, BACKGROUND_CATEGORIES } from '@/config/login-backgrounds';
import Image from 'next/image';

interface LoginConfig {
  backgroundImageUrl?: string;
  backgroundStyle: string;
}

interface BackgroundTabProps {
  config: Pick<LoginConfig, 'backgroundImageUrl' | 'backgroundStyle'>;
  uploading: boolean;
  selectedCategory: string;
  onConfigChange: (updates: Partial<LoginConfig>) => void;
  onUpload: () => void;
  onCategoryChange: (category: string) => void;
}

export function BackgroundTab({
  config,
  uploading,
  selectedCategory,
  onConfigChange,
  onUpload,
  onCategoryChange,
}: BackgroundTabProps) {
  const handleBackgroundSelect = (bg: (typeof LOGIN_BACKGROUNDS)[0]) => {
    onConfigChange({ backgroundImageUrl: bg.url, backgroundStyle: bg.id });
  };

  const filteredBackgrounds =
    selectedCategory === 'all'
      ? LOGIN_BACKGROUNDS
      : LOGIN_BACKGROUNDS.filter(bg => bg.category === selectedCategory);

  return (
    <div className="space-y-4">
      {/* 自定义上传 */}
      <div className="bg-slate-800/30 rounded-lg p-4 border border-cyan-500/20">
        <label className="block text-sm font-medium text-cyan-100 mb-3">上传自定义背景</label>
        <Button
          onClick={onUpload}
          disabled={uploading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-400 hover:to-pink-500"
        >
          {uploading ? '上传中...' : '📤 上传背景图片'}
        </Button>
        <p className="text-xs text-cyan-100/50 mt-2">图片将自适应屏幕尺寸</p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onCategoryChange('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-800 text-cyan-100/60 hover:bg-slate-700'
          }`}
        >
          全部
        </button>
        {BACKGROUND_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-800 text-cyan-100/60 hover:bg-slate-700'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Background Grid */}
      <div className="grid grid-cols-3 gap-3">
        {filteredBackgrounds.map(bg => (
          <button
            key={bg.id}
            onClick={() => handleBackgroundSelect(bg)}
            className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-video ${
              config.backgroundImageUrl === bg.url
                ? 'border-cyan-400 shadow-lg shadow-cyan-500/50'
                : 'border-transparent hover:border-cyan-500/50'
            }`}
          >
            <Image
              src={bg.thumbnail}
              alt={bg.name}
              width={200}
              height={112}
              className="w-full h-full object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <p className="text-white text-xs font-medium truncate">{bg.name}</p>
            </div>
            {config.backgroundImageUrl === bg.url && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center text-xs">
                ✓
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
