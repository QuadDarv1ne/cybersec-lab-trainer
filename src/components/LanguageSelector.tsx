"use client";

import { Globe } from "lucide-react";
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
import { useTranslations, LOCALES, getCurrentLocale, setLocale, type Locale } from "@/lib/intlStub";

export function LanguageSelector() {
  const t = useTranslations('common');
  const [locale, setLocaleState] = useState<Locale>(() => getCurrentLocale());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleStorage = () => setLocaleState(getCurrentLocale());
    window.addEventListener("storage", handleStorage);
    window.addEventListener("localechange", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("localechange", handleStorage);
    };
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" aria-label={t('languageLabel')}>
        <Globe className="h-4 w-4" />
      </Button>
    );
  }

  const current = LOCALES[locale];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          aria-label={`${t('languageLabel')}: ${current.native}`}
        >
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {t('languageLabel')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.entries(LOCALES) as [Locale, (typeof LOCALES)[Locale]][]).map(
          ([key, { native, flag }]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => setLocale(key)}
              className="cursor-pointer"
            >
              <span className="mr-2 text-sm">{flag}</span>
              <span className="flex-1">{native}</span>
              {locale === key && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓
                </span>
              )}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
