/**
 * LoginCard - 登录卡片组件
 */

'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { TypewriterText, AI_TEXTS } from '@/components/login/TypewriterText';
import type { LoginConfig } from '@/config/login-defaults';

interface LoginCardProps {
  config: LoginConfig;
  password: string;
  setPassword: (value: string) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginCard({
  config,
  password,
  setPassword,
  error,
  loading,
  onSubmit,
}: LoginCardProps) {
  return (
    <Card className="w-full max-w-md bg-slate-900/60 backdrop-blur-2xl shadow-2xl border border-cyan-500/30 animate-fade-in-up">
      {/* Logo / Header */}
      <div className="p-8 text-center border-b border-cyan-500/20">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/50 animate-float-icon hover:scale-110 transition-transform duration-300 cursor-pointer">
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
        <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
          {config.title}
        </h1>
        <p className="text-sm text-cyan-100/80 mb-1">{config.subtitle1}</p>
        <p className="text-xs text-cyan-100/60 animate-fade-in-delay-1">{config.subtitle2}</p>
      </div>

      {/* Login Form */}
      <form onSubmit={onSubmit} className="p-8 space-y-6">
        <div className="animate-fade-in-delay-2">
          <label htmlFor="password" className="block text-sm font-medium mb-2 text-cyan-100">
            {config.passwordLabel}
          </label>
          <div className="relative group">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={config.passwordPlaceholder}
              className="h-12 text-base bg-slate-800/50 border-2 border-cyan-500/30 text-white placeholder-cyan-100/50 transition-all duration-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/30"
              autoFocus
              disabled={loading}
              required
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/0 via-blue-500/0 to-purple-500/0 group-focus-within:from-cyan-500/20 group-focus-within:via-blue-500/20 group-focus-within:to-purple-500/20 transition-all duration-500 pointer-events-none"></div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-3 animate-shake">
            <p className="text-sm text-red-200 text-center">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-12 text-base bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 animate-fade-in-delay-3 relative overflow-hidden group text-white"
          disabled={loading}
        >
          <span className="relative z-10">
            {loading ? config.buttonLoadingText : config.buttonText}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-300"></div>
        </Button>
      </form>

      {/* Footer */}
      <div className="px-8 pb-8 text-center animate-fade-in-delay-4">
        <p className="text-xs text-cyan-100/70 mb-2">{config.footerText}</p>
        <p className="text-[10px] text-cyan-100/50">{config.copyrightText}</p>
        {/* AI 文字动画 */}
        <div className="mt-4 h-6 flex items-center justify-center">
          <TypewriterText
            texts={AI_TEXTS}
            speed={80}
            deleteSpeed={40}
            pauseDuration={3000}
            className="text-xs text-cyan-300/80"
          />
        </div>
      </div>
    </Card>
  );
}
