/**
 * 双轨数据关联查询 API
 * 提供前端任务与飞书记录之间的双向查询
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTaskRepository } from '@/lib/repositories/task.repository';
import { getFeishuService } from '@/lib/services/feishu.service';
import { initializeApp } from '@/lib/app-initialization';

/**
 * GET /api/tasks/link
 * 查询任务与飞书记录的关联关系
 *
 * Query Parameters:
 * - taskId: 本地任务ID → 查询对应的飞书记录
 * - feishuRecordId: 飞书记录ID → 查询对应的本地任务
 */
export async function GET(req: NextRequest) {
  try {
    initializeApp();

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');
    const feishuRecordId = searchParams.get('feishuRecordId');

    // 参数验证
    if (!taskId && !feishuRecordId) {
      return NextResponse.json(
        {
          error: 'Missing query parameter',
          message: 'Please provide either taskId or feishuRecordId',
        },
        { status: 400 }
      );
    }

    const taskRepo = getTaskRepository();
    const feishuService = getFeishuService();

    // 场景1: 通过 taskId 查询飞书记录
    if (taskId) {
      const task = await taskRepo.findById(taskId);

      if (!task) {
        return NextResponse.json(
          { error: 'Task not found', taskId },
          { status: 404 }
        );
      }

      // 如果任务没有关联飞书记录
      if (!task.feishuRecordId) {
        return NextResponse.json({
          task: {
            id: task.id,
            status: task.status,
            createdAt: task.createdAt,
          },
          feishuRecord: null,
          linked: false,
          message: 'Task exists but not linked to Feishu',
        });
      }

      // 查询飞书记录
      try {
        const feishuRecord = await feishuService.getRecord(task.feishuRecordId);

        return NextResponse.json({
          task: {
            id: task.id,
            status: task.status,
            feishuRecordId: task.feishuRecordId,
            createdAt: task.createdAt,
          },
          feishuRecord: {
            recordId: feishuRecord.record_id,
            fields: feishuRecord.fields,
            createdTime: feishuRecord.created_time,
            lastModifiedTime: feishuRecord.last_modified_time,
          },
          linked: true,
        });
      } catch (feishuError) {
        return NextResponse.json({
          task: {
            id: task.id,
            status: task.status,
            feishuRecordId: task.feishuRecordId,
            createdAt: task.createdAt,
          },
          feishuRecord: null,
          linked: false,
          error: 'Feishu record not accessible',
          message: (feishuError as Error).message,
        });
      }
    }

    // 场景2: 通过 feishuRecordId 查询本地任务
    if (feishuRecordId) {
      const task = await taskRepo.findByFeishuRecordId(feishuRecordId);

      if (!task) {
        // 查询飞书记录是否存在
        try {
          const feishuRecord = await feishuService.getRecord(feishuRecordId);
          return NextResponse.json({
            task: null,
            feishuRecord: {
              recordId: feishuRecord.record_id,
              fields: feishuRecord.fields,
              createdTime: feishuRecord.created_time,
            },
            linked: false,
            message: 'Feishu record exists but no linked local task',
          });
        } catch (feishuError) {
          return NextResponse.json(
            {
              error: 'Record not found',
              feishuRecordId,
              message: 'Neither local task nor Feishu record found',
            },
            { status: 404 }
          );
        }
      }

      // 查询飞书记录详情
      try {
        const feishuRecord = await feishuService.getRecord(feishuRecordId);

        return NextResponse.json({
          task: {
            id: task.id,
            status: task.status,
            feishuRecordId: task.feishuRecordId,
            createdAt: task.createdAt,
            completedAt: task.completedAt,
          },
          feishuRecord: {
            recordId: feishuRecord.record_id,
            fields: feishuRecord.fields,
            createdTime: feishuRecord.created_time,
            lastModifiedTime: feishuRecord.last_modified_time,
          },
          linked: true,
        });
      } catch (feishuError) {
        return NextResponse.json({
          task: {
            id: task.id,
            status: task.status,
            feishuRecordId: task.feishuRecordId,
            createdAt: task.createdAt,
          },
          feishuRecord: null,
          linked: false,
          error: 'Feishu record not accessible',
          message: (feishuError as Error).message,
        });
      }
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[API] Failed to query task link:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks/link
 * 手动关联本地任务与飞书记录
 *
 * Body:
 * - taskId: 本地任务ID
 * - feishuRecordId: 飞书记录ID
 */
export async function POST(req: NextRequest) {
  try {
    initializeApp();

    const body = await req.json();
    const { taskId, feishuRecordId } = body;

    // 参数验证
    if (!taskId || !feishuRecordId) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          message: 'Please provide both taskId and feishuRecordId',
        },
        { status: 400 }
      );
    }

    const taskRepo = getTaskRepository();

    // 验证任务存在
    const task = await taskRepo.findById(taskId);
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found', taskId },
        { status: 404 }
      );
    }

    // 验证飞书记录存在
    const feishuService = getFeishuService();
    try {
      await feishuService.getRecord(feishuRecordId);
    } catch (feishuError) {
      return NextResponse.json(
        {
          error: 'Feishu record not found',
          feishuRecordId,
          message: (feishuError as Error).message,
        },
        { status: 404 }
      );
    }

    // 更新任务的 feishuRecordId
    await taskRepo.update(taskId, {
      feishuRecordId,
      feishuAppToken: process.env.FEISHU_BITABLE_APP_TOKEN,
      feishuTableId: process.env.FEISHU_BITABLE_TABLE_ID,
    });

    return NextResponse.json({
      success: true,
      message: 'Task linked to Feishu record successfully',
      task: {
        id: task.id,
        feishuRecordId,
      },
    });
  } catch (error) {
    console.error('[API] Failed to link task:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
