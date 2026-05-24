import ru from '../i18n/locales/ru/main.json';
import en from '../i18n/locales/en/main.json';

const locales: Record<string, typeof ru> = {
  ru,
  en,
};

// Read current locale: check localStorage first, then browser language
function getCurrentLocale(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('app-locale');
    if (stored === 'en' || stored === 'ru') return stored;
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('en')) return 'en';
    if (browserLang.startsWith('ru')) return 'ru';
  }
  return 'ru'; // default fallback
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

type Translator = (key: string, values?: Record<string, string | number>) => string;

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

export function useTranslations(namespace: string): Translator {
  const locale = getCurrentLocale();
  return getTranslator(locale, namespace);
}
