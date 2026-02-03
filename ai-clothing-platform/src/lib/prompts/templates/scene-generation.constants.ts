/**
 * 场景生图常量定义
 */

export const LIGHTING_TYPES = {
  natural: '自然光',
  studio: '影棚光',
  soft: '柔光',
  dramatic: '戏剧光',
  backlit: '逆光',
  sidelighting: '侧光',
} as const;

export const BACKGROUND_TYPES = {
  white: '纯白背景',
  gradient: '渐变背景',
  solid: '纯色背景',
  lifestyle: '生活场景',
  minimal: '极简背景',
  textured: '纹理背景',
} as const;

export const PHOTOGRAPHY_STYLES = {
  commercial: '商业摄影',
  editorial: '杂志摄影',
  catalog: '目录摄影',
  lifestyle: '生活方式摄影',
  minimalist: '极简摄影',
  luxury: '奢华摄影',
} as const;

export const LENS_TYPES = {
  standard: '标准镜头',
  wide: '广角镜头',
  telephoto: '长焦镜头',
  macro: '微距镜头',
} as const;

export const COMPOSITION_ANGLES = {
  front: '正面视角',
  three_quarter: '3/4视角',
  side: '侧面视角',
  top: '俯视视角',
  diagonal: '对角视角',
} as const;
