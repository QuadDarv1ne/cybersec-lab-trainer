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
  const createMockComponent = (tag: string) => {
    return ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => {
      const Element = tag;
      return <Element {...props}>{children}</Element>;
    };
  };
  return {
    ...actual,
    motion: {
      div: createMockComponent('div'),
      button: createMockComponent('button'),
      h1: createMockComponent('h1'),
      h2: createMockComponent('h2'),
      p: createMockComponent('p'),
      span: createMockComponent('span'),
      ul: createMockComponent('ul'),
      li: createMockComponent('li'),
      section: createMockComponent('section'),
      header: createMockComponent('header'),
      main: createMockComponent('main'),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
});
