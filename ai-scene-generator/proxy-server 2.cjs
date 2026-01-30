const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3002;

// n8n 服务器配置 - 支持域名或直接IP访问
// 方式1: 域名访问 (通过 Cloudflare)
// const N8N_TARGET = 'https://n8n.denggui.top';

// 方式2: 直接IP访问 (绕过 Cloudflare，适合调试/内部使用)
// 格式: http://YOUR_SERVER_IP:5678 (n8n 默认端口是 5678)
// 例如: const N8N_TARGET = 'http://123.45.67.89:5678';
const N8N_TARGET = process.env.N8N_TARGET || 'https://n8n.denggui.top';

// 启用 CORS - 支持多个端口
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));

// 解析 JSON 和 FormData
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 代理 n8n 请求
app.use('/api/n8n', createProxyMiddleware({
  target: N8N_TARGET,
  changeOrigin: true,
  pathRewrite: {
    '^/api/n8n': '',
  },
  // 增加超时时间以支持长时间运行的 n8n 工作流 (10分钟)
  timeout: 10 * 60 * 1000,
  proxyTimeout: 10 * 60 * 1000,
  onProxyReq: (proxyReq, req, res) => {
    console.log('🔄 代理请求:', proxyReq.method, proxyReq.path);
    console.log('📋 目标服务器:', N8N_TARGET);

    // 设置代理请求超时 (10分钟)
    proxyReq.setTimeout(10 * 60 * 1000, () => {
      console.log('⏰ 代理请求超时 (10分钟)');
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('✅ 代理响应:', proxyRes.statusCode, proxyRes.statusMessage);
  },
  onError: (err, req, res) => {
    console.log('❌ 代理错误:', err.message);
    console.log('❌ 错误详情:', err);

    if (!res.headersSent) {
      res.status(504).json({
        error: 'n8n 请求超时',
        message: 'n8n 工作流执行时间过长，请稍后重试或检查 n8n 服务器状态',
        details: err.message
      });
    }
  },
  // 忽略 SSL 验证错误 (仅用于调试)
  secure: false,
  // 保持连接活跃
  keepAlive: true,
}));

app.listen(PORT, () => {
  console.log(`\n🚀 n8n 代理服务器运行在 http://localhost:${PORT}`);
  console.log(`📡 目标服务器: ${N8N_TARGET}`);
  console.log(`📡 代理路径: http://localhost:${PORT}/api/n8n/* → ${N8N_TARGET}/*`);
  console.log(`⏱️  超时设置: 10 分钟`);
  console.log(`\n✅ CORS 已启用，允许来自以下端口的请求:`);
  console.log(`   - http://localhost:3000`);
  console.log(`   - http://localhost:3001`);
  console.log(`   - http://localhost:5173`);

  if (N8N_TARGET.includes('denggui.top')) {
    console.log(`\n⚠️  当前使用域名访问（通过 Cloudflare）`);
    console.log(`💡 提示: 如遇超时，可使用环境变量 N8N_TARGET 切换为直接IP访问`);
    console.log(`   例如: N8N_TARGET=http://YOUR_SERVER_IP:5678 node proxy-server.cjs\n`);
  } else {
    console.log(`\n✅ 使用直接IP访问（绕过 Cloudflare）\n`);
  }
});
