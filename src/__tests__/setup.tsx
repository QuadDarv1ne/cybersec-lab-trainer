import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Ensure DOMParser is available (happy-dom provides this, but just in case)
if (typeof globalThis.DOMParser === 'undefined') {
  // @ts-ignore - happy-dom provides DOMParser
  globalThis.DOMParser = class DOMParser {
    parseFromString(str: string) {
      // Simple HTML parser for tests - strip tags and decode entities
      const text = str
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&#[0-9]+;/g, (match) => String.fromCharCode(parseInt(match.replace(/&#|;/g, ''), 10)));
      
      return {
        body: { textContent: text }
      };
    }
  };
}

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

// Create mock motion components
const createMockComponent = (tag: string) => {
  const MockComponent = ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => {
    return React.createElement(tag, props, children);
  };
  MockComponent.displayName = `motion.${tag}`;
  return MockComponent;
};

// Mock framer-motion with hoisted values
vi.mock('framer-motion', () => ({
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
  useMotionValue: (initial: number) => ({ 
    get: () => initial, 
    set: vi.fn(), 
    on: vi.fn(),
    subscribe: vi.fn(),
  }),
  useTransform: (value: { get: () => number } | number, transform: (v: number) => number | string) => ({
    get: () => transform(typeof value === 'object' && 'get' in value ? value.get() : value),
    on: vi.fn(),
    subscribe: vi.fn(),
  }),
  animate: (_value: { get: () => number }, _to: number, _options?: { duration?: number; ease?: unknown }) => ({
    stop: vi.fn(),
  }),
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
  useInView: () => [null, false],
  useScroll: () => ({ scrollX: { get: () => 0 }, scrollY: { get: () => 0 } }),
}));
