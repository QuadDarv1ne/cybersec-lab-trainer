import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export type Locale = 'en' | 'ru';

export const locales: Locale[] = ['en', 'ru'];
export const defaultLocale: Locale = 'ru';

export default getRequestConfig(async ({ locale }) => {
  const currentLocale = locale as Locale;
  
  if (!locales.includes(currentLocale)) {
    notFound();
  }

  return {
    locale: currentLocale,
    messages: (await import(`./src/locales/${currentLocale}.json`)).default,
  };
});
