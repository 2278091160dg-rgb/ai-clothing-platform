/**
 * WelcomeShowcase - 欢迎展示组件（空闲状态）
 */

import { Package, User, Palette, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const FEATURE_CARDS = [
  {
    icon: Package,
    emoji: '🛍️',
    label: '商品图',
    description: '智能场景生成',
  },
  {
    icon: User,
    emoji: '👗',
    label: '模特图',
    description: '虚拟试穿效果',
  },
  {
    icon: Palette,
    emoji: '🎨',
    label: '创意图',
    description: '自由创作模式',
  },
];

export function WelcomeShowcase() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="flex-1 theme-card rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl" />

      {/* 主内容区 */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* 主标题 */}
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
          AI 已来 马上开启
        </h1>

        {/* 副标题 */}
        <p className="text-slate-400 text-sm mb-12 font-light">想都是问题 做就有答案</p>

        {/* 预设案例卡片组 */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {FEATURE_CARDS.map((card, index) => {
            const Icon = card.icon;
            const isHovered = hoveredIndex === index;
            return (
              <div
                key={card.label}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 min-w-[140px] transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-105 hover:shadow-xl cursor-pointer"
                style={{
                  transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                }}
              >
                {/* 图标 */}
                <div className="mb-3 flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all">
                    <Icon size={24} className="text-blue-400" />
                  </div>
                </div>

                {/* 标签 */}
                <p className="text-sm font-semibold text-foreground mb-1">{card.label}</p>

                {/* 描述 */}
                <p className="text-xs text-muted-foreground">{card.description}</p>

                {/* 高亮光晕 */}
                {isHovered && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-md -z-10 transition-opacity duration-300" />
                )}
              </div>
            );
          })}
        </div>

        {/* 引导动画 */}
        <div className="flex items-center justify-center gap-3 text-slate-400">
          <span className="text-sm">从左侧开始上传</span>
          <div className="relative">
            <ArrowLeft size={20} className="text-blue-400 animate-pulse" />
            {/* 箭头光晕 */}
            <div className="absolute inset-0 bg-blue-400/20 blur-md animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
