'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { quizCategories } from './data/quiz-data';
import { logger } from './logger';
import { XP_REWARDS, calculateLevel, calculateXPBreakdown, levelProgress, type XPBreakdown } from './xp-system';
import { type NotesMap, type Note, generateNoteId } from './notes-system';

export type PageType =
  | 'dashboard'
  | 'owasp'
  | 'sql-injection'
  | 'xss'
  | 'csrf'
  | 'auth'
  | 'secure-coding'
  | 'tools'
  | 'security-headers'
  | 'quiz'
  | 'achievements'
  | 'notes';

export interface QuizAttempt {
  id: string;
  categoryId: string;
  categoryName: string;
  score: number;
  correct: number;
  total: number;
  answers: (boolean | null)[];
  timestamp: number;
}

interface AppState {
  currentPage: PageType;
  sidebarOpen: boolean;
  completedModules: string[];
  quizScores: Record<string, number>;
  quizHistory: QuizAttempt[];
  studiedOwaspItems: string[];
  sqlCompletedLevels: string[];
  xssCompletedLevels: string[];
  owaspChallengeScores: { correct: number; total: number; answered: number[]; selectedOptions: Record<string, number> };
  authChallengeScores: { correct: number; total: number; answered: number[]; selectedOptions: Record<string, number> };
  headersChallengeScores: { correct: number; total: number; answered: number[]; selectedOptions: Record<string, number> };
  secureCodingChallengeScores: { correct: number; total: number; answered: number[]; selectedOptions: Record<string, number> };
  csrfViewedChallenges: number[];
  totalXP: number;
  notes: NotesMap;
  userId: string | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncedAt: number | null;
}

interface AppActions {
  setCurrentPage: (page: PageType) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  completeModule: (moduleId: string) => Promise<void>;
  setQuizScore: (category: string, score: number, attempt?: QuizAttempt) => Promise<void>;
  addQuizAttempt: (attempt: QuizAttempt) => void;
  clearQuizHistory: () => void;
  resetProgress: () => Promise<void>;
  addStudiedOwasp: (id: string) => void;
  addSqlLevel: (level: string) => void;
  addXssLevel: (level: string) => void;
  setOwaspChallengeScore: (correct: number, answered: number[], selectedOptions: Record<string, number>) => void;
  setAuthChallengeScore: (correct: number, answered: number[], selectedOptions: Record<string, number>) => void;
  setHeadersChallengeScore: (correct: number, answered: number[], selectedOptions: Record<string, number>) => void;
  setSecureCodingChallengeScore: (correct: number, answered: number[], selectedOptions: Record<string, number>) => void;
  markCsrfChallengeViewed: (index: number) => void;
  setUserId: (userId: string | null) => void;
  importProgressData: (data: {
    completedModules: string[];
    quizScores: Record<string, number>;
    studiedOwaspItems: string[];
    sqlCompletedLevels: string[];
    xssCompletedLevels: string[];
    owaspChallengeScores: AppStore['owaspChallengeScores'];
    authChallengeScores: AppStore['authChallengeScores'];
    headersChallengeScores: AppStore['headersChallengeScores'];
    secureCodingChallengeScores: AppStore['secureCodingChallengeScores'];
    csrfViewedChallenges: number[];
    quizHistory: AppStore['quizHistory'];
    totalXP?: number;
  }) => void;
  awardXP: (amount: number) => void;
  getXPLevel: () => { level: number; progress: number; xpToNext: number; totalXP: number };
  getXPBreakdown: () => XPBreakdown;
  addNote: (itemId: string, moduleId: string, moduleName: string, content: string) => void;
  updateNote: (noteId: string, content: string) => void;
  deleteNote: (noteId: string) => void;
  getNotesForItem: (itemId: string) => Note[];
  syncWithDatabase: () => Promise<void>;
  loadFromDatabase: (userId: string, signal?: AbortSignal) => Promise<void>;
}

type AppStore = AppState & AppActions;

// Debounced sync coalescer — batches rapid state changes into a single API call.
// Uses a timer to wait SYNC_DELAY_MS after the last trigger before flushing.
// Tracks whether a sync is currently executing so that state changes during
// an in-flight sync are not silently lost — a follow-up sync is scheduled.
let syncTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingPromise: Promise<void> | null = null;
let pendingResolve: (() => void) | null = null;
let isExecuting = false; // true while syncWithDatabase is actually running
let followUpScheduled = false;
const SYNC_DELAY_MS = 500;

// Abort controller for in-flight loadFromDatabase requests
let loadAbortController: AbortController | null = null;

const ensureSync = async (get: () => AppStore, set: (partial: Partial<AppStore>) => void) => {
  // If a sync is actively executing, schedule a follow-up so latest state isn't lost.
  if (isExecuting) {
    followUpScheduled = true;
    // Return existing pending promise so callers can await it.
    if (pendingPromise) return pendingPromise;
  }

  // If there's already a pending promise (waiting in debounce), just return it.
  if (pendingPromise) return pendingPromise;

  // Create a new deferred promise
  pendingPromise = new Promise<void>((resolve) => {
    pendingResolve = resolve;
  });

  // Clear any existing timer and start a new one
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    syncTimeout = null;
    const resolve = pendingResolve;
    pendingResolve = null;
    // Keep pendingPromise alive until the full sync cycle completes so
    // concurrent callers still receive the same promise.

    isExecuting = true;
    set({ syncStatus: 'syncing' });

    try {
      // Loop: sync, and if changes happened during sync, re-sync with latest state.
      let shouldFollowUp = true;
      while (shouldFollowUp) {
        followUpScheduled = false;
        const currentState = get();
        await syncWithDatabase(currentState, set);
        shouldFollowUp = followUpScheduled;
      }
    } finally {
      isExecuting = false;
      pendingPromise = null;
    }

    resolve?.();
  }, SYNC_DELAY_MS);

  return pendingPromise;
};

// Helper: add item to array only if not already present (avoids 5 duplicate patterns)
const addUnique = <T>(array: T[], item: T): T[] =>
  array.includes(item) ? array : [...array, item];

// API client functions
const apiClient = {
  async loadProgress(signal?: AbortSignal) {
    const response = await fetch('/api?action=load-progress', {
      method: 'GET',
      signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to load progress');
    }

    return response.json();
  },

  async saveBatch(modules: { moduleId: string; completed: boolean; score?: number }[], quizzes: { quizId: string; score: number; total: number }[]) {
    const response = await fetch('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'batch-sync',
        payload: { modules, quizzes },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to batch sync');
    }

    return response.json();
  },

  async saveChallengeProgress(challenges: { challengeType: string; correct: number; total: number; answered?: number[]; selectedOptions?: Record<string, number> }[]) {
    const response = await fetch('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'challenge-progress-sync',
        payload: { challenges },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to sync challenge progress');
    }

    return response.json();
  },

  async resetProgress() {
    const response = await fetch('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'reset-progress',
        payload: {},
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to reset progress');
    }

    return response.json();
  },
};

// Sync with database via API (batch call)
const syncWithDatabase = async (state: AppState, set: (partial: Partial<AppStore>) => void) => {
  if (!state.userId) {
    set({ syncStatus: 'idle' });
    return;
  }

  set({ syncStatus: 'syncing' });
  try {
    // Calculate actual scores for challenge-based modules
    const getModuleScore = (moduleId: string): number => {
      if (moduleId === 'owasp' && state.owaspChallengeScores.total > 0) {
        return Math.round((state.owaspChallengeScores.correct / state.owaspChallengeScores.total) * 100);
      }
      if (moduleId === 'auth' && state.authChallengeScores.total > 0) {
        return Math.round((state.authChallengeScores.correct / state.authChallengeScores.total) * 100);
      }
      if (moduleId === 'security-headers' && state.headersChallengeScores.total > 0) {
        return Math.round((state.headersChallengeScores.correct / state.headersChallengeScores.total) * 100);
      }
      if (moduleId === 'secure-coding' && state.secureCodingChallengeScores.total > 0) {
        return Math.round((state.secureCodingChallengeScores.correct / state.secureCodingChallengeScores.total) * 100);
      }
      // For non-challenge modules or when no challenges completed, use 100
      return 100;
    };

    const modules = state.completedModules.map((moduleId) => ({
      moduleId, completed: true, score: getModuleScore(moduleId),
    }));

    const quizzes = Object.entries(state.quizScores).map(([category, score]) => ({
      quizId: category,
      score,
      total: quizCategories.find((c) => c.id === category)?.count ?? 100,
    }));

    const challenges = [
      { challengeType: 'owasp', ...state.owaspChallengeScores },
      { challengeType: 'auth', ...state.authChallengeScores },
      { challengeType: 'headers', ...state.headersChallengeScores },
      { challengeType: 'secure-coding', ...state.secureCodingChallengeScores },
    ].filter((c) => c.total > 0);

    const savePromises: Promise<unknown>[] = [];
    if (modules.length > 0 || quizzes.length > 0) {
      savePromises.push(apiClient.saveBatch(modules, quizzes));
    }
    if (challenges.length > 0) {
      savePromises.push(apiClient.saveChallengeProgress(challenges));
    }

    if (savePromises.length > 0) {
      await Promise.all(savePromises);
    }

    set({ syncStatus: 'synced', lastSyncedAt: Date.now() });
  } catch (error) {
    logger.error('Failed to save progress to database:', error);
    set({ syncStatus: 'error' });
  }
};

// Load progress from database
const loadFromDatabase = async (set: (state: Partial<AppStore> | ((state: AppStore) => Partial<AppStore>)) => void, _get: () => AppStore, userId: string, signal?: AbortSignal) => {
  set({ syncStatus: 'syncing' });
  try {
    const data = await apiClient.loadProgress(signal);

    // Check if request was aborted
    if (signal?.aborted) return;

    if (data.completedModules.length > 0 || Object.keys(data.quizScores).length > 0) {
      set({
        completedModules: data.completedModules,
        quizScores: data.quizScores,
        userId,
        syncStatus: 'synced',
      });
    } else {
      set({ userId, syncStatus: 'synced' });
    }

    // Restore challenge progress if available
    if (data.challenges) {
      set({
        owaspChallengeScores: data.challenges.owasp ?? { correct: 0, total: 0, answered: [], selectedOptions: {} },
        authChallengeScores: data.challenges.auth ?? { correct: 0, total: 0, answered: [], selectedOptions: {} },
        headersChallengeScores: data.challenges.headers ?? { correct: 0, total: 0, answered: [], selectedOptions: {} },
        secureCodingChallengeScores: data.challenges['secure-coding'] ?? { correct: 0, total: 0, answered: [], selectedOptions: {} },
      });
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return;
    logger.error('Failed to load progress from database:', error);
    set({ syncStatus: 'error' });
  }
};

// Create the store
const createStore = (set: (state: Partial<AppStore> | ((state: AppStore) => Partial<AppStore>)) => void, get: () => AppStore): AppStore => ({
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
  userId: null,
  syncStatus: 'idle',
  lastSyncedAt: null,

  setCurrentPage: (page: PageType) => set({ currentPage: page, sidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  
  completeModule: (moduleId: string) => {
    set((state) => {
      if (state.completedModules.includes(moduleId)) return state;
      const isFirstModule = state.completedModules.length === 0;
      const willBeAllComplete = state.completedModules.length + 1 >= 8;
      let xpGain = XP_REWARDS.completeModule + (isFirstModule ? XP_REWARDS.firstModuleComplete : 0);
      if (willBeAllComplete) xpGain += XP_REWARDS.allModulesComplete;
      return {
        completedModules: [...state.completedModules, moduleId],
        totalXP: state.totalXP + xpGain,
      };
    });
    ensureSync(get, set).catch((err) => logger.error('Sync failed after completeModule:', err));
    return Promise.resolve();
  },

  setQuizScore: (category: string, score: number, attempt?: QuizAttempt) => {
    set((state) => {
      const xpGain = XP_REWARDS.quizPass + Math.round(score * XP_REWARDS.quizBonusPerPercent);
      return {
        quizScores: { ...state.quizScores, [category]: score },
        quizHistory: attempt ? [attempt, ...state.quizHistory].slice(0, 50) : state.quizHistory,
        totalXP: state.totalXP + xpGain,
      };
    });
    ensureSync(get, set).catch((err) => logger.error('Sync failed after setQuizScore:', err));
    return Promise.resolve();
  },

  addQuizAttempt: (attempt: QuizAttempt) => {
    set((state) => ({
      quizHistory: [attempt, ...state.quizHistory].slice(0, 50),
    }));
    ensureSync(get, set).catch((err) => logger.error('Sync failed after addQuizAttempt:', err));
  },

  clearQuizHistory: () => {
    set({ quizHistory: [] });
    ensureSync(get, set).catch((err) => logger.error('Sync failed after clearQuizHistory:', err));
  },

  resetProgress: async () => {
    set({
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
      syncStatus: 'syncing',
    });
    try {
      await apiClient.resetProgress();
      set({ syncStatus: 'synced', lastSyncedAt: Date.now() });
    } catch (error) {
      logger.error('Failed to reset progress:', error);
      set({ syncStatus: 'error' });
    }
    return Promise.resolve();
  },

  addStudiedOwasp: (id: string) => {
    set((state) => ({
      studiedOwaspItems: addUnique(state.studiedOwaspItems, id),
    }));
  },

  addSqlLevel: (level: string) => {
    set((state) => ({
      sqlCompletedLevels: addUnique(state.sqlCompletedLevels, level),
    }));
  },

  addXssLevel: (level: string) => {
    set((state) => ({
      xssCompletedLevels: addUnique(state.xssCompletedLevels, level),
    }));
  },

  setOwaspChallengeScore: (correct: number, answered: number[], selectedOptions: Record<string, number>) => {
    set({ owaspChallengeScores: { correct, total: answered.length, answered, selectedOptions } });
    ensureSync(get, set).catch((err) => logger.error('Sync failed after setOwaspChallengeScore:', err));
  },

  setAuthChallengeScore: (correct: number, answered: number[], selectedOptions: Record<string, number>) => {
    set({ authChallengeScores: { correct, total: answered.length, answered, selectedOptions } });
    ensureSync(get, set).catch((err) => logger.error('Sync failed after setAuthChallengeScore:', err));
  },

  setHeadersChallengeScore: (correct: number, answered: number[], selectedOptions: Record<string, number>) => {
    set({ headersChallengeScores: { correct, total: answered.length, answered, selectedOptions } });
    ensureSync(get, set).catch((err) => logger.error('Sync failed after setHeadersChallengeScore:', err));
  },

  setSecureCodingChallengeScore: (correct: number, answered: number[], selectedOptions: Record<string, number>) => {
    set({ secureCodingChallengeScores: { correct, total: answered.length, answered, selectedOptions } });
    ensureSync(get, set).catch((err) => logger.error('Sync failed after setSecureCodingChallengeScore:', err));
  },

  markCsrfChallengeViewed: (index: number) => {
    set((state) => ({
      csrfViewedChallenges: addUnique(state.csrfViewedChallenges, index),
    }));
    ensureSync(get, set).catch((err) => logger.error('Sync failed after markCsrfChallengeViewed:', err));
  },

  setUserId: (userId: string | null) => set({ userId }),

  awardXP: (amount: number) => {
    set((state) => ({ totalXP: state.totalXP + Math.max(0, amount) }));
  },

  getXPLevel: () => {
    const state = get();
    return {
      level: calculateLevel(state.totalXP),
      progress: levelProgress(state.totalXP),
      xpToNext: (() => {
        const level = calculateLevel(state.totalXP);
        if (level >= 50) return 0;
        let accumulated = 0;
        for (let i = 1; i < level; i++) accumulated += i * 100;
        const currentLevelXP = state.totalXP - accumulated;
        return level * 100 - currentLevelXP;
      })(),
      totalXP: state.totalXP,
    };
  },

  getXPBreakdown: () => {
    const state = get();
    const totalChallengeCorrect =
      state.owaspChallengeScores.correct +
      state.authChallengeScores.correct +
      state.headersChallengeScores.correct +
      state.secureCodingChallengeScores.correct;
    return calculateXPBreakdown(state.completedModules, state.quizScores, totalChallengeCorrect);
  },

  addNote: (itemId: string, moduleId: string, moduleName: string, content: string) => {
    const now = Date.now();
    const noteId = generateNoteId();
    set((state) => ({
      notes: {
        ...state.notes,
        [noteId]: { id: noteId, itemId, moduleId, moduleName, content, createdAt: now, updatedAt: now },
      },
    }));
  },

  updateNote: (noteId: string, content: string) => {
    set((state) => {
      const existing = state.notes[noteId];
      if (!existing) return state;
      return {
        notes: {
          ...state.notes,
          [noteId]: { ...existing, content, updatedAt: Date.now() },
        },
      };
    });
  },

  deleteNote: (noteId: string) => {
    set((state) => {
      const { [noteId]: _removed, ...rest } = state.notes;
      return { notes: rest };
    });
  },

  getNotesForItem: (itemId: string) => {
    const state = get();
    return Object.values(state.notes)
      .filter((n) => n.itemId === itemId)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },

  importProgressData: (data) => {
    set({
      completedModules: data.completedModules,
      quizScores: data.quizScores,
      studiedOwaspItems: data.studiedOwaspItems,
      sqlCompletedLevels: data.sqlCompletedLevels,
      xssCompletedLevels: data.xssCompletedLevels,
      owaspChallengeScores: data.owaspChallengeScores,
      authChallengeScores: data.authChallengeScores,
      headersChallengeScores: data.headersChallengeScores,
      secureCodingChallengeScores: data.secureCodingChallengeScores,
      csrfViewedChallenges: data.csrfViewedChallenges,
      quizHistory: data.quizHistory,
      totalXP: data.totalXP ?? 0,
      notes: (data as Record<string, unknown>).notes as NotesMap | undefined ?? {},
    });
    ensureSync(get, set).catch((err) => logger.error('Sync failed after importProgressData:', err));
  },

  syncWithDatabase: async () => {
    await ensureSync(get, set);
  },

  loadFromDatabase: async (userId: string, signal?: AbortSignal) => {
    // Abort any prior in-flight load request
    if (loadAbortController) {
      loadAbortController.abort();
    }
    loadAbortController = new AbortController();
    // Use provided signal if available, otherwise use our abort controller
    const effectiveSignal = signal ?? loadAbortController.signal;
    try {
      await loadFromDatabase(set, get, userId, effectiveSignal);
    } finally {
      // Clear the abort controller when this call completes
      if (loadAbortController?.signal === effectiveSignal) {
        loadAbortController = null;
      }
    }
  },
});

// Create the store with persistence
const useAppStore = create<AppStore>()(
  persist(createStore, {
    name: 'security-trainer-progress',
    // Persist all fields except runtime-only ones that should not survive page reload.
    // This approach is resilient to new state additions — no need to update partialize when adding new persistent fields.
    partialize: (state) => {
      const { syncStatus: _ss, lastSyncedAt: _lsa, ...rest } = state;
      return rest as Omit<AppState, 'syncStatus' | 'lastSyncedAt'>;
    },
  })
);

export { useAppStore };
