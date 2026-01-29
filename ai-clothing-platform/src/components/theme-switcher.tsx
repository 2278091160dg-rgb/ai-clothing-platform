/**
 * 主题切换器组件
 * 支持5种设计风格切换
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  THEMES,
  type ThemeType,
  getStoredTheme,
  saveTheme,
  applyTheme,
  getTheme,
} from '@/lib/themes';

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(getStoredTheme());
  const [isOpen, setIsOpen] = useState(false);

  // 应用主题
  useEffect(() => {
    const theme = getTheme(currentTheme);
    applyTheme(theme);
  }, [currentTheme]);

  const handleThemeChange = (themeType: ThemeType) => {
    setCurrentTheme(themeType);
    saveTheme(themeType);
    setIsOpen(false);
  };

  const theme = getTheme(currentTheme);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 px-3 gap-2 hover:bg-slate-800/60"
      >
        <span className="text-lg">🎨</span>
        <span className="text-xs">{theme.name}</span>
      </Button>

      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* 主题选择面板 */}
          <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-slate-900/95 backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-2xl p-4">
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground font-medium mb-3">选择界面风格</div>

              {Object.values(THEMES).map(t => (
                <button
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    currentTheme === t.id
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'bg-slate-900/50 border border-transparent hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* 主题预览色块 */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg border border-white/10 shadow-lg"
                      style={{
                        background: `hsl(${t.colors.primary})`,
                        color: `hsl(${t.colors.primaryForeground})`,
                      }}
                    >
                      {t.id === 'minimalist' && '📋'}
                      {t.id === 'bento' && '🍱'}
                      {t.id === 'glassmorphism' && '🔮'}
                      {t.id === 'claymorphism' && '🎨'}
                      {t.id === 'cyberpunk' && '🤖'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{t.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{t.description}</div>
                    </div>

                    {/* 选中指示器 */}
                    {currentTheme === t.id && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
