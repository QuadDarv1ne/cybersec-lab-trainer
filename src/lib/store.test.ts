import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useAppStore } from './store';

vi.useFakeTimers();

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
      quizHistory: [],
      studiedOwaspItems: [],
      sqlCompletedLevels: [],
      xssCompletedLevels: [],
      owaspChallengeScores: { correct: 0, total: 0, answered: [], selectedOptions: {} },
      authChallengeScores: { correct: 0, total: 0, answered: [], selectedOptions: {} },
      headersChallengeScores: { correct: 0, total: 0, answered: [], selectedOptions: {} },
      secureCodingChallengeScores: { correct: 0, total: 0, answered: [], selectedOptions: {} },
      csrfViewedChallenges: [],
      totalXP: 0,
      notes: {},
      studySessions: [],
      userId: null,
      syncStatus: 'idle',
      lastSyncedAt: null,
    });
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
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
      quizHistory: [{ id: 'test', categoryId: 'sql', categoryName: 'SQL', score: 85, correct: 8, total: 10, answers: [], timestamp: Date.now() }],
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
    expect(state.quizHistory).toEqual([]);
  });

  it('addQuizAttempt stores attempt in history', () => {
    const attempt = {
      id: 'test-1',
      categoryId: 'sql',
      categoryName: 'SQL Injection',
      score: 90,
      correct: 9,
      total: 10,
      answers: [true, true, true, true, true, true, true, true, true, false],
      timestamp: Date.now(),
    };
    useAppStore.getState().addQuizAttempt(attempt);
    expect(useAppStore.getState().quizHistory.length).toBe(1);
    expect(useAppStore.getState().quizHistory[0].id).toBe('test-1');
  });

  it('clearQuizHistory removes all attempts', () => {
    useAppStore.getState().addQuizAttempt({
      id: 'test-2',
      categoryId: 'xss',
      categoryName: 'XSS',
      score: 70,
      correct: 7,
      total: 10,
      answers: [],
      timestamp: Date.now(),
    });
    expect(useAppStore.getState().quizHistory.length).toBeGreaterThan(0);
    useAppStore.getState().clearQuizHistory();
    expect(useAppStore.getState().quizHistory).toEqual([]);
  });

  it('addNote creates note with sanitized content', () => {
    useAppStore.getState().addNote('item1', 'owasp', 'OWASP Top 10', '<script>alert(1)</script>hello');
    const notes = useAppStore.getState().notes;
    const noteValues = Object.values(notes);
    expect(noteValues.length).toBe(1);
    expect(noteValues[0].content).toBe('alert(1)hello');
    expect(noteValues[0].itemId).toBe('item1');
    expect(noteValues[0].moduleId).toBe('owasp');
  });

  it('updateNote sanitizes and updates existing note', () => {
    useAppStore.getState().addNote('item2', 'sql-injection', 'SQL Injection', 'original');
    vi.advanceTimersByTime(1000);
    const noteId = Object.keys(useAppStore.getState().notes)[0];
    useAppStore.getState().updateNote(noteId, '<b>updated</b>');
    const updated = useAppStore.getState().notes[noteId];
    expect(updated.content).toBe('updated');
    expect(updated.updatedAt).toBeGreaterThan(updated.createdAt);
  });

  it('updateNote does nothing for non-existent note', () => {
    const stateBefore = useAppStore.getState();
    useAppStore.getState().updateNote('nonexistent', 'content');
    expect(useAppStore.getState().notes).toEqual(stateBefore.notes);
  });

  it('getNotesForItem returns notes filtered by itemId sorted by updatedAt', () => {
    useAppStore.getState().addNote('itemA', 'owasp', 'OWASP', 'first');
    vi.advanceTimersByTime(1000);
    useAppStore.getState().addNote('itemA', 'owasp', 'OWASP', 'second');
    vi.advanceTimersByTime(1000);
    useAppStore.getState().addNote('itemB', 'owasp', 'OWASP', 'other');

    const notesForA = useAppStore.getState().getNotesForItem('itemA');
    expect(notesForA.length).toBe(2);
    expect(notesForA[0].content).toBe('second');
    expect(notesForA[1].content).toBe('first');
  });

  it('startStudySession and endStudySession create study session with XP', () => {
    useAppStore.getState().startStudySession('owasp');
    vi.advanceTimersByTime(5 * 60_000); // 5 minutes = minimum for 1 XP
    useAppStore.getState().endStudySession();
    const sessions = useAppStore.getState().studySessions;
    expect(sessions.length).toBe(1);
    expect(sessions[0].pageType).toBe('owasp');
    expect(sessions[0].durationMs).toBe(5 * 60_000);
    expect(sessions[0].xpEarned).toBe(1);
  });

  it('endStudySession does nothing without active session', () => {
    const beforeCount = useAppStore.getState().studySessions.length;
    useAppStore.getState().endStudySession();
    expect(useAppStore.getState().studySessions.length).toBe(beforeCount);
  });

  it('awardXP only accepts positive amounts', () => {
    useAppStore.getState().awardXP(50);
    expect(useAppStore.getState().totalXP).toBe(50);

    useAppStore.getState().awardXP(-10);
    expect(useAppStore.getState().totalXP).toBe(50); // unchanged
  });

  it('setOwaspChallengeScore updates challenge scores', () => {
    useAppStore.getState().setOwaspChallengeScore(5, [1, 2, 3, 4, 5], { '1': 0, '2': 1 });
    const scores = useAppStore.getState().owaspChallengeScores;
    expect(scores.correct).toBe(5);
    expect(scores.total).toBe(5);
    expect(scores.answered).toEqual([1, 2, 3, 4, 5]);
  });

  it('markCsrfChallengeViewed adds unique indices', () => {
    useAppStore.getState().markCsrfChallengeViewed(0);
    useAppStore.getState().markCsrfChallengeViewed(1);
    useAppStore.getState().markCsrfChallengeViewed(0); // duplicate
    expect(useAppStore.getState().csrfViewedChallenges).toEqual([0, 1]);
  });

  it('addStudiedOwasp adds unique items', () => {
    useAppStore.getState().addStudiedOwasp('a1');
    useAppStore.getState().addStudiedOwasp('a2');
    useAppStore.getState().addStudiedOwasp('a1'); // duplicate
    expect(useAppStore.getState().studiedOwaspItems).toEqual(['a1', 'a2']);
  });

  it('addSqlLevel and addXssLevel add unique levels', () => {
    useAppStore.getState().addSqlLevel('basic');
    useAppStore.getState().addSqlLevel('basic');
    useAppStore.getState().addXssLevel('reflected');
    expect(useAppStore.getState().sqlCompletedLevels).toEqual(['basic']);
    expect(useAppStore.getState().xssCompletedLevels).toEqual(['reflected']);
  });
});
