/**
 * 主题提供者组件
 * 在应用启动时应用保存的主题
 */

'use client';

import { useEffect } from 'react';
import { getStoredTheme, getTheme, applyTheme } from '@/lib/themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 应用保存的主题
    const themeType = getStoredTheme();
    const theme = getTheme(themeType);
    applyTheme(theme);
  }, []);

  return <>{children}</>;
}
