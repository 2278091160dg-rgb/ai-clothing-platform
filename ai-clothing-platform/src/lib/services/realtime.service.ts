/**
 * RealtimeService - 实时推送服务
 * 使用 Server-Sent Events (SSE) 实现实时推送
 */

import { getEventBus } from '../events/event-bus';
import { EventNames } from '../events/events';

interface RealtimeMessage {
  type: string;
  data: unknown;
}

type MessageHandler = (data: RealtimeMessage) => void;

type Connection = {
  userId: string;
  handler: MessageHandler;
};

export class RealtimeService {
  private connections: Map<string, Set<Connection>> = new Map();

  constructor() {
    this.initializeEventListeners();
  }

  /**
   * 初始化事件监听器
   */
  private initializeEventListeners() {
    const eventBus = getEventBus();

    // 监听任务进度事件
    eventBus.on(EventNames.TASK_PROGRESS, event => {
      this.broadcastToUser(event.userId, {
        type: 'task.progress',
        data: event,
      });
    });

    // 监听任务完成事件
    eventBus.on(EventNames.TASK_COMPLETED, event => {
      this.broadcastToUser(event.userId, {
        type: 'task.completed',
        data: event,
      });
    });

    // 监听任务失败事件
    eventBus.on(EventNames.TASK_FAILED, event => {
      this.broadcastToUser(event.userId, {
        type: 'task.failed',
        data: event,
      });
    });

    console.log('[Realtime] Event listeners initialized');
  }

  /**
   * 订阅用户频道
   */
  subscribe(userId: string, handler: MessageHandler): () => void {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }

    const connection: Connection = { userId, handler };
    this.connections.get(userId)!.add(connection);

    // 返回取消订阅函数
    return () => {
      this.unsubscribe(userId, handler);
    };
  }

  /**
   * 取消订阅
   */
  private unsubscribe(userId: string, handler: MessageHandler) {
    const connections = this.connections.get(userId);
    if (connections) {
      // Find and delete the connection with matching handler
      for (const conn of connections) {
        if (conn.handler === handler) {
          connections.delete(conn);
          break;
        }
      }

      if (connections.size === 0) {
        this.connections.delete(userId);
      }
    }
  }

  /**
   * 向特定用户广播消息
   */
  private broadcastToUser(userId: string, message: RealtimeMessage) {
    const connections = this.connections.get(userId);
    if (!connections || connections.size === 0) {
      return;
    }

    for (const connection of connections) {
      try {
        connection.handler(message);
      } catch (error) {
        console.error(`[Realtime] Error sending message to user ${userId}:`, error);
      }
    }
  }

  /**
   * 获取在线用户数量
   */
  getOnlineUserCount(): number {
    return this.connections.size;
  }

  /**
   * 获取特定用户的连接数
   */
  getUserConnectionCount(userId: string): number {
    return this.connections.get(userId)?.size || 0;
  }

  /**
   * 清理所有连接
   */
  clear() {
    this.connections.clear();
  }
}

// 创建单例实例
let realtimeServiceInstance: RealtimeService | null = null;

export function getRealtimeService(): RealtimeService {
  if (!realtimeServiceInstance) {
    realtimeServiceInstance = new RealtimeService();
  }
  return realtimeServiceInstance;
}

/**
 * 创建SSE响应流
 */
export function createSSEStream(userId: string) {
  const realtimeService = getRealtimeService();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 发送初始连接消息
      const data = `data: ${JSON.stringify({ type: 'connected', userId })}\n\n`;
      controller.enqueue(encoder.encode(data));

      // 订阅实时消息
      const unsubscribe = realtimeService.subscribe(userId, message => {
        try {
          const data = `data: ${JSON.stringify(message)}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch (error) {
          console.error('[SSE] Error encoding message:', error);
        }
      });

      // 发送心跳
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);

      // 清理函数
      return () => {
        clearInterval(heartbeat);
        unsubscribe();
      };
    },
    cancel() {
      console.log(`[SSE] Connection closed for user ${userId}`);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
