/**
 * 主题系统配置
 * 支持5种设计风格切换
 */

export type ThemeType =
  | 'minimalist' // 1. 极简主义/SaaS风
  | 'bento' // 2. 苹果/便当盒风格
  | 'glassmorphism' // 3. 毛玻璃/酸性风格
  | 'claymorphism' // 4. 3D黏土/可爱风
  | 'cyberpunk'; // 5. 暗黑科技/数据可视化

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  description: string;
  // CSS变量映射
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    border: string;
    muted: string;
    mutedForeground: string;
  };
  // 自定义样式类
  className?: string;
  // 是否深色模式
  isDark: boolean;
}

export const THEMES: Record<ThemeType, ThemeConfig> = {
  // 1. 极简主义/SaaS风
  minimalist: {
    id: 'minimalist',
    name: '极简主义',
    description: '干净利落的SaaS风格，大量留白',
    colors: {
      background: '0 0% 98%', // #FAFAFA
      foreground: '220 20% 10%', // #1A1A1A
      card: '0 0% 100%', // #FFFFFF
      cardForeground: '220 20% 10%',
      primary: '220 90% 56%', // #3B82F6 蓝色
      primaryForeground: '0 0% 100%',
      secondary: '210 20% 96%', // #F3F4F6
      secondaryForeground: '220 20% 20%',
      accent: '220 90% 56%',
      border: '210 20% 90%', // #E5E7EB
      muted: '210 20% 96%',
      mutedForeground: '220 10% 50%',
    },
    className: 'bg-gray-50',
    isDark: false,
  },

  // 2. 苹果/便当盒风格
  bento: {
    id: 'bento',
    name: '便当盒风格',
    description: 'Apple设计，模块化卡片，精致细节',
    colors: {
      background: '240 10% 96%', // #F5F5F7
      foreground: '240 10% 10%',
      card: '0 0% 100%',
      cardForeground: '240 10% 10%',
      primary: '240 5% 20%', // 深灰
      primaryForeground: '0 0% 100%',
      secondary: '240 10% 94%',
      secondaryForeground: '240 10% 20%',
      accent: '240 5% 30%',
      border: '240 10% 90%',
      muted: '240 10% 94%',
      mutedForeground: '240 10% 40%',
    },
    className: 'bg-apple-gray',
    isDark: false,
  },

  // 3. 毛玻璃/酸性风格
  glassmorphism: {
    id: 'glassmorphism',
    name: '毛玻璃风格',
    description: '鲜艳渐变，玻璃拟态，未来感',
    colors: {
      background: '280 60% 10%', // 深紫背景
      foreground: '0 0% 100%',
      card: '280 60% 15%',
      cardForeground: '0 0% 100%',
      primary: '280 80% 60%', // 紫罗兰
      primaryForeground: '0 0% 100%',
      secondary: '280 60% 20%',
      secondaryForeground: '0 0% 100%',
      accent: '180 80% 60%', // 青色
      border: '280 50% 30%',
      muted: '280 60% 20%',
      mutedForeground: '0 0% 60%',
    },
    className: 'bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900',
    isDark: true,
  },

  // 4. 3D黏土/可爱风
  claymorphism: {
    id: 'claymorphism',
    name: '黏土风格',
    description: '马卡龙配色，圆润可爱，3D质感',
    colors: {
      background: '350 80% 96%', // 粉白
      foreground: '350 20% 20%',
      card: '0 0% 100%',
      cardForeground: '350 20% 20%',
      primary: '350 80% 60%', // 粉色
      primaryForeground: '0 0% 100%',
      secondary: '40 80% 96%', // 浅蓝
      secondaryForeground: '40 20% 30%',
      accent: '180 60% 60%', // 薄荷绿
      border: '350 50% 90%',
      muted: '350 50% 94%',
      mutedForeground: '350 20% 40%',
    },
    className: 'bg-pink-50',
    isDark: false,
  },

  // 5. 暗黑科技/数据可视化
  cyberpunk: {
    id: 'cyberpunk',
    name: '暗黑科技',
    description: '赛博朋克，霓虹色彩，数据可视化',
    colors: {
      background: '225 30% 8%', // 深午夜蓝
      foreground: '0 0% 100%',
      card: '225 30% 10%',
      cardForeground: '0 0% 100%',
      primary: '190 90% 60%', // 青色
      primaryForeground: '225 30% 8%',
      secondary: '225 30% 15%',
      secondaryForeground: '0 0% 100%',
      accent: '320 90% 60%', // 霓虹粉
      border: '217 91% 30%',
      muted: '225 30% 20%',
      mutedForeground: '0 0% 60%',
    },
    className: 'bg-cyberpunk',
    isDark: true,
  },
};

// 获取当前主题
export function getTheme(themeType: ThemeType): ThemeConfig {
  return THEMES[themeType];
}

// 应用主题到DOM
export function applyTheme(theme: ThemeConfig) {
  const root = document.documentElement;

  // 设置CSS变量
  root.style.setProperty('--background', theme.colors.background);
  root.style.setProperty('--foreground', theme.colors.foreground);
  root.style.setProperty('--card', theme.colors.card);
  root.style.setProperty('--card-foreground', theme.colors.cardForeground);
  root.style.setProperty('--primary', theme.colors.primary);
  root.style.setProperty('--primary-foreground', theme.colors.primaryForeground);
  root.style.setProperty('--secondary', theme.colors.secondary);
  root.style.setProperty('--secondary-foreground', theme.colors.secondaryForeground);
  root.style.setProperty('--accent', theme.colors.accent);
  root.style.setProperty('--border', theme.colors.border);
  root.style.setProperty('--muted', theme.colors.muted);
  root.style.setProperty('--muted-foreground', theme.colors.mutedForeground);

  // 设置data属性
  root.setAttribute('data-theme', theme.id);

  // 设置深色模式
  if (theme.isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// 从localStorage读取主题
export function getStoredTheme(): ThemeType {
  if (typeof window === 'undefined') return 'cyberpunk';

  const stored = localStorage.getItem('ui-theme');
  if (stored && stored in THEMES) {
    return stored as ThemeType;
  }
  return 'cyberpunk'; // 默认主题
}

// 保存主题到localStorage
export function saveTheme(themeType: ThemeType) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ui-theme', themeType);
}
