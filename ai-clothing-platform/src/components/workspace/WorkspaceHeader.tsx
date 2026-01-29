/**
 * WorkspaceHeader - 工作区顶部导航栏
 */

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { LayoutGrid, History, Database, Settings, Sparkles } from 'lucide-react';

interface BrandConfig {
  title: string;
  subtitle: string;
  icon: string;
  logoImage?: string;
}

interface WorkspaceHeaderProps {
  brandConfig: BrandConfig;
  onLoginSettings: () => void;
  onConfig: () => void;
  onLogout: () => void;
  userInitial?: string;
}

export function WorkspaceHeader({
  brandConfig,
  onLoginSettings,
  onConfig,
  onLogout,
  userInitial = 'D',
}: WorkspaceHeaderProps) {
  return (
    <header className="h-16 border-b border-border/30 flex items-center justify-between px-8 sticky top-0 z-50 bg-card/60 backdrop-blur-xl">
      {/* 左侧：Logo 和导航 */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30 text-white text-lg font-bold overflow-hidden">
            {brandConfig.logoImage ? (
              <img src={brandConfig.logoImage} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              brandConfig.icon
            )}
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-foreground tracking-tight">
              {brandConfig.title}
            </h1>
            <p className="text-[11px] text-muted-foreground">{brandConfig.subtitle}</p>
          </div>
        </div>

        {/* 导航链接 */}
        <nav className="flex items-center gap-6 ml-8">
          <a className="text-[14px] font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2">
            <LayoutGrid size={16} />
            工作台
          </a>
          <a className="text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            <History size={16} />
            任务历史
          </a>
          <a className="text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            <Database size={16} />
            素材库
          </a>
        </nav>
      </div>

      {/* 右侧：状态和操作按钮 */}
      <div className="flex items-center gap-4">
        {/* 系统状态 */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm border border-border/30 shadow-sm">
          <div className="status-online" />
          <span className="text-xs text-foreground font-medium">系统在线</span>
        </div>

        {/* 使用次数 */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 backdrop-blur-sm border border-border/30">
          <Sparkles size={16} className="text-primary" />
          <span className="text-xs text-primary font-semibold">850次</span>
        </div>

        {/* 主题切换 */}
        <ThemeSwitcher />
        <ThemeToggle />

        {/* 登录设置按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onLoginSettings}
          className="h-9 px-3 rounded-xl hover:bg-card/60 text-foreground text-xs"
          title="登录页面设置"
        >
          登录设置
        </Button>

        {/* 设置按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onConfig}
          className="h-9 w-9 p-0 rounded-xl hover:bg-card/60 text-foreground"
        >
          <Settings size={18} />
        </Button>

        {/* 退出按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="h-9 px-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 text-muted-foreground text-xs"
          title="退出登录"
        >
          退出
        </Button>

        {/* 用户头像 */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary/30 ring-2 ring-blue-500/30">
          {userInitial}
        </div>
      </div>
    </header>
  );
}
