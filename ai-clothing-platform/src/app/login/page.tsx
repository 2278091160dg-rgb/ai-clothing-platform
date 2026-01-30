/**
 * 登录页面 - 访问密码保护
 * 支持自定义配置和设置
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LoginSettings } from '@/components/login/LoginSettings';
import { DEFAULT_LOGIN_CONFIG, type LoginConfig } from '@/config/login-defaults';
import { getSoundEffects } from '@/lib/utils/sound-effects';
import { useMouseParticles } from '@/hooks/use-mouse-particles';
import { TypewriterText, AI_TEXTS } from '@/components/login/TypewriterText';
import './animations.css';
import './animations-ai.css';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 音效和粒子效果
  const soundEffects = getSoundEffects();
  const { canvasRef } = useMouseParticles();

  // Configuration state
  const [config, setConfig] = useState<LoginConfig>(DEFAULT_LOGIN_CONFIG);
  const [showSettings, setShowSettings] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load configuration on mount
  useEffect(() => {
    // 尝试从数据库加载配置
    loadConfig();

    checkAdminStatus();
  }, []);

  // Load login configuration from API
  const loadConfig = async () => {
    try {
      const res = await fetch('/api/login-config');
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data.success && data.data) {
            setConfig(data.data);
            console.log('Loaded config from database:', data.data);
          }
        } catch (_e) {
          // 返回的不是 JSON，使用默认配置
          console.warn('API returned non-JSON, using defaults');
          setConfig(DEFAULT_LOGIN_CONFIG);
        }
      } else {
        console.warn('API returned error, using defaults');
        setConfig(DEFAULT_LOGIN_CONFIG);
      }
    } catch (error) {
      console.warn('Failed to load config, using defaults:', error);
      setConfig(DEFAULT_LOGIN_CONFIG);
    }
  };

  // Check if user is admin (after login)
  const checkAdminStatus = () => {
    const cookies = document.cookie.split('; ').reduce(
      (acc, cookie) => {
        const [name, value] = cookie.split('=');
        if (name && value) acc[name] = value;
        return acc;
      },
      {} as Record<string, string>
    );

    const hasSession = cookies['access_session'];
    if (hasSession) {
      setIsAdmin(true);
    }
  };

  // Save configuration
  const saveConfig = async (newConfig: LoginConfig) => {
    try {
      const res = await fetch('/api/login-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });

      if (!res.ok) {
        throw new Error('Failed to save config');
      }

      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        return data.data;
      }
    } catch (error) {
      console.error('Save config error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 播放点击音效
    soundEffects.playClick();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        soundEffects.playSuccess();
        // 登录成功，重定向到首页
        router.push('/');
        router.refresh();
      } else {
        soundEffects.playError();
        setError(data.error || '密码错误，请重试');
      }
    } catch (err) {
      soundEffects.playError();
      setError('网络错误，请稍后重试');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景容器 */}
      <div className="background-container">
        {/* 背景图片层 - 添加缩放动画 */}
        <div
          className="background-image"
          style={{
            backgroundImage: `url('${config.backgroundImageUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop'}')`,
          }}
        ></div>

        {/* 暗色覆盖层 */}
        <div className="dark-overlay"></div>

        {/* 渐变动画覆盖层 */}
        <div className="background-gradient"></div>

        {/* 神经网络节点效果 */}
        <div className="neural-nodes"></div>

        {/* 数据流网格效果 */}
        <div className="data-grid"></div>

        {/* 扫描线效果 */}
        <div className="scanline"></div>

        {/* 粒子效果 */}
        <div className="particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
      </div>

      {/* Settings Button - Only for admins */}
      {isAdmin && (
        <button
          onClick={() => {
            soundEffects.playHover();
            setShowSettings(true);
          }}
          onMouseEnter={() => soundEffects.playHover()}
          className="fixed top-4 right-4 z-40 bg-slate-900/80 backdrop-blur-sm border border-cyan-500/30 text-cyan-100 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          ⚙️ 设置
        </button>
      )}

      {/* 鼠标粒子画布 */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10"
        style={{ opacity: 0.6 }}
      ></canvas>

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
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
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

      {/* Settings Modal */}
      <LoginSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={saveConfig}
        currentConfig={config}
      />
    </div>
  );
}
