/**
 * 场景生图描述函数
 */

export function getLightingTypeDescription(type: string): string {
  const descriptions: Record<string, string> = {
    natural_window: 'natural window light',
    studio_softbox: 'studio softbox lighting',
    natural_overcast: 'overcast natural light',
    spot_light: 'spotlight',
    rim_light: 'rim/back light',
  };
  return descriptions[type] || type;
}

export function getLightDirectionDescription(direction: string): string {
  const descriptions: Record<string, string> = {
    front: 'front lighting',
    side_45: '45-degree side lighting',
    side_90: '90-degree side lighting',
    back: 'back lighting',
    top: 'top lighting',
  };
  return descriptions[direction] || direction;
}

export function getBackgroundTypeDescription(type: string): string {
  const descriptions: Record<string, string> = {
    white_infinity: 'pure white infinity background',
    black_velvet: 'black velvet background',
    gray_gradient: 'gray gradient background',
    wood_grain: 'wood grain surface',
    marble_texture: 'marble texture surface',
    minimal_studio: 'minimalist studio background',
  };
  return descriptions[type] || type;
}

export function getCompositionAngleDescription(angle: string): string {
  const descriptions: Record<string, string> = {
    eye_level: 'eye-level angle',
    high_angle: 'high angle',
    birds_eye: "bird's eye view",
    three_quarter: 'three-quarter view',
    macro_closeup: 'macro close-up',
  };
  return descriptions[angle] || angle;
}

export function getLensTypeDescription(lens: string): string {
  const descriptions: Record<string, string> = {
    '85mm': '85mm portrait lens',
    '50mm': '50mm standard lens',
    '35mm': '35mm wide-angle lens',
    '100mm': '100mm macro lens',
  };
  return descriptions[lens] || lens;
}

export function getDepthOfFieldDescription(dof: string): string {
  const descriptions: Record<string, string> = {
    shallow: 'shallow depth of field',
    medium: 'medium depth of field',
    deep: 'deep depth of field',
  };
  return descriptions[dof] || dof;
}

export function getPhotographyStyleDescription(style: string): string {
  const descriptions: Record<string, string> = {
    minimalism: 'minimalist',
    luxury: 'luxury high-end',
    rustic: 'rustic natural',
    industrial: 'industrial modern',
    nordic: 'Nordic Scandinavian',
    japanese: 'Japanese serene',
    romantic: 'romantic soft',
    dramatic: 'dramatic high-contrast',
  };
  return descriptions[style] || style;
}

export function getColorSchemeDescription(scheme: string): string {
  const descriptions: Record<string, string> = {
    neutral: 'neutral',
    warm: 'warm tones',
    cool: 'cool tones',
    pastel: 'soft pastel',
    vibrant: 'vibrant saturated',
    monochromatic: 'monochromatic',
  };
  return descriptions[scheme] || scheme;
}
