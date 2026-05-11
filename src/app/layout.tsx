import type { Metadata } from "next";
import { SessionProvider } from "@/components/SessionProvider";
import ThemeProvider from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateEnv } from "@/lib/env";
import "./globals.css";

// Validate environment variables at startup
validateEnv();

export const metadata: Metadata = {
  title: "CyberSec Lab — Тренажёр по информационной безопасности",
  description:
    "Интерактивная платформа для изучения уязвимостей веб-приложений: OWASP Top 10, SQL-инъекции, XSS, CSRF и безопасное кодирование. Направление 09.03.04 Программная инженерия.",
  keywords: [
    "информационная безопасность",
    "OWASP",
    "SQL-инъекция",
    "XSS",
    "CSRF",
    "тренажёр",
    "программная инженерия",
  ],
  icons: {
    icon: "/logo.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <SessionProvider session={session}>
          <div suppressHydrationWarning>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </ThemeProvider>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
