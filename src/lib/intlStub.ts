import { useState, useEffect } from 'react';
import ru from '../i18n/locales/ru/main.json';
import en from '../i18n/locales/en/main.json';

const locales: Record<string, typeof ru> = {
  ru,
  en,
};

// Read current locale: check localStorage first, then browser language
export function getCurrentLocale(): string {
  // On server (SSR), always return 'ru' to ensure consistent hydration
  // Client will use this default until it reads localStorage/browser language
  if (typeof window === 'undefined') {
    return 'ru';
  }
  let stored: string | null = null;
  try {
    stored = localStorage.getItem('app-locale');
  } catch {
    // localStorage may be inaccessible in private browsing mode
    // Fall through to browser language detection
  }
  if (stored === 'en' || stored === 'ru') return stored;
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('en')) return 'en';
  if (browserLang.startsWith('ru')) return 'ru';
  return 'ru'; // default fallback
}

// Set locale and emit storage event for cross-component reactivity
export function setLocale(locale: string): void {
  if (typeof window === 'undefined') return;
  if (locale !== 'ru' && locale !== 'en') return;
  try {
    localStorage.setItem('app-locale', locale);
  } catch {
    // localStorage may be inaccessible in private browsing mode
  }
  // Notify other components via storage event
  window.dispatchEvent(new StorageEvent('storage', { key: 'app-locale', newValue: locale }));
  // Also update document lang attribute for accessibility
  document.documentElement.lang = locale;
}

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // return key as fallback
    }
  }

  return typeof current === 'string' ? current : path;
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

  const translations = locales[locale] || locales.ru;

  const translator = (key: string, values?: Record<string, string | number>) => {
    const fullKey = `${namespace}.${key}`;
    let text = getNestedValue(translations, fullKey);

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
