'use client'

import { Button } from "@heroui/react";
import { useTheme } from "next-themes";
import { RiMoonFill, RiSunFill } from "@remixicon/react";

export function ThemeSwitcher() {
    const { setTheme } = useTheme();
  
    const toggleTheme = () => {
      const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      setTheme(currentTheme === 'light' ? 'dark' : 'light');
    };
  
    return (
      <Button
        isIconOnly
        variant="flat"
        aria-label="theme switcher"
        onPress={toggleTheme}
        suppressHydrationWarning
      >
        {/* 使用 CSS 来控制图标显示，避免 JavaScript hydration 问题 */}
        {/* dark:hidden 表示在深色模式下隐藏,所以在浅色模式下显示月亮图标 */}
        <span className="dark:hidden">
          <RiMoonFill className="w-4 h-4"/>
        </span>
        {/* hidden 表示默认隐藏, dark:inline 表示在深色模式下显示太阳图标 */}  
        <span className="hidden dark:inline">
          <RiSunFill className="w-4 h-4"/>
        </span>
      </Button>
    );
}