import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from './store';

describe('App Store', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    // Reset store to initial state synchronously
    useAppStore.setState({
      currentPage: 'dashboard',
      sidebarOpen: false,
      completedModules: [],
      quizScores: {},
      studiedOwaspItems: [],
      sqlCompletedLevels: [],
      xssCompletedLevels: [],
      owaspChallengeScores: { correct: 0, total: 0, answered: [], selectedOptions: {} },
      authChallengeScores: { correct: 0, total: 0, answered: [] },
      headersChallengeScores: { correct: 0, total: 0, answered: [] },
      secureCodingChallengeScores: { correct: 0, total: 0, answered: [], selectedOptions: {} },
      userId: null,
      syncStatus: 'idle',
      lastSyncedAt: null,
    });
  });

  it('setCurrentPage changes page and closes sidebar', () => {
    useAppStore.getState().setSidebarOpen(true);
    expect(useAppStore.getState().sidebarOpen).toBe(true);

    useAppStore.getState().setCurrentPage('quiz');
    const state = useAppStore.getState();
    expect(state.currentPage).toBe('quiz');
    expect(state.sidebarOpen).toBe(false);
  });

  it('toggleSidebar toggles sidebar state', () => {
    const store = useAppStore.getState();
    store.setSidebarOpen(false);
    store.toggleSidebar();
    expect(useAppStore.getState().sidebarOpen).toBe(true);
    store.toggleSidebar();
    expect(useAppStore.getState().sidebarOpen).toBe(false);
  });

  it('completeModule adds module without duplicates', async () => {
    await useAppStore.getState().completeModule('owasp');
    expect(useAppStore.getState().completedModules).toContain('owasp');

    await useAppStore.getState().completeModule('owasp');
    const count = useAppStore.getState().completedModules.filter((m) => m === 'owasp').length;
    expect(count).toBe(1);
  });

  it('setQuizScore stores score for category', async () => {
    await useAppStore.getState().setQuizScore('sql', 85);
    expect(useAppStore.getState().quizScores['sql']).toBe(85);
  });

  it('setQuizScore overwrites previous score', async () => {
    await useAppStore.getState().setQuizScore('sql', 85);
    await useAppStore.getState().setQuizScore('sql', 92);
    expect(useAppStore.getState().quizScores['sql']).toBe(92);
  });

  it('resetProgress clears all progress', async () => {
    useAppStore.setState({
      completedModules: ['owasp'],
      quizScores: { sql: 85 },
      studiedOwaspItems: ['item1'],
      sqlCompletedLevels: ['level1'],
      xssCompletedLevels: ['level1'],
    });
    await useAppStore.getState().resetProgress();
    const state = useAppStore.getState();
    expect(state.completedModules).toEqual([]);
    expect(state.quizScores).toEqual({});
    expect(state.studiedOwaspItems).toEqual([]);
    expect(state.sqlCompletedLevels).toEqual([]);
    expect(state.xssCompletedLevels).toEqual([]);
  });
});
