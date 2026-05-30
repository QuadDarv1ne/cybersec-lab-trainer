"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { logger } from "@/lib/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4" role="alert" aria-live="assertive">
      <Card className="w-full max-w-md border-slate-200">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <h2 className="text-lg font-bold">Ошибка приложения</h2>
          </div>

          <p className="text-sm text-slate-600">
            Произошла непредвиденная ошибка. Попробуйте обновить страницу или вернитесь на главную.
          </p>

          {process.env.NODE_ENV === "development" && (
            <details className="bg-slate-50 rounded-lg p-3 text-xs font-mono text-slate-700 space-y-1">
              <summary className="cursor-pointer font-sans font-semibold text-slate-600">
                Показать детали ошибки
              </summary>
              <p className="text-red-600 font-bold">{error.message}</p>
              <pre className="whitespace-pre-wrap text-[10px] text-slate-500">
                {error.stack}
              </pre>
              {error.digest && (
                <p className="text-slate-400">Digest: {error.digest}</p>
              )}
            </details>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => {
                logger.error('User attempted retry for error:', error);
                reset();
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <RefreshCw size={16} className="mr-2" />
              Попробовать снова
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
            >
              <Home size={16} className="mr-2" />
              На главную
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
