'use client';

import { useEffect, useState } from 'react';
import { getCurrentLocale } from '@/lib/intlStub';

/**
 * Sets the document's html lang attribute based on the current locale.
 * Reacts to locale changes via the localechange custom event.
 */
export function LocaleLang() {
  const [mounted, setMounted] = useState(false);
  const [locale, setLocale] = useState('ru');

  useEffect(() => {
    setLocale(getCurrentLocale());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale;

    const handleStorage = () => {
      const current = getCurrentLocale();
      setLocale(current);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('localechange', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('localechange', handleStorage);
    };
  }, [locale, mounted]);

  return null;
}
