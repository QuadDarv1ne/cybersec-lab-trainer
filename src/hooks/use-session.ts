"use client";

import { useSession as useNextAuthSession } from "next-auth/react";
import type { Session } from "next-auth";

export function useSession() {
  const { data: session, status, ...rest } = useNextAuthSession();

  return {
    session,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    user: session?.user,
    ...rest,
  };
}

// Тип для сессии
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
