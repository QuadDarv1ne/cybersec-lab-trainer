import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Sidebar from './Sidebar';

vi.mock('@/lib/store', () => {
  const mockFns = {
    setCurrentPage: vi.fn(),
    setSidebarOpen: vi.fn(),
    toggleSidebar: vi.fn(),
    completeModule: vi.fn(),
    setQuizScore: vi.fn(),
    resetProgress: vi.fn(),
    addStudiedOwasp: vi.fn(),
    addSqlLevel: vi.fn(),
    addXssLevel: vi.fn(),
    setOwaspChallengeScore: vi.fn(),
    setAuthChallengeScore: vi.fn(),
    setHeadersChallengeScore: vi.fn(),
    setUserId: vi.fn(),
    syncWithDatabase: vi.fn(),
    loadFromDatabase: vi.fn(),
    getNotesForItem: vi.fn(() => []),
  };

  const defaultState = {
    currentPage: 'dashboard',
    sidebarOpen: false,
    completedModules: [] as string[],
    quizScores: {} as Record<string, number>,
    studiedOwaspItems: [] as string[],
    sqlCompletedLevels: [] as string[],
    xssCompletedLevels: [] as string[],
    owaspChallengeScores: { correct: 0, total: 0, answered: [] as number[], selectedOptions: {} as Record<string, number> },
    authChallengeScores: { correct: 0, total: 0, answered: [] as number[], selectedOptions: {} as Record<string, number> },
    headersChallengeScores: { correct: 0, total: 0, answered: [] as number[], selectedOptions: {} as Record<string, number> },
    userId: null as string | null,
    syncStatus: 'idle' as const,
    lastSyncedAt: null as number | null,
    ...mockFns,
  };

  return {
    useAppStore: vi.fn((selector?: (s: typeof defaultState) => unknown) => {
      return selector ? selector(defaultState) : defaultState;
    }),
  };
});

vi.mock('@/lib/intlStub', () => ({
  LOCALES: {
    ru: { label: 'Russian', native: 'Русский', flag: '🇺' },
    en: { label: 'English', native: 'English', flag: '🇬🇧' },
    zh: { label: 'Chinese', native: '中文', flag: '🇨🇳' },
  },
  getCurrentLocale: () => 'ru',
  setLocale: () => {},
  useTranslations: () => (key: string, values?: Record<string, string | number>) => {
    const map: Record<string, string> = {
      'dashboard': 'Панель',
      'owasp': 'OWASP Top 10',
      'sqlInjection': 'SQL-инъекции',
      'xss': 'XSS-атаки',
      'csrf': 'CSRF-атаки',
      'auth': 'Аутентификация',
      'secureCoding': 'Безопасное кодирование',
      'tools': 'Инструменты',
      'securityHeaders': 'Заголовки безопасности',
      'quiz': 'Тестирование',
      'achievements': 'Достижения',
      'majorCode': '09.03.04 ПИ',
      'signIn': 'Войти',
      'signOut': 'Выйти',
      'overallProgress': 'Общий прогресс',
    };
    if (key === 'modulesCompleted') {
      return `${values?.completed ?? 0}/${values?.total ?? 0}`;
    }
    return map[key] ?? key;
  },
}));

vi.mock('@/hooks/use-session', () => ({
  useSession: () => ({
    session: null,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Trigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Content: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Item: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@radix-ui/react-tooltip', () => ({
  Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Root: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Trigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Content: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Arrow: () => null,
}));

vi.mock('@/components/ui/dropdown-menu', () => {
  const Comp = ({ children }: React.HTMLAttributes<HTMLElement>) => <>{children}</>;
  const Group = ({ children }: React.HTMLAttributes<HTMLElement>) => <>{children}</>;
  return {
    DropdownMenu: Comp,
    DropdownMenuTrigger: Comp,
    DropdownMenuContent: Comp,
    DropdownMenuItem: Comp,
    DropdownMenuLabel: Comp,
    DropdownMenuSeparator: () => null,
    DropdownMenuGroup: Group,
    DropdownMenuPortal: Comp,
    DropdownMenuCheckboxItem: Comp,
    DropdownMenuRadioGroup: Group,
    DropdownMenuRadioItem: Comp,
    DropdownMenuSubTrigger: Comp,
    DropdownMenuSubContent: Comp,
    DropdownMenuSub: Comp,
    DropdownMenuShortcut: Comp,
  };
});

vi.mock('framer-motion', () => {
  const El = ({ children, ...props }: React.HTMLAttributes<HTMLElement> & { initial?: unknown; animate?: unknown; exit?: unknown; transition?: unknown }) => <div {...props}>{children}</div>;
  return {
    motion: {
      div: El,
      aside: El,
      nav: El,
      ul: El,
      li: El,
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders brand name and major code', () => {
    render(<Sidebar />);
    expect(screen.getByText('CyberSec Lab')).toBeDefined();
    expect(screen.getByText('09.03.04 ПИ')).toBeDefined();
  });

  it('renders all navigation items', () => {
    render(<Sidebar />);
    expect(screen.getByText('Панель')).toBeDefined();
    expect(screen.getByText('OWASP Top 10')).toBeDefined();
    expect(screen.getByText('SQL-инъекции')).toBeDefined();
    expect(screen.getByText('XSS-атаки')).toBeDefined();
    expect(screen.getByText('CSRF-атаки')).toBeDefined();
    expect(screen.getByText('Аутентификация')).toBeDefined();
    expect(screen.getByText('Безопасное кодирование')).toBeDefined();
    expect(screen.getByText('Инструменты')).toBeDefined();
    expect(screen.getByText('Заголовки безопасности')).toBeDefined();
    expect(screen.getByText('Тестирование')).toBeDefined();
    expect(screen.getByText('Достижения')).toBeDefined();
  });

  it('shows sign in button when unauthenticated', () => {
    render(<Sidebar />);
    expect(screen.getByText('Войти')).toBeDefined();
  });

  it('shows overall progress section', () => {
    render(<Sidebar />);
    expect(screen.getByText('Общий прогресс')).toBeDefined();
  });

  it('has aria-label on navigation', () => {
    render(<Sidebar />);
    const nav = screen.getByLabelText('Main navigation');
    expect(nav).toBeDefined();
  });

  it('highlights current page with aria-current', () => {
    render(<Sidebar />);
    const dashboardBtn = screen.getByLabelText('Панель');
    expect(dashboardBtn.getAttribute('aria-current')).toBe('page');
  });

  it('shows progress section with aria-live', () => {
    render(<Sidebar />);
    const progressSection = screen.getByLabelText('Overall progress');
    expect(progressSection.getAttribute('aria-live')).toBe('polite');
  });
});
