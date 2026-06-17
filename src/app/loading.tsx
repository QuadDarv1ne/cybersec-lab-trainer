'use client';

import { useTranslations } from "@/lib/intlStub";

export default function Loading() {
  const t = useTranslations('common');

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    </div>
  );
}
