import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from './db';

export type PageType = 
  | 'dashboard' 
  | 'owasp' 
  | 'sql-injection' 
  | 'xss' 
  | 'csrf' 
  | 'auth' 
  | 'secure-coding' 
  | 'tools' 
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

// Функция для синхронизации с БД
const syncWithDatabase = async (state: AppState) => {
  if (!state.userId) return;

  try {
    // Синхронизируем прогресс модулей
    await db.progress.upsert({
      where: { userId_moduleId: { userId: state.userId, moduleId: 'all' } },
      create: {
        userId: state.userId,
        moduleId: 'all',
        completed: state.completedModules.length > 0,
        score: Object.values(state.quizScores).reduce((a, b) => a + b, 0),
        lastAccessed: new Date(),
      },
      update: {
        completed: state.completedModules.length > 0,
        score: Object.values(state.quizScores).reduce((a, b) => a + b, 0),
        lastAccessed: new Date(),
      },
    });

    // Синхронизируем результаты квизов
    for (const [category, score] of Object.entries(state.quizScores)) {
      await db.quizResult.upsert({
        where: { 
          id: `${state.userId}_${category}`
        },
        create: {
          id: `${state.userId}_${category}`,
          userId: state.userId,
          quizId: category,
          score,
          total: 100,
          percentage: score,
        },
        update: {
          score,
          total: 100,
          percentage: score,
        },
      });
    }
  } catch (error) {
    console.error('Ошибка синхронизации с БД:', error);
  }
};

// Функция для загрузки из БД
const loadFromDatabase = async (set: (state: Partial<AppState>) => void, userId: string) => {
  try {
    const progress = await db.progress.findMany({
      where: { userId },
    });

    const quizResults = await db.quizResult.findMany({
      where: { userId },
    });

    const completedModules = progress.map((p) => p.moduleId);
    const quizScores: Record<string, number> = {};
    quizResults.forEach((r) => {
      quizScores[r.quizId] = r.score;
    });

    set({
      completedModules,
      quizScores,
      userId,
    });
  } catch (error) {
    console.error('Ошибка загрузки из БД:', error);
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

  setCurrentPage: (page: PageType) => set({ currentPage: page, sidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  
  completeModule: async (moduleId: string) => {
    set((state) => ({
      completedModules: state.completedModules.includes(moduleId) 
        ? state.completedModules 
        : [...state.completedModules, moduleId],
    }));
    await syncWithDatabase(get());
  },

  setQuizScore: async (category: string, score: number) => {
    set((state) => ({
      quizScores: { ...state.quizScores, [category]: score },
    }));
    await syncWithDatabase(get());
  },

  resetProgress: async () => {
    set({
      completedModules: [],
      quizScores: {},
      studiedOwaspItems: [],
      sqlCompletedLevels: [],
      xssCompletedLevels: [],
    });
    await syncWithDatabase(get());
  },

  addStudiedOwasp: async (id: string) => {
    set((state) => ({
      studiedOwaspItems: state.studiedOwaspItems.includes(id)
        ? state.studiedOwaspItems
        : [...state.studiedOwaspItems, id],
    }));
    await syncWithDatabase(get());
  },

  addSqlLevel: async (level: string) => {
    set((state) => ({
      sqlCompletedLevels: state.sqlCompletedLevels.includes(level)
        ? state.sqlCompletedLevels
        : [...state.sqlCompletedLevels, level],
    }));
    await syncWithDatabase(get());
  },

  addXssLevel: async (level: string) => {
    set((state) => ({
      xssCompletedLevels: state.xssCompletedLevels.includes(level)
        ? state.xssCompletedLevels
        : [...state.xssCompletedLevels, level],
    }));
    await syncWithDatabase(get());
  },

  setUserId: (userId: string | null) => set({ userId }),

  syncWithDatabase: async () => {
    await syncWithDatabase(get());
  },

  loadFromDatabase: async (userId: string) => {
    await loadFromDatabase(set, userId);
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
    }),
  })
);

export { useAppStore };
