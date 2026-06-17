'use client';

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { useEffect } from 'react';

function ThemeWatcher() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    // Trigger View Transition API when theme changes.
    // The View Transition API requires a callback function — without it,
    // Chrome throws TypeError: parameter 1 is not a function.
    // We pass a no-op since next-themes handles the actual DOM update.
    if (document.startViewTransition) {
      document.startViewTransition(() => {});
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
      {...props}
    >
      <ThemeWatcher />
      {children}
    </NextThemesProvider>
  );
}
