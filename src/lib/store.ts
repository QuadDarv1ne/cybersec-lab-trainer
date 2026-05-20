import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { quizCategories } from './data/quiz-data';
import { logger } from './logger';

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
  | 'achievements';

interface AppState {
  currentPage: PageType;
  sidebarOpen: boolean;
  completedModules: string[];
  quizScores: Record<string, number>;
  studiedOwaspItems: string[];
  sqlCompletedLevels: string[];
  xssCompletedLevels: string[];
  owaspChallengeScores: { correct: number; total: number; answered: number[]; selectedOptions: Record<number, number> };
  authChallengeScores: { correct: number; total: number; answered: number[]; selectedOptions: Record<number, number> };
  headersChallengeScores: { correct: number; total: number; answered: number[]; selectedOptions: Record<number, number> };
  secureCodingChallengeScores: { correct: number; total: number; answered: number[]; selectedOptions: Record<number, number> };
  csrfViewedChallenges: number[];
  userId: string | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncedAt: number | null;
}

interface AppActions {
  setCurrentPage: (page: PageType) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  completeModule: (moduleId: string) => Promise<void>;
  setQuizScore: (category: string, score: number) => Promise<void>;
  resetProgress: () => Promise<void>;
  addStudiedOwasp: (id: string) => void;
  addSqlLevel: (level: string) => void;
  addXssLevel: (level: string) => void;
  setOwaspChallengeScore: (correct: number, answered: number[], selectedOptions: Record<number, number>) => void;
  setAuthChallengeScore: (correct: number, answered: number[], selectedOptions: Record<number, number>) => void;
  setHeadersChallengeScore: (correct: number, answered: number[], selectedOptions: Record<number, number>) => void;
  setSecureCodingChallengeScore: (correct: number, answered: number[], selectedOptions: Record<number, number>) => void;
  markCsrfChallengeViewed: (index: number) => void;
  setUserId: (userId: string | null) => void;
  syncWithDatabase: () => Promise<void>;
  loadFromDatabase: (userId: string, signal?: AbortSignal) => Promise<void>;
}

type AppStore = AppState & AppActions;

// Debounced sync coalescer — batches rapid state changes into a single API call.
// Uses a timer to wait SYNC_DELAY_MS after the last trigger before flushing.
let syncTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingPromise: Promise<void> | null = null;
let pendingResolve: (() => void) | null = null;
const SYNC_DELAY_MS = 500;

const ensureSync = async (_get: () => AppStore, set: (partial: Partial<AppStore>) => void) => {
  // If there's already a pending promise, return it (coalesce concurrent calls)
  if (pendingPromise) return pendingPromise;

  // Create a new deferred promise
  pendingPromise = new Promise<void>((resolve) => {
    pendingResolve = resolve;
  });

  // Clear any existing timer and start a new one
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    syncTimeout = null;
    const _promise = pendingPromise;
    pendingPromise = null;
    const resolve = pendingResolve;
    pendingResolve = null;

    set({ syncStatus: 'syncing' });
    await syncWithDatabase(_get(), set);
    resolve?.();
  }, SYNC_DELAY_MS);

  return pendingPromise;
};

// Helper: add item to array only if not already present (avoids 5 duplicate patterns)
const addUnique = <T>(array: T[], item: T): T[] =>
  array.includes(item) ? array : [...array, item];

// API client functions
const apiClient = {
  async saveProgress(moduleId: string, completed: boolean, score?: number) {
    const response = await fetch('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'progress',
        payload: { moduleId, completed, score },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to save progress');
    }

    return response.json();
  },

  async saveQuizResults(quizId: string, score: number, total: number) {
    const response = await fetch('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'quiz-answers',
        payload: { quizId, score, total },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to save quiz results');
    }

    return response.json();
  },

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
};

// Sync with database via API (batch call)
const syncWithDatabase = async (state: AppState, set: (partial: Partial<AppStore>) => void) => {
  if (!state.userId) {
    set({ syncStatus: 'idle' });
    return;
  }

  set({ syncStatus: 'syncing' });
  try {
    const modules = state.completedModules.map((moduleId) => ({
      moduleId, completed: true, score: 100,
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

    await Promise.all([
      apiClient.saveBatch(modules, quizzes),
      challenges.length > 0 ? apiClient.saveChallengeProgress(challenges) : Promise.resolve(),
    ]);

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
  studiedOwaspItems: [],
  sqlCompletedLevels: [],
  xssCompletedLevels: [],
  owaspChallengeScores: { correct: 0, total: 0, answered: [], selectedOptions: {} },
  authChallengeScores: { correct: 0, total: 0, answered: [], selectedOptions: {} },
  headersChallengeScores: { correct: 0, total: 0, answered: [], selectedOptions: {} },
  secureCodingChallengeScores: { correct: 0, total: 0, answered: [], selectedOptions: {} },
  csrfViewedChallenges: [],
  userId: null,
  syncStatus: 'idle',
  lastSyncedAt: null,

  setCurrentPage: (page: PageType) => set({ currentPage: page, sidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  
  completeModule: (moduleId: string) => {
    set((state) => ({
      completedModules: state.completedModules.includes(moduleId) 
        ? state.completedModules 
        : [...state.completedModules, moduleId],
    }));
    void ensureSync(get, set);
    return Promise.resolve();
  },

  setQuizScore: (category: string, score: number) => {
    set((state) => ({
      quizScores: { ...state.quizScores, [category]: score },
    }));
    void ensureSync(get, set);
    return Promise.resolve();
  },

  resetProgress: () => {
    set({
      completedModules: [],
      quizScores: {},
      studiedOwaspItems: [],
      sqlCompletedLevels: [],
      xssCompletedLevels: [],
      owaspChallengeScores: { correct: 0, total: 0, answered: [], selectedOptions: {} },
      authChallengeScores: { correct: 0, total: 0, answered: [], selectedOptions: {} },
      headersChallengeScores: { correct: 0, total: 0, answered: [], selectedOptions: {} },
      secureCodingChallengeScores: { correct: 0, total: 0, answered: [], selectedOptions: {} },
      csrfViewedChallenges: [],
    });
    void ensureSync(get, set);
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

  setOwaspChallengeScore: (correct: number, answered: number[], selectedOptions: Record<number, number>) => {
    set({ owaspChallengeScores: { correct, total: answered.length, answered, selectedOptions } });
  },

  setAuthChallengeScore: (correct: number, answered: number[], selectedOptions: Record<number, number>) => {
    set({ authChallengeScores: { correct, total: answered.length, answered, selectedOptions } });
  },

  setHeadersChallengeScore: (correct: number, answered: number[], selectedOptions: Record<number, number>) => {
    set({ headersChallengeScores: { correct, total: answered.length, answered, selectedOptions } });
  },

  setSecureCodingChallengeScore: (correct: number, answered: number[], selectedOptions: Record<number, number>) => {
    set({ secureCodingChallengeScores: { correct, total: answered.length, answered, selectedOptions } });
  },

  markCsrfChallengeViewed: (index: number) => {
    set((state) => ({
      csrfViewedChallenges: addUnique(state.csrfViewedChallenges, index),
    }));
  },

  setUserId: (userId: string | null) => set({ userId }),

  syncWithDatabase: async () => {
    await ensureSync(get, set);
  },

  loadFromDatabase: async (userId: string, signal?: AbortSignal) => {
    await loadFromDatabase(set, get, userId, signal);
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
