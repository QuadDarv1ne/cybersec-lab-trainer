import ru from '../i18n/locales/ru/main.json';
import en from '../i18n/locales/en/main.json';

const locales: Record<string, typeof ru> = {
  ru,
  en,
};

function getLocale(): string {
  if (typeof window !== 'undefined') {
    return 'ru'; // default locale for now
  }
  return 'ru';
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

export function useTranslations(namespace: string) {
  const locale = getLocale();
  const translations = locales[locale] || locales.ru;

  return (key: string, values?: Record<string, string | number>) => {
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
}
