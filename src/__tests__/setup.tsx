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
vi.mock('framer-motion', () => {
  const createMockComponent = (tag: string) => {
    return ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => {
      const Element = tag;
      return <Element {...props}>{children}</Element>;
    };
  };
  return {
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
      aside: createMockComponent('aside'),
      nav: createMockComponent('nav'),
      a: createMockComponent('a'),
      img: createMockComponent('img'),
      svg: createMockComponent('svg'),
      path: createMockComponent('path'),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useMotionValue: (initial: number) => ({ get: () => initial, set: vi.fn() }),
    useTransform: (value: unknown, transform: (v: number) => unknown) => ({ get: () => transform(typeof initial === 'number' ? initial : 0) }),
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
    useInView: () => [null, false],
    useScroll: () => ({ scrollX: { get: () => 0 }, scrollY: { get: () => 0 } }),
  };
});
