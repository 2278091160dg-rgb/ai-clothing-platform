/**
 * Circuit Breaker Monitoring API
 * 断路器状态监控端点
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { getFeishuCircuitBreakerState } from '@/lib/events/feishu-listeners';

/**
 * GET /api/monitoring/circuit-breaker
 * 获取断路器状态
 */
export async function GET(_req: NextRequest) {
  try {
    const state = getFeishuCircuitBreakerState();

    return NextResponse.json({
      service: 'feishu-sync',
      state: state.state,
      failureCount: state.failureCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: 'Failed to get circuit breaker state',
        message,
      },
      { status: 500 }
    );
  }
}
