import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  setCurrentPage: (page: PageType) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  completeModule: (moduleId: string) => void;
  setQuizScore: (category: string, score: number) => void;
  resetProgress: () => void;
  addStudiedOwasp: (id: string) => void;
  addSqlLevel: (level: string) => void;
  addXssLevel: (level: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentPage: 'dashboard',
      sidebarOpen: false,
      completedModules: [],
      quizScores: {},
      studiedOwaspItems: [],
      sqlCompletedLevels: [],
      xssCompletedLevels: [],
      setCurrentPage: (page) => set({ currentPage: page, sidebarOpen: false }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      completeModule: (moduleId) =>
        set((s) => ({
          completedModules: s.completedModules.includes(moduleId)
            ? s.completedModules
            : [...s.completedModules, moduleId],
        })),
      setQuizScore: (category, score) =>
        set((s) => ({
          quizScores: { ...s.quizScores, [category]: score },
        })),
      resetProgress: () =>
        set({
          completedModules: [],
          quizScores: {},
          studiedOwaspItems: [],
          sqlCompletedLevels: [],
          xssCompletedLevels: [],
        }),
      addStudiedOwasp: (id) =>
        set((s) => ({
          studiedOwaspItems: s.studiedOwaspItems.includes(id)
            ? s.studiedOwaspItems
            : [...s.studiedOwaspItems, id],
        })),
      addSqlLevel: (level) =>
        set((s) => ({
          sqlCompletedLevels: s.sqlCompletedLevels.includes(level)
            ? s.sqlCompletedLevels
            : [...s.sqlCompletedLevels, level],
        })),
      addXssLevel: (level) =>
        set((s) => ({
          xssCompletedLevels: s.xssCompletedLevels.includes(level)
            ? s.xssCompletedLevels
            : [...s.xssCompletedLevels, level],
        })),
    }),
    { name: 'security-trainer-progress' }
  )
);
