"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = () => {
    switch (error) {
      case "OAuthAccountNotLinked":
        return "Аккаунт уже привязан к другому провайдеру.";
      case "CallbackRouteError":
        return "Ошибка при аутентификации. Попробуйте снова.";
      default:
        return "Произошла ошибка при входе.";
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
        <h1 className="text-3xl font-bold">Ошибка аутентификации</h1>
        <p className="text-muted-foreground">{getErrorMessage()}</p>
        <Button asChild>
          <a href="/">Вернуться на главную</a>
        </Button>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
