/**
 * Task Request Validation
 * 验证不同模式的任务创建请求
 */

import type { CreateTaskRequest } from '../types/create-task.types';

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 根据mode验证请求
 */
export function validateRequestByMode(body: CreateTaskRequest): ValidationResult {
  switch (body.mode) {
    case 'scene':
      if (!body.productImageUrl) {
        return { valid: false, error: '商品图不能为空' };
      }
      break;

    case 'tryon':
      if (!body.clothingImageUrl) {
        return { valid: false, error: '服装图不能为空' };
      }
      break;

    case 'wear':
      if (!body.wearProductImageUrl || !body.wearReferenceImageUrl) {
        return { valid: false, error: '商品图和参考图不能为空' };
      }
      break;

    case 'combine':
      if (!body.materialImageUrls || body.materialImageUrls.length === 0) {
        return { valid: false, error: '素材图不能为空' };
      }
      break;

    default:
      return { valid: false, error: '无效的生成模式' };
  }

  return { valid: true };
}
