/**
 * Circuit Breaker Monitoring API
 * 断路器状态监控端点
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFeishuCircuitBreakerState } from '@/lib/events/feishu-listeners';

/**
 * GET /api/monitoring/circuit-breaker
 * 获取断路器状态
 */
export async function GET(req: NextRequest) {
  try {
    const state = getFeishuCircuitBreakerState();

    return NextResponse.json({
      service: 'feishu-sync',
      state: state.state,
      failureCount: state.failureCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to get circuit breaker state',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
