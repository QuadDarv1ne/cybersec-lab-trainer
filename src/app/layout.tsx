import type { Metadata } from "next";
import { SessionProvider } from "@/components/SessionProvider";
import ThemeProvider from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LocaleLang } from "@/components/LocaleLang";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import "./globals.css";

const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "CyberSec Lab — Тренажёр по информационной безопасности",
    template: "%s | CyberSec Lab",
  },
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
    apple: "/logo.svg",
  },
  openGraph: {
    title: "CyberSec Lab — Тренажёр по информационной безопасности",
    description:
      "Интерактивная платформа для изучения уязвимостей веб-приложений: OWASP Top 10, SQL-инъекции, XSS, CSRF и безопасное кодирование.",
    url: siteUrl,
    siteName: "CyberSec Lab",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: `${siteUrl}/security-logo.png`,
        width: 1200,
        height: 630,
        alt: "CyberSec Lab",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CyberSec Lab — Тренажёр по информационной безопасности",
    description:
      "Интерактивная платформа для изучения уязвимостей веб-приложений: OWASP Top 10, SQL-инъекции, XSS, CSRF и безопасное кодирование.",
    images: [`${siteUrl}/security-logo.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    // Session is invalid (e.g., JWT was encrypted with a different secret)
    // This can happen when NEXTAUTH_SECRET changes or cookies are stale
    session = null;
  }

  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <LocaleLang />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          Перейти к основному содержанию
        </a>
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
