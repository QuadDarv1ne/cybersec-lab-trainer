import { useState, useEffect } from 'react';
import { logger } from './logger';
import ru from '../i18n/locales/ru/main.json';
import en from '../i18n/locales/en/main.json';
import zh from '../i18n/locales/zh/main.json';

export type Locale = 'ru' | 'en' | 'zh';

export const LOCALES: Record<Locale, { label: string; native: string; flag: string }> = {
  ru: { label: 'Russian', native: 'Русский', flag: '🇷🇺' },
  en: { label: 'English', native: 'English', flag: '🇬🇧' },
  zh: { label: 'Chinese', native: '中文', flag: '🇨🇳' },
};

const locales: Record<Locale, typeof ru> = {
  ru,
  en,
  zh,
};

// Read current locale: check localStorage first, then browser language
export function getCurrentLocale(): Locale {
  if (typeof window === 'undefined') return 'ru';
  let stored: string | null = null;
  try {
    stored = localStorage.getItem('app-locale');
  } catch (e) {
    logger.warn('localStorage access failed in getCurrentLocale:', e);
  }
  if (stored === 'en' || stored === 'ru' || stored === 'zh') return stored as Locale;
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('en')) return 'en';
  if (browserLang.startsWith('ru')) return 'ru';
  return 'ru';
}

// Map locale codes to BCP 47 language tags for date formatting
const LOCALE_TO_BCP47: Record<Locale, string> = {
  ru: 'ru-RU',
  en: 'en-US',
  zh: 'zh-CN',
};

/**
 * Format a date using the current app locale.
 * Returns locale-aware date/time string.
 */
export function formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
  const locale = getCurrentLocale();
  const bcp47 = LOCALE_TO_BCP47[locale];
  return new Date(date).toLocaleString(bcp47, options);
}

// Set locale and emit storage event for cross-component reactivity
export function setLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  if (locale !== 'ru' && locale !== 'en' && locale !== 'zh') return;
  try {
    localStorage.setItem('app-locale', locale);
  } catch (e) {
    logger.warn('localStorage access failed in setLocale:', e);
  }
  window.dispatchEvent(new StorageEvent('storage', { key: 'app-locale', newValue: locale }));
  document.documentElement.lang = locale;
}

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return ''; // not found — caller will fall back to default locale
    }
  }

  return typeof current === 'string' ? current : '';
}

export type Translator = (key: string, values?: Record<string, string | number>) => string;

// Per-namespace translator cache keyed by locale:namespace.
// Each cache entry stores the locale it was created for so we can detect staleness.
const translatorCache = new Map<string, { locale: string; translator: Translator }>();

function getTranslator(locale: string, namespace: string): Translator {
  const cacheKey = `${locale}:${namespace}`;
  const cached = translatorCache.get(cacheKey);
  if (cached && cached.locale === locale) return cached.translator;

  // Clear any entries from a different locale to prevent stale data
  for (const [key, entry] of translatorCache) {
    if (entry.locale !== locale) {
      translatorCache.delete(key);
    }
  }

  const translations = locales[locale as Locale] || locales.ru;

  const translator = (key: string, values?: Record<string, string | number>) => {
    const fullKey = `${namespace}.${key}`;
    let text = getNestedValue(translations, fullKey);

    // Fall back to default locale (ru) if key is missing in current locale
    if (!text && locale !== 'ru') {
      text = getNestedValue(locales.ru, fullKey);
    }

    // Last resort: return the raw key path so the developer can spot missing translations
    if (!text) text = fullKey;

    // Interpolate values like {count}, {percent}, etc.
    if (values) {
      for (const [k, v] of Object.entries(values)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }

    return text;
  };

  translatorCache.set(cacheKey, { locale, translator });
  return translator;
}

/**
 * React to locale changes by subscribing to storage events and current locale state.
 * Always starts with 'ru' to match SSR, then syncs to actual locale after mount.
 */
function useLocale(): string {
  // Start with 'ru' to match SSR - this prevents hydration mismatch
  const [locale, setLocaleState] = useState('ru');

  useEffect(() => {
    // After mount, read the actual locale from localStorage/browser
    const actual = getCurrentLocale();
    setLocaleState(actual);

    const handleStorage = (_e: StorageEvent | Event) => {
      const current = getCurrentLocale();
      setLocaleState(current);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('localechange', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('localechange', handleStorage);
    };
  }, []);

  return locale;
}

export function useTranslations(namespace: string): Translator {
  const locale = useLocale();
  return getTranslator(locale, namespace);
}
