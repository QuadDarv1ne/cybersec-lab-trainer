"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import type { Session } from "next-auth";

interface SessionProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  const { setUserId, loadFromDatabase } = useAppStore();

  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
      loadFromDatabase(session.user.id);
    } else {
      setUserId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, setUserId]);

  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
