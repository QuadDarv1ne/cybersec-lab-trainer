"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useTranslations } from "@/lib/intlStub";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const t = useTranslations("auth");

  const getErrorMessage = () => {
    switch (error) {
      case "OAuthAccountNotLinked":
        return t("oauthAccountNotLinked");
      case "CallbackRouteError":
        return t("callbackError");
      default:
        return t("signinError");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4" role="alert" aria-live="assertive">
      <div className="w-full max-w-md space-y-6 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
        <h1 className="text-3xl font-bold">{t("authErrorTitle")}</h1>
        <p className="text-muted-foreground">{getErrorMessage()}</p>
        <Button asChild>
          <a href="/">{t("backToHome")}</a>
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
