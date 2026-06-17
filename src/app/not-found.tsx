'use client';

import { Home, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/intlStub";

export default function NotFound() {
  const t = useTranslations('common');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-8xl font-bold text-emerald-600">404</h1>
          <h2 className="text-2xl font-semibold">{t('notFoundTitle')}</h2>
        </div>

        <p className="text-muted-foreground">
          {t('notFoundDesc')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Home size={16} className="mr-2" />
              {t('goHome')}
            </Button>
          </Link>
          <Link href="/app">
            <Button variant="outline">
              <BookOpen size={16} className="mr-2" />
              {t('goToTrainer')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
