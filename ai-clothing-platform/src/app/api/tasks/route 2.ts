/**
 * Tasks API Route
 * 处理任务的创建和查询
 */

import { NextRequest } from 'next/server';
import { handleCreateTask } from '@/lib/api/tasks/handlers/create-task.handler';
import { handleGetTasks } from '@/lib/api/tasks/handlers/get-tasks.handler';

/**
 * POST /api/tasks - 创建新任务
 */
export async function POST(req: NextRequest) {
  return handleCreateTask(req);
}

/**
 * GET /api/tasks - 查询任务列表
 */
export async function GET(req: NextRequest) {
  return handleGetTasks(req);
}
