import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      button: ({ children, ...props }: any) => (
        <button {...props}>{children}</button>
      ),
      h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
      h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
      p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
      span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
      ul: ({ children, ...props }: any) => <ul {...props}>{children}</ul>,
      li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
      section: ({ children, ...props }: any) => (
        <section {...props}>{children}</section>
      ),
      header: ({ children, ...props }: any) => (
        <header {...props}>{children}</header>
      ),
      main: ({ children, ...props }: any) => <main {...props}>{children}</main>,
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
});
