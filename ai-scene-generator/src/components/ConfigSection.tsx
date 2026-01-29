import { motion } from 'framer-motion';
import { useAppStore } from '../hooks/useAppStore';
import clsx from 'clsx';

export function ConfigSection() {
  const { params, setPrompt, setAspectRatio } = useAppStore();

  const aspectRatios: { value: '3:4' | '1:1' | '16:9'; label: string }[] = [
    { value: '3:4', label: '3:4 竖版' },
    { value: '1:1', label: '1:1 方版' },
    { value: '16:9', label: '16:9 横版' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-4"
    >
      {/* 头部 */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-white">生成参数</h2>
        <div className="flex gap-1 px-2 py-0.5 bg-primary-600/25 border border-primary-500/50 rounded-full">
          <span className="text-[10px] font-bold text-primary-400">02</span>
        </div>
      </div>

      {/* 提示词输入 */}
      <div className="mb-2">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-6 h-6 bg-pink-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-slate-200">提示词</span>
          <span className="text-[10px] text-red-400">必填</span>
        </div>

        <textarea
          value={params.prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述你想要的场景效果...\n例如：将商品自然地放置在场景中，光线柔和，氛围温馨"
          className="glass-input w-full p-3 text-xs text-white placeholder-slate-400 resize-none leading-relaxed"
          rows={2}
        />
      </div>

      {/* 比例选择 */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-slate-200">图片比例</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.value}
              onClick={() => setAspectRatio(ratio.value)}
              className={clsx(
                'radio-option p-2 h-9 flex items-center gap-1.5',
                params.aspectRatio === ratio.value && 'active'
              )}
            >
              <div
                className={clsx(
                  'w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all',
                  params.aspectRatio === ratio.value
                    ? 'bg-primary-600'
                    : 'bg-white/10 border-2 border-white/30'
                )}
              >
                {params.aspectRatio === ratio.value && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </div>
              <span
                className={clsx(
                  'text-xs font-medium',
                  params.aspectRatio === ratio.value ? 'text-white' : 'text-slate-300'
                )}
              >
                {ratio.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
