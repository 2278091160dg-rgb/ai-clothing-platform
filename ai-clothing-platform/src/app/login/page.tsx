/**
 * 登录页面 - 访问密码保护
 * 支持自定义配置和设置
 *
 * 拆分后的结构：
 * - hooks/use-login-config.ts: 配置管理 Hook
 * - hooks/use-login-form.ts: 表单逻辑 Hook
 * - components/login/LoginBackground.tsx: 背景组件
 * - components/login/LoginCard.tsx: 登录卡片组件
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { LoginSettings } from '@/components/login/LoginSettings';
import { getSoundEffects } from '@/lib/utils/sound-effects';
import { useMouseParticles } from '@/hooks/use-mouse-particles';
import { useLoginConfig } from '@/hooks/use-login-config';
import { useLoginForm } from '@/hooks/use-login-form';
import { LoginBackground } from '@/components/login/LoginBackground';
import { LoginCard } from '@/components/login/LoginCard';
import './animations.css';
import './animations-ai.css';

export default function LoginPage() {
  // 音效和粒子效果
  const soundEffects = getSoundEffects();
  const { canvasRef } = useMouseParticles();

  // 配置管理
  const { config, isAdmin, saveConfig } = useLoginConfig();
  const [showSettings, setShowSettings] = useState(false);

  // 表单逻辑
  const loginForm = useLoginForm();
  const { password, setPassword, error, loading, handleSubmit } = loginForm;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景容器 */}
      <LoginBackground config={config} />

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

      {/* 登录卡片 */}
      <LoginCard
        config={config}
        password={password}
        setPassword={setPassword}
        error={error}
        loading={loading}
        onSubmit={handleSubmit}
      />

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
