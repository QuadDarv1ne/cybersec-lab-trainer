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
  addStudiedOwasp: (id: string) => Promise<void>;
  addSqlLevel: (level: string) => Promise<void>;
  addXssLevel: (level: string) => Promise<void>;
  setUserId: (userId: string | null) => void;
  syncWithDatabase: () => Promise<void>;
  loadFromDatabase: (userId: string) => Promise<void>;
}

type AppStore = AppState & AppActions;

// Prevent concurrent sync calls; always uses latest state
let isSyncing = false;
let syncRequested = false;

const ensureSync = async (get: () => AppStore, set: (partial: Partial<AppStore>) => void) => {
  if (isSyncing) {
    syncRequested = true;
    return;
  }
  isSyncing = true;
  syncRequested = false;
  await syncWithDatabase(get(), set);
  isSyncing = false;
  if (syncRequested) {
    syncRequested = false;
    await ensureSync(get, set);
  }
};

// API client functions
const apiClient = {
  async saveProgress(userId: string, moduleId: string, completed: boolean, score?: number) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const response = await fetch('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'progress',
        userId,
        payload: { moduleId, completed, score },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to save progress');
    }

    return response.json();
  },

  async saveQuizResults(userId: string, quizId: string, score: number, total: number) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const response = await fetch('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'quiz-answers',
        payload: { userId, quizId, score, total },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to save quiz results');
    }

    return response.json();
  },

  async loadProgress(userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const response = await fetch(`/api?action=load-progress`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to load progress');
    }

    return response.json();
  },
};

// Функция для синхронизации с БД через API
const syncWithDatabase = async (state: AppState, set: (partial: Partial<AppStore>) => void) => {
  if (!state.userId) {
    set({ syncStatus: 'idle' });
    return;
  }

  set({ syncStatus: 'syncing' });
  try {
    await apiClient.saveProgress(
      state.userId,
      'all',
      state.completedModules.length > 0,
      Object.values(state.quizScores).reduce((a, b) => a + b, 0)
    );

    for (const [category, score] of Object.entries(state.quizScores)) {
      const total = quizCategories.find((c) => c.id === category)?.count ?? 100;
      await apiClient.saveQuizResults(state.userId, category, score, total);
    }

    set({ syncStatus: 'synced', lastSyncedAt: new Date() });
  } catch {
    set({ syncStatus: 'error' });
  }
};

// Функция для загрузки из БД
const loadFromDatabase = async (set: (state: Partial<AppStore> | ((state: AppStore) => Partial<AppStore>)) => void, _get: () => AppStore, userId: string) => {
  try {
    const data = await apiClient.loadProgress(userId);

    // Only overwrite local state if the API actually returned data
    // Otherwise keep the client-side persisted state (localStorage)
    if (data.completedModules.length > 0 || Object.keys(data.quizScores).length > 0) {
      set({
        completedModules: data.completedModules,
        quizScores: data.quizScores,
        userId,
      });
    } else {
      // API has no data — just set userId to keep using local state
      set({ userId });
    }
  } catch (error) {
    console.error('Failed to load progress from database:', error);
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
    });
    await ensureSync(get, set);
  },

  addStudiedOwasp: async (id: string) => {
    set((state) => ({
      studiedOwaspItems: state.studiedOwaspItems.includes(id)
        ? state.studiedOwaspItems
        : [...state.studiedOwaspItems, id],
    }));
    await ensureSync(get, set);
  },

  addSqlLevel: async (level: string) => {
    set((state) => ({
      sqlCompletedLevels: state.sqlCompletedLevels.includes(level)
        ? state.sqlCompletedLevels
        : [...state.sqlCompletedLevels, level],
    }));
    await ensureSync(get, set);
  },

  addXssLevel: async (level: string) => {
    set((state) => ({
      xssCompletedLevels: state.xssCompletedLevels.includes(level)
        ? state.xssCompletedLevels
        : [...state.xssCompletedLevels, level],
    }));
    await ensureSync(get, set);
  },

  setUserId: (userId: string | null) => set({ userId }),

  syncWithDatabase: async () => {
    await syncWithDatabase(get(), set);
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
      // syncStatus and lastSyncedAt are runtime-only, not persisted
    }),
  })
);

export { useAppStore };
