/**
 * 任务状态映射工具函数
 *
 * 功能：
 * - 飞书状态 -> HistoryTask 状态映射
 * - 状态 -> 进度百分比映射
 * - FeishuRecord -> HistoryTask 数据映射
 * - 超时检测
 */

import type { HistoryTask, HistoryTaskStatus, FeishuRecord } from '@/lib/types/history.types';
import type { ImageModel } from '@/lib/types';

/**
 * 状态映射：飞书状态 -> HistoryTask 状态
 */
export function mapFeishuStatus(feishuStatus: string): HistoryTaskStatus {
  // 直接检查原始状态（不使用 toLowerCase，因为中文需要原样匹配）
  if (feishuStatus === '待处理' || feishuStatus === 'pending' || feishuStatus === 'Pending')
    return 'pending';
  if (feishuStatus === '处理中' || feishuStatus === 'processing' || feishuStatus === 'Processing')
    return 'processing';
  if (
    feishuStatus === '已完成' ||
    feishuStatus === '完成' ||
    feishuStatus === 'completed' ||
    feishuStatus === 'Completed'
  )
    return 'completed';
  if (feishuStatus === '失败' || feishuStatus === 'failed' || feishuStatus === 'Failed')
    return 'failed';
  return 'pending';
}

/**
 * 进度映射：状态 -> 进度百分比
 */
export function mapStatusToProgress(status: string): number {
  if (status === '待处理' || status === 'pending' || status === 'Pending') return 0;
  if (status === '处理中' || status === 'processing' || status === 'Processing') return 50;
  if (status === '已完成' || status === '完成' || status === 'completed' || status === 'Completed')
    return 100;
  if (status === '失败' || status === 'failed' || status === 'Failed') return 0;
  return 0;
}

/**
 * 任务超时检测配置
 */
const TIMEOUT_MINUTES = 10;

/**
 * 检测任务是否超时
 */
export function isTaskTimeout(record: FeishuRecord): boolean {
  const hasResultImage = !!record.resultImageUrl;
  const createdDate = record.created_time ? new Date(record.created_time) : new Date();
  const taskAgeMinutes = (Date.now() - createdDate.getTime()) / (1000 * 60);

  // 超时判定：无结果图 且 超过 10 分钟 → 超时
  return !hasResultImage && taskAgeMinutes > TIMEOUT_MINUTES;
}

/**
 * 根据图片和状态确定任务状态
 */
export function determineTaskStatus(record: FeishuRecord): {
  status: HistoryTaskStatus;
  progress: number;
} {
  const hasResultImage = !!record.resultImageUrl;
  const hasSceneImage = !!record.sceneImageUrl;
  const hasProductImage = !!record.productImageUrl;

  // 优先级 1: 图片优先策略 - 只要有结果图，强制为完成
  if (hasResultImage) {
    return { status: 'completed', progress: 100 };
  }

  // 优先级 2: 有输入图但没有结果图 = 处理中
  if (hasSceneImage || hasProductImage) {
    return { status: 'processing', progress: 50 };
  }

  // 优先级 3: 无图时，根据飞书状态判断
  const rawStatus = record.status?.toLowerCase() || '';
  if (
    rawStatus.includes('处理中') ||
    rawStatus.includes('processing') ||
    rawStatus.includes('generating')
  ) {
    return { status: 'processing', progress: 50 };
  } else if (rawStatus.includes('完成') || rawStatus.includes('completed')) {
    return { status: 'completed', progress: 100 };
  } else {
    return { status: 'pending', progress: 0 };
  }
}

/**
 * 检查任务来源类型
 */
export function determineTaskSource(record: FeishuRecord): 'web' | 'feishu' {
  const source = record.source || '';
  return source.includes('表格端') ? 'feishu' : 'web';
}

/**
 * 创建显示名称
 */
export function createDisplayName(record: FeishuRecord): string {
  if (record.prompt) {
    return record.prompt.length > 15 ? record.prompt.slice(0, 15) + '...' : record.prompt;
  }

  const createdDate = record.created_time ? new Date(record.created_time) : new Date();
  const isValidDate = !isNaN(createdDate.getTime());
  return `场景生成 ${isValidDate ? createdDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '刚刚'}`;
}

/**
 * 完整的 FeishuRecord -> HistoryTask 映射
 */
export function mapFeishuRecordToHistoryTask(record: FeishuRecord): HistoryTask {
  const taskSource = determineTaskSource(record);
  const { status: taskStatus, progress } = determineTaskStatus(record);

  // 超时检测（覆盖上面的状态）
  let finalStatus = taskStatus;
  let finalProgress = progress;

  if (isTaskTimeout(record)) {
    finalStatus = 'failed';
    finalProgress = 0;
  }

  const createdDate = record.created_time ? new Date(record.created_time) : new Date();
  const isValidDate = !isNaN(createdDate.getTime());

  return {
    id: record.record_id,
    recordId: record.record_id,
    productName: createDisplayName(record),
    prompt: record.prompt || '',
    negativePrompt: record.negativePrompt || '',
    config: {
      imageModel: (record.model || 'flux-1.1-pro') as ImageModel,
      aspectRatio: (record.ratio || '3:4') as string,
    },
    status: finalStatus,
    progress: finalProgress,
    resultImages: record.resultImageUrl ? [record.resultImageUrl] : undefined,
    productImagePreview: record.productImageUrl,
    sceneImagePreview: record.sceneImageUrl,
    createdAt: isValidDate ? createdDate : new Date(),
    source: taskSource,
    type: taskSource,
  };
}
