/**
 * CircuitBreaker - 熔断器模式实现
 *
 * 用于保护系统免受级联故障影响
 * - CLOSED: 正常工作
 * - OPEN: 熔断开启，拒绝请求
 * - HALF_OPEN: 半开状态，尝试恢复
 */

/**
 * Circuit Breaker States (熔断器状态)
 */
export enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

/**
 * Circuit Breaker Configuration (熔断器配置)
 */
export interface CircuitBreakerConfig {
  failureThreshold: number; // 失败阈值
  recoveryTimeoutMs: number; // 恢复超时时间
  halfOpenMaxCalls: number; // 半开状态最大调用次数
}

/**
 * Circuit Breaker Status (熔断器状态信息)
 */
export interface CircuitBreakerStatus {
  state: CircuitBreakerState;
  failureCount: number;
  lastFailureTime: number | null;
}

/**
 * Circuit Breaker (熔断器)
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private halfOpenCallCount: number = 0;

  constructor(private config: CircuitBreakerConfig) {}

  /**
   * 检查是否可以执行请求
   */
  canExecute(): boolean {
    const now = Date.now();

    if (this.state === CircuitBreakerState.OPEN) {
      // 检查是否可以尝试恢复
      if (now - this.lastFailureTime >= this.config.recoveryTimeoutMs) {
        this.state = CircuitBreakerState.HALF_OPEN;
        this.halfOpenCallCount = 0;
        return true;
      }
      return false;
    }

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      // 半开状态允许有限数量的请求
      return this.halfOpenCallCount < this.config.halfOpenMaxCalls;
    }

    return true;
  }

  /**
   * 记录成功
   */
  recordSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.halfOpenCallCount++;

      // 如果半开状态的请求都成功，则恢复到关闭状态
      if (this.halfOpenCallCount >= this.config.halfOpenMaxCalls) {
        this.state = CircuitBreakerState.CLOSED;
      }
    }
  }

  /**
   * 记录失败
   */
  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      console.error(`[CircuitBreaker] Circuit opened after ${this.failureCount} failures`);
    }
  }

  /**
   * 获取当前状态
   */
  getState(): CircuitBreakerState {
    return this.state;
  }

  /**
   * 获取完整状态信息
   */
  getStatus(): CircuitBreakerStatus {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime || null,
    };
  }

  /**
   * 重置熔断器
   */
  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.halfOpenCallCount = 0;
  }
}
