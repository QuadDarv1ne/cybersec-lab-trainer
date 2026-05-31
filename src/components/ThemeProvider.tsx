'use client';

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { useEffect } from 'react';

function ThemeWatcher() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    // Trigger View Transition API when theme changes
    if (document.startViewTransition) {
      document.startViewTransition();
    }
  }, [theme, resolvedTheme]);

  return null;
}

export default function ThemeProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.ComponentProps<typeof NextThemesProvider>) {
  useEffect(() => {
    // Add transition class after hydration for smooth theme changes
    document.documentElement.classList.add('theme-transition');
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      enableColorScheme
      nonce={process.env.NODE_ENV === 'production' ? process.env.NEXT_NONCE : undefined}
      {...props}
    >
      <ThemeWatcher />
      {children}
    </NextThemesProvider>
  );
}
