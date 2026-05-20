import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { quizCategories } from './data/quiz-data';

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
  owaspChallengeScores: { correct: number; total: number; answered: number[] };
  authChallengeScores: { correct: number; total: number; answered: number[] };
  headersChallengeScores: { correct: number; total: number; answered: number[] };
  secureCodingChallengeScores: { correct: number; total: number; answered: number[] };
  csrfViewedChallenges: number[];
  userId: string | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncedAt: Date | null;
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
  setOwaspChallengeScore: (correct: number, answered: number[]) => void;
  setAuthChallengeScore: (correct: number, answered: number[]) => void;
  setHeadersChallengeScore: (correct: number, answered: number[]) => void;
  setSecureCodingChallengeScore: (correct: number, answered: number[]) => void;
  markCsrfChallengeViewed: (index: number) => void;
  setUserId: (userId: string | null) => void;
  syncWithDatabase: () => Promise<void>;
  loadFromDatabase: (userId: string) => Promise<void>;
}

type AppStore = AppState & AppActions;

// Prevent concurrent sync calls; always reads latest state via get()
let isSyncing = false;
let syncRequested = false;
let pendingSyncResolve: (() => void)[] = [];

const ensureSync = async (get: () => AppStore, set: (partial: Partial<AppStore>) => void) => {
  // If already syncing, queue this caller to wait for the current sync to finish
  if (isSyncing) {
    syncRequested = true;
    return new Promise<void>((resolve) => {
      pendingSyncResolve.push(resolve);
    });
  }
  isSyncing = true;
  syncRequested = true; // trigger at least one sync

  try {
    // Loop to handle pending sync requests — always reads latest state
    while (syncRequested) {
      syncRequested = false;
      await syncWithDatabase(get(), set);
    }
  } finally {
    isSyncing = false;
    // Resolve all queued callers
    const resolves = pendingSyncResolve;
    pendingSyncResolve = [];
    for (const resolve of resolves) resolve();
  }
};

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

  async loadProgress() {
    const response = await fetch('/api?action=load-progress', {
      method: 'GET',
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
};

// Функция для синхронизации с БД через API (батчевый вызов)
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

    await apiClient.saveBatch(modules, quizzes);

    set({ syncStatus: 'synced', lastSyncedAt: new Date() });
  } catch {
    set({ syncStatus: 'error' });
  }
};

// Функция для загрузки из БД
const loadFromDatabase = async (set: (state: Partial<AppStore> | ((state: AppStore) => Partial<AppStore>)) => void, _get: () => AppStore, userId: string) => {
  set({ syncStatus: 'syncing' });
  try {
    const data = await apiClient.loadProgress();

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
  } catch (error) {
    console.error('Failed to load progress from database:', error);
    set({ syncStatus: 'error' });
  }
};

// Создаём store
const createStore = (set: (state: Partial<AppStore> | ((state: AppStore) => Partial<AppStore>)) => void, get: () => AppStore): AppStore => ({
  currentPage: 'dashboard',
  sidebarOpen: false,
  completedModules: [],
  quizScores: {},
  studiedOwaspItems: [],
  sqlCompletedLevels: [],
  xssCompletedLevels: [],
  owaspChallengeScores: { correct: 0, total: 0, answered: [] },
  authChallengeScores: { correct: 0, total: 0, answered: [] },
  headersChallengeScores: { correct: 0, total: 0, answered: [] },
  secureCodingChallengeScores: { correct: 0, total: 0, answered: [] },
  csrfViewedChallenges: [],
  userId: null,
  syncStatus: 'idle',
  lastSyncedAt: null,

  setCurrentPage: (page: PageType) => set({ currentPage: page, sidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  
  completeModule: async (moduleId: string) => {
    set((state) => ({
      completedModules: state.completedModules.includes(moduleId) 
        ? state.completedModules 
        : [...state.completedModules, moduleId],
    }));
    await ensureSync(get, set);
  },

  setQuizScore: async (category: string, score: number) => {
    set((state) => ({
      quizScores: { ...state.quizScores, [category]: score },
    }));
    await ensureSync(get, set);
  },

  resetProgress: async () => {
    set({
      completedModules: [],
      quizScores: {},
      studiedOwaspItems: [],
      sqlCompletedLevels: [],
      xssCompletedLevels: [],
      owaspChallengeScores: { correct: 0, total: 0, answered: [] },
      authChallengeScores: { correct: 0, total: 0, answered: [] },
      headersChallengeScores: { correct: 0, total: 0, answered: [] },
      secureCodingChallengeScores: { correct: 0, total: 0, answered: [] },
      csrfViewedChallenges: [],
    });
    await ensureSync(get, set);
  },

  addStudiedOwasp: (id: string) => {
    set((state) => ({
      studiedOwaspItems: state.studiedOwaspItems.includes(id)
        ? state.studiedOwaspItems
        : [...state.studiedOwaspItems, id],
    }));
  },

  addSqlLevel: (level: string) => {
    set((state) => ({
      sqlCompletedLevels: state.sqlCompletedLevels.includes(level)
        ? state.sqlCompletedLevels
        : [...state.sqlCompletedLevels, level],
    }));
  },

  addXssLevel: (level: string) => {
    set((state) => ({
      xssCompletedLevels: state.xssCompletedLevels.includes(level)
        ? state.xssCompletedLevels
        : [...state.xssCompletedLevels, level],
    }));
  },

  setOwaspChallengeScore: (correct: number, answered: number[]) => {
    set({ owaspChallengeScores: { correct, total: answered.length, answered } });
  },

  setAuthChallengeScore: (correct: number, answered: number[]) => {
    set({ authChallengeScores: { correct, total: answered.length, answered } });
  },

  setHeadersChallengeScore: (correct: number, answered: number[]) => {
    set({ headersChallengeScores: { correct, total: answered.length, answered } });
  },

  setSecureCodingChallengeScore: (correct: number, answered: number[]) => {
    set({ secureCodingChallengeScores: { correct, total: answered.length, answered } });
  },

  markCsrfChallengeViewed: (index: number) => {
    set((state) => ({
      csrfViewedChallenges: state.csrfViewedChallenges.includes(index)
        ? state.csrfViewedChallenges
        : [...state.csrfViewedChallenges, index],
    }));
  },

  setUserId: (userId: string | null) => set({ userId }),

  syncWithDatabase: async () => {
    await ensureSync(get, set);
  },

  loadFromDatabase: async (userId: string) => {
    await loadFromDatabase(set, get, userId);
  },
});

// Создаём store с persist
const useAppStore = create<AppStore>()(
  persist(createStore, {
    name: 'security-trainer-progress',
    partialize: (state) => ({
      currentPage: state.currentPage,
      sidebarOpen: state.sidebarOpen,
      completedModules: state.completedModules,
      quizScores: state.quizScores,
      studiedOwaspItems: state.studiedOwaspItems,
      sqlCompletedLevels: state.sqlCompletedLevels,
      xssCompletedLevels: state.xssCompletedLevels,
      owaspChallengeScores: state.owaspChallengeScores,
      authChallengeScores: state.authChallengeScores,
      headersChallengeScores: state.headersChallengeScores,
      secureCodingChallengeScores: state.secureCodingChallengeScores,
      csrfViewedChallenges: state.csrfViewedChallenges,
      // syncStatus and lastSyncedAt are runtime-only, not persisted
    }),
  })
);

export { useAppStore };
