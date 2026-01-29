import { motion } from 'framer-motion';
import { useAppStore } from '../hooks/useAppStore';

export function HistorySection() {
  const { history } = useAppStore();

  const getRatioColor = (ratio: string) => {
    switch (ratio) {
      case '3:4':
        return 'bg-primary-600/20 text-primary-400';
      case '1:1':
        return 'bg-purple-500/20 text-purple-400';
      case '16:9':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-white/10 text-slate-400';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-7 overflow-hidden"
    >
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">历史记录</h2>
        <button className="flex items-center gap-2 text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors">
          查看全部
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 历史记录列表 */}
      <div className="space-y-3 overflow-y-auto max-h-[220px] pr-2">
        {history.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-slate-400">暂无历史记录</p>
          </div>
        ) : (
          history.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/8 transition-colors"
            >
              {/* 缩略图 */}
              <div className="w-16 h-16 bg-white/8 border border-white/15 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white mb-1.5 truncate">{item.prompt}</p>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-slate-400">{formatTime(item.timestamp)}</span>
                  <span className={clsx('px-2.5 py-1 rounded-lg text-xs font-semibold', getRatioColor(item.aspectRatio))}>
                    {item.aspectRatio}
                  </span>
                </div>
              </div>

              {/* 下载按钮 */}
              <button className="p-2 bg-white/8 border border-white/15 rounded-xl hover:bg-white/12 transition-colors flex-shrink-0">
                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function clsx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
