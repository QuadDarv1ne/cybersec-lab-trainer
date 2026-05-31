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

const THEMES = [
  { value: "light", label: "Светлая", icon: Sun, shortcut: "⌘L" },
  { value: "dark", label: "Тёмная", icon: Moon, shortcut: "⌘D" },
  { value: "system", label: "Системная", icon: Monitor, shortcut: "⌘S" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Theme">
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
          aria-label={`Theme: ${currentTheme.label}`}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Тема оформления
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEMES.map(({ value, label, icon: ThemeIcon, shortcut }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="cursor-pointer"
          >
            <ThemeIcon className="mr-2 h-4 w-4" />
            <span className="flex-1">{label}</span>
            {theme === value && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {resolvedTheme === value ? "активна" : `→ ${resolvedTheme}`}
              </span>
            )}
            <span className="ml-2 text-xs text-muted-foreground">{shortcut}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
