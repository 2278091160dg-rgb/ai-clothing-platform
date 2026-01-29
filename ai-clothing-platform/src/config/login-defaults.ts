/**
 * 登录页面默认配置
 * 单一数据源，避免多处重复定义
 */

export interface LoginConfig {
  logoUrl?: string;
  logoEmoji: string;
  title: string;
  subtitle1: string;
  subtitle2: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  buttonText: string;
  buttonLoadingText: string;
  footerText: string;
  copyrightText: string;
  backgroundStyle: string;
  backgroundImageUrl?: string;
}

/**
 * 默认登录配置
 * 当数据库中没有配置时使用此默认值
 */
export const DEFAULT_LOGIN_CONFIG: LoginConfig = {
  logoEmoji: '🏭️',
  title: '杭州龙易AI系统',
  subtitle1: '电商AI践行中',
  subtitle2: 'AI智能 · 海报生成 · 场景创作',
  passwordLabel: 'VIP密码',
  passwordPlaceholder: '请输入VIP密码',
  buttonText: '芝麻开门',
  buttonLoadingText: '验证中...',
  footerText: '🔒 系统已启用访问密码保护',
  copyrightText: '© 2026 杭州龙易科技 · v1.0.0',
  backgroundStyle: 'tech-ai',
  backgroundImageUrl:
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop',
};
