import ru from '../i18n/locales/ru/main.json';
import en from '../i18n/locales/en/main.json';

const locales: Record<string, typeof ru> = {
  ru,
  en,
};

let cachedLocale: string | null = null;

function getLocale(): string {
  if (cachedLocale) return cachedLocale;

  if (typeof window !== 'undefined') {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('en')) cachedLocale = 'en';
    else if (browserLang.startsWith('ru')) cachedLocale = 'ru';
  }
  cachedLocale ??= 'ru'; // default fallback
  return cachedLocale;
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

const translationCache = new Map<string, (key: string, values?: Record<string, string | number>) => string>();

export function useTranslations(namespace: string) {
  const locale = getLocale();
  const translations = locales[locale] || locales.ru;

  // Return cached translator if available
  const cacheKey = `${locale}:${namespace}`;
  const cached = translationCache.get(cacheKey);
  if (cached) return cached;

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

  translationCache.set(cacheKey, translator);
  return translator;
}
