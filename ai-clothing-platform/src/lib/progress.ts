/**
 * AI生成进度管理
 * 提供步骤定义、时间估算和进度计算功能
 */

import type { StepInfo, GenerationStep } from './types';

// 生成步骤定义
export const GENERATION_STEPS: Record<GenerationStep, StepInfo> = {
  analyzing: {
    id: 'analyzing',
    name: '分析中',
    description: '正在分析提示词和图片...',
    duration: 3,
  },
  preprocessing: {
    id: 'preprocessing',
    name: '预处理',
    description: '正在预处理图片素材...',
    duration: 5,
  },
  generating: {
    id: 'generating',
    name: '生成中',
    description: 'AI正在生成场景图...',
    duration: 15,
  },
  upscaling: {
    id: 'upscaling',
    name: '优化中',
    description: '正在放大和优化图片...',
    duration: 8,
  },
  finalizing: {
    id: 'finalizing',
    name: '完成中',
    description: '正在进行最终处理...',
    duration: 4,
  },
};

// 获取所有步骤的顺序
export const STEP_ORDER: GenerationStep[] = [
  'analyzing',
  'preprocessing',
  'generating',
  'upscaling',
  'finalizing',
];

// 计算总预计时间
export function getTotalEstimatedTime(): number {
  return STEP_ORDER.reduce((total, step) => {
    return total + GENERATION_STEPS[step].duration;
  }, 0);
}

// 根据当前步骤和进度计算剩余时间
export function calculateTimeRemaining(currentStep: GenerationStep, stepProgress: number): number {
  const stepIndex = STEP_ORDER.indexOf(currentStep);
  if (stepIndex === -1) return getTotalEstimatedTime();

  let remaining = 0;

  // 当前步骤剩余时间
  const currentStepInfo = GENERATION_STEPS[currentStep];
  remaining += currentStepInfo.duration * (1 - stepProgress / 100);

  // 后续步骤时间
  for (let i = stepIndex + 1; i < STEP_ORDER.length; i++) {
    const step = STEP_ORDER[i];
    remaining += GENERATION_STEPS[step].duration;
  }

  return Math.ceil(remaining);
}

// 格式化时间显示
export function formatTimeRemaining(seconds: number): string {
  if (seconds < 60) {
    return `约 ${seconds} 秒`;
  } else {
    const minutes = Math.ceil(seconds / 60);
    return `约 ${minutes} 分钟`;
  }
}

// 根据总体进度计算当前步骤
export function getCurrentStepByProgress(progress: number): GenerationStep {
  const totalSteps = STEP_ORDER.length;
  const stepSize = 100 / totalSteps;
  const stepIndex = Math.min(Math.floor(progress / stepSize), totalSteps - 1);

  return STEP_ORDER[stepIndex];
}

// 计算步骤内进度（0-100）
export function calculateStepProgress(overallProgress: number): number {
  const totalSteps = STEP_ORDER.length;
  const stepSize = 100 / totalSteps;
  const stepProgress = ((overallProgress % stepSize) / stepSize) * 100;

  return stepProgress;
}
