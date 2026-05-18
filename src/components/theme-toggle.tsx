"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

type ThemeCycle = 'light' | 'dark' | 'system';
const THEME_CYCLE: ThemeCycle[] = ['light', 'dark', 'system'];
const THEME_ICONS: Record<ThemeCycle, typeof Sun> = { light: Sun, dark: Moon, system: Monitor };

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const current: ThemeCycle = (theme as ThemeCycle) || 'system';
  const nextIndex = (THEME_CYCLE.indexOf(current) + 1) % THEME_CYCLE.length;
  const nextTheme = THEME_CYCLE[nextIndex];
  const Icon = THEME_ICONS[current];

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={() => setTheme(nextTheme)}
      title={`Theme: ${current} (next: ${nextTheme})`}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}