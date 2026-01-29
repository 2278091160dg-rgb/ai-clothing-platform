/**
 * Resilience Utilities
 * 弹性和容错工具 - 重试、降级、断路器
 */

/**
 * 重试配置
 */
export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

/**
 * 降级策略配置
 */
export interface FallbackConfig {
  enabled: boolean;
  fallbackValue?: any;
  onFallback?: (error: Error) => void;
}

/**
 * 默认重试配置
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableErrors: [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EAI_AGAIN',
    'Failed to fetch',
    'Network error',
  ],
};

/**
 * 带重试的异步函数执行
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;
  let delay = finalConfig.initialDelayMs;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const isRetryable = isRetryableError(lastError, finalConfig.retryableErrors || []);

      if (attempt === finalConfig.maxAttempts || !isRetryable) {
        console.error(
          `[Retry] Failed after ${attempt} attempt(s):`,
          lastError.message
        );
        throw lastError;
      }

      console.warn(
        `[Retry] Attempt ${attempt} failed, retrying in ${delay}ms:`,
        lastError.message
      );

      await sleep(delay);
      delay = Math.min(delay * finalConfig.backoffMultiplier, finalConfig.maxDelayMs);
    }
  }

  throw lastError;
}

/**
 * 带降级的异步函数执行
 */
export async function withFallback<T>(
  fn: () => Promise<T>,
  fallback: FallbackConfig
): Promise<T> {
  if (!fallback.enabled) {
    return fn();
  }

  try {
    return await fn();
  } catch (error) {
    console.warn('[Fallback] Function failed, using fallback:', (error as Error).message);

    if (fallback.onFallback) {
      fallback.onFallback(error as Error);
    }

    if (fallback.fallbackValue !== undefined) {
      return fallback.fallbackValue as T;
    }

    throw error;
  }
}

/**
 * 同时使用重试和降级
 */
export async function withResilience<T>(
  fn: () => Promise<T>,
  retryConfig: Partial<RetryConfig> = {},
  fallback?: FallbackConfig
): Promise<T> {
  const retryFn = () => withRetry(fn, retryConfig);

  if (fallback) {
    return withFallback(retryFn, fallback);
  }

  return retryFn();
}

/**
 * 判断错误是否可重试
 */
function isRetryableError(error: Error, retryableErrors: string[]): boolean {
  const errorMessage = error.message.toLowerCase();
  return retryableErrors.some(retryableError =>
    errorMessage.includes(retryableError.toLowerCase())
  );
}

/**
 * 延迟函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 断路器状态
 */
enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

/**
 * 断路器配置
 */
export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeoutMs: number;
  monitoringPeriodMs: number;
}

/**
 * 断路器类
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime: number | null = null;

  constructor(private config: CircuitBreakerConfig) {}

  /**
   * 执行函数（带断路器保护）
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        console.log('[CircuitBreaker] Attempting reset...');
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * 成功时重置计数器
   */
  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
      console.log('[CircuitBreaker] Circuit reset to CLOSED');
    }
  }

  /**
   * 失败时增加计数器
   */
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      console.error(
        `[CircuitBreaker] Circuit opened after ${this.failureCount} failures`
      );
    }
  }

  /**
   * 判断是否应该尝试重置
   */
  private shouldAttemptReset(): boolean {
    if (this.lastFailureTime === null) return false;
    return Date.now() - this.lastFailureTime >= this.config.recoveryTimeoutMs;
  }

  /**
   * 获取当前状态
   */
  getState(): { state: CircuitState; failureCount: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
    };
  }

  /**
   * 手动重置断路器
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = null;
    console.log('[CircuitBreaker] Manually reset');
  }
}

/**
 * 创建飞书服务断路器
 */
export function createFeishuCircuitBreaker(): CircuitBreaker {
  return new CircuitBreaker({
    failureThreshold: 5, // 5次失败后打开断路器
    recoveryTimeoutMs: 60000, // 60秒后尝试恢复
    monitoringPeriodMs: 10000, // 10秒监控周期
  });
}
