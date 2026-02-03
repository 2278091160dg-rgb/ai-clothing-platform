/**
 * WelcomeShowcase - 欢迎界面组件
 *
 * 方案3：智能混合空状态
 * - 清晰的引导
 * - 拖拽上传提示
 * - 历史记录入口
 * - 简洁优雅的设计
 */

'use client';

import { Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';

export function WelcomeShowcase() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black rounded-2xl relative overflow-hidden">
      {/* 背景网格装饰 */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* 装饰性光晕 - 更柔和 */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 主要内容 */}
      <div className="relative z-10 text-center px-8">
        {/* 大图标 */}
        <div className="w-20 h-20 mx-auto mb-6 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl">
          <Sparkles size={40} className="text-white/40" />
        </div>

        {/* 主标题 */}
        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
          开始新创作
        </h2>

        {/* 副标题 */}
        <p className="text-white/50 text-lg mb-8 max-w-md">
          上传商品图片，AI 自动生成电商场景图
        </p>

        {/* 三步引导卡片 */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-lg mx-auto mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <p className="text-white/60 text-sm font-medium">
              三步快速生成
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 text-sm">
            <div className="flex items-center gap-2 text-white/40">
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">1</span>
              <span>上传素材</span>
            </div>
            <ArrowRight size={14} className="text-white/20" />
            <div className="flex items-center gap-2 text-white/40">
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">2</span>
              <span>调整参数</span>
            </div>
            <ArrowRight size={14} className="text-white/20" />
            <div className="flex items-center gap-2 text-white/40">
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">3</span>
              <span>生成场景</span>
            </div>
          </div>
        </div>

        {/* 操作提示 */}
        <div className="space-y-2 max-w-md mx-auto mb-10">
          <p className="text-white/30 text-sm flex items-center justify-center gap-2">
            <span>📷</span>
            <span>拖拽图片到左侧上传区域，或点击选择文件</span>
          </p>
          <p className="text-white/20 text-xs">
            支持 JPG、PNG 格式，建议图片比例 3:4
          </p>
        </div>

        {/* 引导箭头 */}
        <div className="flex items-center justify-center gap-2 text-white/30 mb-8">
          <span className="text-sm">从左侧开始</span>
          <ArrowLeft size={18} className="text-blue-400 animate-pulse" />
        </div>

        {/* 历史记录提示 */}
        <p className="text-xs text-white/30">
          历史记录显示在左侧任务历史面板中
        </p>
      </div>
    </div>
  );
}
