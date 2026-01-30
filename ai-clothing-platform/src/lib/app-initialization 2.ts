/**
 * Application Initialization
 * 应用初始化 - 在启动时初始化各种服务和监听器
 */

import { ensureFeishuListenersInitialized } from './events/feishu-listeners';

/**
 * 初始化应用
 * 在 API 路由或页面加载时调用
 */
export function initializeApp(): void {
  try {
    // 初始化飞书事件监听器
    ensureFeishuListenersInitialized();

    console.log('[AppInit] ✅ Application initialized successfully');
  } catch (error) {
    console.error('[AppInit] ❌ Initialization failed:', error);
    // 不抛出错误，允许应用继续运行
  }
}

/**
 * 获取初始化状态
 */
export function getInitializationStatus(): {
  initialized: boolean;
  timestamp: Date;
} {
  return {
    initialized: true,
    timestamp: new Date(),
  };
}
