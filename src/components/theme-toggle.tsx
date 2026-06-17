"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/intlStub";

const THEMES = [
  { value: "light", key: "themeLight" as const, icon: Sun, shortcut: "⌘L" },
  { value: "dark", key: "themeDark" as const, icon: Moon, shortcut: "⌘D" },
  { value: "system", key: "themeSystem" as const, icon: Monitor, shortcut: "⌘S" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const t = useTranslations('common');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" aria-label={t('themeLabel')}>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const currentTheme = THEMES.find((t) => t.value === theme) || THEMES[2];
  const Icon = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          aria-label={`${t('themeLabel')}: ${t(currentTheme.key)}`}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {t('themeLabel')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEMES.map(({ value, key, icon: ThemeIcon, shortcut }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="cursor-pointer"
          >
            <ThemeIcon className="mr-2 h-4 w-4" />
            <span className="flex-1">{t(key)}</span>
            {theme === value && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {resolvedTheme === value ? t('themeActive') : `→ ${t(resolvedTheme === 'light' ? 'themeLight' : 'themeDark')}`}
              </span>
            )}
            <span className="ml-2 text-xs text-muted-foreground">{shortcut}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
