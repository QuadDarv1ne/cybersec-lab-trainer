"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { logger } from "@/lib/logger";
import type { Session } from "next-auth";

interface SessionProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  const setUserId = useAppStore((s) => s.setUserId);
  const loadFromDatabase = useAppStore((s) => s.loadFromDatabase);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Abort any in-flight request from previous session change
    controllerRef.current?.abort();

    if (session?.user?.id) {
      const controller = new AbortController();
      controllerRef.current = controller;
      setUserId(session.user.id);
      loadFromDatabase(session.user.id, controller.signal).catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        logger.error('SessionProvider: loadFromDatabase failed:', err);
      });
    } else {
      controllerRef.current = null;
      setUserId(null);
    }

    // Cleanup: abort on unmount or session change
    return () => {
      controllerRef.current?.abort();
    };
  }, [session, setUserId, loadFromDatabase]);

  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
