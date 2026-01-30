/**
 * EventBus - 事件总线
 * 实现事件驱动架构的核心
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
type EventHandler<T = unknown> = (event: T) => Promise<void> | void;

interface EventBusConfig {
  maxListeners?: number;
  errorHandler?: (error: Error, event: unknown, handler: EventHandler) => void;
}

export class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private config: Required<EventBusConfig>;

  constructor(config: EventBusConfig = {}) {
    this.config = {
      maxListeners: config.maxListeners || 100,
      errorHandler: config.errorHandler || this.defaultErrorHandler,
    };
  }

  private defaultErrorHandler(error: Error, event: unknown, _handler: EventHandler) {
    console.error(`Error in event handler for ${event}:`, error);
  }

  /**
   * 订阅事件
   */
  on<T = unknown>(eventName: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }

    const handlers = this.listeners.get(eventName)!;

    if (handlers.size >= this.config.maxListeners) {
      console.warn(`Max listeners (${this.config.maxListeners}) reached for event: ${eventName}`);
    }

    handlers.add(handler as EventHandler);

    // 返回取消订阅函数
    return () => {
      this.off(eventName, handler as EventHandler);
    };
  }

  /**
   * 取消订阅
   */
  off(eventName: string, handler: EventHandler): void {
    const handlers = this.listeners.get(eventName);
    if (handlers) {
      handlers.delete(handler as EventHandler);
      if (handlers.size === 0) {
        this.listeners.delete(eventName);
      }
    }
  }

  /**
   * 发布事件（同步）
   */
  emit<T = unknown>(eventName: string, event: T): void {
    const handlers = this.listeners.get(eventName);
    if (!handlers || handlers.size === 0) {
      return;
    }

    for (const handler of handlers) {
      try {
        const result = handler(event);
        // 如果返回Promise，处理错误但不等待
        if (result instanceof Promise) {
          result.catch(error => {
            this.config.errorHandler(error as Error, event, handler);
          });
        }
      } catch (error) {
        this.config.errorHandler(error as Error, event, handler);
      }
    }
  }

  /**
   * 发布事件（异步，等待所有处理器完成）
   */
  async emitAsync<T = unknown>(eventName: string, event: T): Promise<void> {
    const handlers = this.listeners.get(eventName);
    if (!handlers || handlers.size === 0) {
      return;
    }

    const promises = Array.from(handlers).map(async handler => {
      try {
        await handler(event);
      } catch (error) {
        this.config.errorHandler(error as Error, event, handler);
      }
    });

    await Promise.all(promises);
  }

  /**
   * 一次性订阅
   */
  once<T = unknown>(eventName: string, handler: EventHandler<T>): () => void {
    const wrappedHandler: EventHandler<T> = event => {
      handler(event);
      this.off(eventName, wrappedHandler as EventHandler);
    };

    return this.on(eventName, wrappedHandler as EventHandler);
  }

  /**
   * 清空所有监听器
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * 清空特定事件的所有监听器
   */
  clearEvent(eventName: string): void {
    this.listeners.delete(eventName);
  }

  /**
   * 获取事件监听器数量
   */
  listenerCount(eventName: string): number {
    return this.listeners.get(eventName)?.size || 0;
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }
}

// 创建全局单例
let globalEventBusInstance: EventBus | null = null;

export function getEventBus(): EventBus {
  if (!globalEventBusInstance) {
    globalEventBusInstance = new EventBus({
      maxListeners: 100,
      errorHandler: (error, event, handler) => {
        console.error(`[EventBus] Error in handler:`, {
          error: error.message,
          event,
          handler: handler.name || 'anonymous',
        });
      },
    });
  }
  return globalEventBusInstance;
}
