import { motion } from 'framer-motion';
import { useAppStore } from '../hooks/useAppStore';
import { useState } from 'react';

export function ResultSection() {
  const { currentResult, isGenerating } = useAppStore();
  const [imageError, setImageError] = useState<string | null>(null);

  const handleDownload = () => {
    if (currentResult?.imageUrl) {
      const link = document.createElement('a');
      link.href = currentResult.imageUrl;
      link.download = `scene-${currentResult.id}.png`;
      link.click();
    }
  };

  const handleRetry = () => {
    // 重新生成逻辑
    console.log('重新生成');
  };

  const handleSaveToFeishu = () => {
    // 保存到飞书逻辑
    console.log('保存到飞书');
  };

  const handleImageLoad = () => {
    console.log('✅ 图片加载成功:', currentResult?.imageUrl);
    setImageError(null);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('❌ 图片加载失败:', currentResult?.imageUrl);
    console.error('❌ 加载错误事件:', e);
    setImageError('图片加载失败，URL 可能无效或存在跨域问题');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-5"
    >
      {/* 头部 */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-white">生成结果</h2>
        <div className="flex gap-1.5 px-2.5 py-0.5 bg-primary-600/25 border border-primary-500/50 rounded-full">
          <span className="text-xs font-bold text-primary-400">03</span>
        </div>
      </div>

      {/* 结果预览 */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-3 min-h-[220px] flex items-center justify-center">
        {isGenerating ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-primary-600/15 rounded-full flex items-center justify-center mx-auto mb-3">
              <div className="w-7 h-7 border-4 border-primary-400/30 border-t-primary-400 rounded-full animate-spin" />
            </div>
            <p className="text-sm font-bold text-white mb-1">正在生成中...</p>
            <p className="text-xs text-slate-400">AI 正在处理您的图片，请稍候</p>
          </div>
        ) : currentResult ? (
          <div className="w-full">
            {imageError ? (
              <div className="w-full h-44 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-14 h-14 bg-red-500/15 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-red-400 mb-1">图片加载失败</p>
                  <p className="text-xs text-slate-400">{imageError}</p>
                </div>
              </div>
            ) : (
              <img
                src={currentResult.imageUrl}
                alt="生成结果"
                className="w-full h-44 object-contain rounded-2xl"
                onLoad={handleImageLoad}
                onError={handleImageError}
                crossOrigin="anonymous"
              />
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="w-14 h-14 bg-primary-600/15 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-white mb-1">等待生成</p>
            <p className="text-xs text-slate-400">上传图片并填写提示词后，点击生成按钮</p>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={handleDownload}
          disabled={!currentResult}
          className="glass-button h-10 flex items-center justify-center gap-2 px-5 text-xs font-semibold text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          下载图片
        </button>

        <button
          onClick={handleRetry}
          disabled={!currentResult}
          className="glass-button h-10 flex items-center justify-center gap-2 px-5 text-xs font-semibold text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          重新生成
        </button>

        <button
          onClick={handleSaveToFeishu}
          disabled={!currentResult}
          className="h-10 flex items-center justify-center gap-2 px-5 bg-green-500/20 border border-green-500/50 rounded-xl text-xs font-semibold text-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-green-500/30"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          保存到飞书
        </button>
      </div>
    </motion.div>
  );
}
