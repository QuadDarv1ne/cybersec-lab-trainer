import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';

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
    setSecureCodingChallengeScore: vi.fn(),
    setUserId: vi.fn(),
    syncWithDatabase: vi.fn(),
    loadFromDatabase: vi.fn(),
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
    secureCodingChallengeScores: { correct: 0, total: 0, answered: [] as number[], selectedOptions: {} as Record<string, number> },
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
  useTranslations: () => (key: string, values?: Record<string, string | number>) => {
    const map: Record<string, string> = {
      'hero.title': 'Тренажёр по информационной безопасности',
      'hero.description': 'Изучайте уязвимости веб-приложений',
      'hero.modules': `Модулей: ${values?.count ?? 0}`,
      'hero.progress': `Прогресс: ${values?.percent ?? 0}%`,
      'hero.quizScore': `Тесты: ${values?.score ?? 0}%`,
      'hero.takeQuiz': 'Пройдите тест',
      'hero.achievements': `Достижений: ${values?.count ?? 0}`,
      'stats.modulesCompleted': 'Модулей пройдено',
      'stats.quizzesCompleted': 'Тестов пройдено',
      'stats.averageScore': 'Средний балл',
      'stats.achievements': 'Достижения',
      'recommendations.owaspStart': 'Начните с OWASP Top 10',
      'recommendations.sqlTry': 'Попробуйте SQL-инъекции',
      'recommendations.xssLearn': 'Изучите XSS-атаки',
      'recommendations.quizCheck': 'Изучите CSRF-атаки',
      'recommendations.toolsTry': 'Попробуйте инструменты',
      'recommendations.completeRemaining': 'Завершите оставшиеся модули',
      'recommendations.wellDone': 'Отлично! Посмотрите достижения',
      'recommendationBanner.title': 'Следующий шаг',
      'modulesTitle': 'Модули обучения',
      'modulesLessons': `${values?.count ?? 0} уроков`,
      'achievementsCard.unlocked': `${values?.unlocked ?? 0}/${values?.total ?? 0}`,
      'achievementsCard.terms': `${values?.count ?? 0} терминов`,
      'nextAchievement': 'Следующее достижение',
      'overallProgress.title': 'Общий прогресс',
      'overallProgress.notStarted': 'Начните обучение',
      'overallProgress.inProgress': `Осталось: ${values?.remaining ?? 0} модулей`,
      'quizCard.title': 'Тестирование',
      'quizCard.description': 'Проверьте свои знания',
      'achievementsCard.title': 'Достижения',
      'achievementsCard.description': 'Ваши достижения',
      'completed': 'Пройдено',
    };
    return map[key] ?? key;
  },
}));

vi.mock('@/lib/achievement-utils', () => ({
  getAchievementStatus: vi.fn(() => false),
}));

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  const Div = ({ children, ...props }: React.HTMLAttributes<HTMLElement> & { initial?: unknown; animate?: unknown; transition?: unknown; exit?: unknown; key?: string }) => <div {...props}>{children}</div>;
  return {
    ...actual,
    motion: {
      div: Div,
      span: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    },
    useMotionValue: (initial: number) => ({ get: () => initial }),
    useTransform: () => '0',
    animate: vi.fn(() => ({ stop: vi.fn() })),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modules title', () => {
    render(<Dashboard />);
    expect(screen.getByText('Модули обучения')).toBeDefined();
  });

  it('shows modules list with titles', () => {
    render(<Dashboard />);
    expect(screen.getByText('OWASP Top 10')).toBeDefined();
    expect(screen.getByText('SQL-инъекции')).toBeDefined();
    expect(screen.getByText('XSS-атаки')).toBeDefined();
    expect(screen.getByText('CSRF-атаки')).toBeDefined();
  });

  it('shows overall progress section', () => {
    render(<Dashboard />);
    expect(screen.getByText('Общий прогресс')).toBeDefined();
  });

  it('has aria-live regions for stats', () => {
    render(<Dashboard />);
    const statsSection = screen.getByLabelText('Learning statistics');
    expect(statsSection.getAttribute('aria-live')).toBe('polite');
  });

  it('has aria-live region for overall progress', () => {
    render(<Dashboard />);
    const progressSection = screen.getByLabelText('Overall progress');
    expect(progressSection.getAttribute('aria-live')).toBe('polite');
  });
});
