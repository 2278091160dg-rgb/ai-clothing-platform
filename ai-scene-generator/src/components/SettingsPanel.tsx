import { motion } from 'framer-motion';
import { useAppStore } from '../hooks/useAppStore';

export function SettingsPanel() {
  const { setSettingsOpen } = useAppStore();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card p-6 w-full max-w-md"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">n8n 工作流设置</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            ×
          </button>
        </div>

        {/* 配置说明 */}
        <div className="mb-5 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <p className="text-xs text-blue-300 leading-relaxed">
            <span className="font-semibold">📡 当前配置：</span><br />
            n8n Webhook: https://n8n.denggui.top/webhook/...<br />
            代理服务器: http://localhost:3002<br />
            超时设置: 10 分钟<br />
            状态: <span className="text-green-400">● 运行中</span><br />
            <span className="text-yellow-300">⚠️ Webhook 需要配置为"Respond to Webhook"模式</span>
          </p>
        </div>

        {/* 工作流说明 */}
        <div className="mb-5 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
          <p className="text-xs text-green-300 leading-relaxed">
            💡 <span className="font-semibold">双轨制工作流：</span><br />
            • <span className="text-white font-semibold">前端操作：</span>上传图片 → Webhook A → 生成图片 → 返回URL<br />
            • <span className="text-white font-semibold">飞书操作：</span>点击按钮 → Webhook B → 生成图片 → 保存记录<br />
            • 两个入口共享同一个工作流逻辑
          </p>
        </div>

        {/* 配置指导 */}
        <div className="mb-5 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <p className="text-xs text-yellow-300 leading-relaxed">
            <span className="font-semibold">⚙️ n8n 双Webhook配置：</span><br /><br />
            <span className="text-white font-semibold">Webhook A（前端入口）：</span><br />
            • Path: /webhook/4eebc87c-b884-47c6-a6b1-80ff6b62ce8a<br />
            • 接收: FormData (productImage, sceneImage, prompt)<br /><br />
            <span className="text-white font-semibold">Webhook B（飞书入口）：</span><br />
            • Path: /webhook/feishu-trigger<br />
            • 接收: JSON (record_id, table_id)<br /><br />
            <span className="text-white font-semibold">共用节点：</span><br />
            • Gemini生成 → SET (提取imageUrl) → 飞书记录<br />
            • Switch判断来源 → 前端则Respond to Webhook
          </p>
        </div>

        {/* Cloudflare 绕过说明 */}
        <div className="mb-5 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <p className="text-xs text-purple-300 leading-relaxed">
            <span className="font-semibold">🚀 绕过 Cloudflare 超时（可选）：</span><br />
            如遇 Cloudflare 100 秒超时限制，可使用直接 IP 访问：<br />
            <span className="font-mono text-xs bg-purple-500/20 px-2 py-1 rounded block mt-2">
              N8N_TARGET=http://服务器IP:5678 node proxy-server.cjs
            </span>
          </p>
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={() => setSettingsOpen(false)}
          className="w-full glass-button h-10 flex items-center justify-center gap-2 px-4 text-slate-200 font-semibold text-sm"
        >
          关闭
        </button>
      </motion.div>
    </div>
  );
}
