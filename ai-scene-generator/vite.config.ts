import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // 代理所有 n8n API 请求，解决 CORS 问题
      '/api/n8n': {
        target: process.env.VITE_N8N_API_URL || 'https://your-n8n-instance.com',
        changeOrigin: true,
        secure: false, // 忽略SSL证书验证错误
        rewrite: (path) => path.replace(/^\/api\/n8n/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔄 代理请求:', proxyReq.method, proxyReq.path);
          });
          proxy.on('error', (err, req, res) => {
            console.log('❌ 代理错误:', err.message);
          });
        }
      }
    }
  }
})
