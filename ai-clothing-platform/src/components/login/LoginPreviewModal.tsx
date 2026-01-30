/**
 * LoginPreviewModal - 登录页面预览组件
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import type { LoginConfig } from '@/config/login-defaults';

interface LoginPreviewModalProps {
  config: LoginConfig;
  onClose: () => void;
}

export function LoginPreviewModal({ config, onClose }: LoginPreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-cyan-400"
        >
          ✕ 关闭预览
        </Button>
        <Card className="w-full bg-slate-900/60 backdrop-blur-2xl shadow-2xl border border-cyan-500/30">
          {/* 背景预览 */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl -z-10"
            style={{
              backgroundImage: `url('${config.backgroundImageUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop'}')`,
              filter: 'brightness(0.3)',
            }}
          />
          {/* 渐变叠加 */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-indigo-900/80 rounded-2xl -z-10" />

          <div className="p-8 text-center border-b border-cyan-500/20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              {config.logoUrl ? (
                <Image
                  src={config.logoUrl}
                  alt="Logo"
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain"
                  unoptimized
                />
              ) : (
                <span className="text-4xl">{config.logoEmoji}</span>
              )}
            </div>
            <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              {config.title}
            </h1>
            <p className="text-sm text-cyan-100/80 mb-1">{config.subtitle1}</p>
            <p className="text-xs text-cyan-100/60">{config.subtitle2}</p>
          </div>

          <div className="p-8">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-cyan-100">
                {config.passwordLabel}
              </label>
              <div className="h-12 bg-slate-800/50 border-2 border-cyan-500/30 rounded-lg flex items-center px-4">
                <span className="text-cyan-100/50 text-sm">{config.passwordPlaceholder}</span>
              </div>
            </div>
            <Button className="w-full h-12 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white">
              {config.buttonText}
            </Button>
          </div>

          <div className="px-8 pb-8 text-center">
            <p className="text-xs text-cyan-100/70 mb-2">{config.footerText}</p>
            <p className="text-[10px] text-cyan-100/50">{config.copyrightText}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
