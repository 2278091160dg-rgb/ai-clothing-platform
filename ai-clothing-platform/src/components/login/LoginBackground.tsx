/**
 * LoginBackground - 登录页面背景动画组件
 */

'use client';

import type { LoginConfig } from '@/config/login-defaults';

interface LoginBackgroundProps {
  config: LoginConfig;
}

export function LoginBackground({ config }: LoginBackgroundProps) {
  return (
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
  );
}
