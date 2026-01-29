import { motion } from 'framer-motion';
import { useAppStore } from '../hooks/useAppStore';

export function Header() {
  const { setSettingsOpen } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between px-5 h-14"
    >
      {/* 左侧 Logo */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-primary-600/20 border-2 border-primary-600/40 rounded-2xl flex items-center justify-center backdrop-blur-glass">
          <svg className="w-7 h-7 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-white">AI 场景图生成器</h1>
          <p className="text-xs text-slate-400">智能场景合成工具</p>
        </div>
      </div>

      {/* 右侧状态和设置 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-green-500/15 border border-green-500/40 rounded-full px-3 py-1.5 backdrop-blur-glass">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-green-500">系统在线</span>
        </div>

        <button
          onClick={() => setSettingsOpen(true)}
          className="w-9 h-9 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          title="API 设置"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
