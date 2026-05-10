import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
