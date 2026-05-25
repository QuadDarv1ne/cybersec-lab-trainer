'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { quizCategories } from './data/quiz-data';
import { modules } from './data/modules-data';
import { logger } from './logger';
import { XP_REWARDS, calculateLevel, xpToNextLevel, calculateXPBreakdown, levelProgress, type XPBreakdown } from './xp-system';
import { type NotesMap, type Note, generateNoteId } from './notes-system';
import { type StudySession, calculateSessionXP, generateSessionId, getTodayTotalMs, getTotalStudyTimeMs } from './study-sessions';
import { getCsrfCookieName, getCsrfHeaderName } from './csrf';
import { sanitizeNoteContent } from './sanitize';

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
  | 'notes'
  | 'analytics'
  | 'settings'
  | 'weakness-review'
  | 'blog';

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
  studySessions: StudySession[];
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
  startStudySession: (pageType: PageType) => void;
  endStudySession: () => void;
  getTodayStudyTime: () => number;
  getTotalStudyTime: () => number;
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

// Flag to block loadFromDatabase during resetProgress
let isResetting = false;

// Active study session tracking (runtime only, not persisted)
let activeSessionStart: number | null = null;
let activeSessionPage: PageType | null = null;

// Clear pending operations on page unload to prevent orphaned API calls
const registerBeforeUnload = () => {
  if (typeof window === 'undefined') return;
  const handler = () => {
    if (syncTimeout) {
      clearTimeout(syncTimeout);
      syncTimeout = null;
    }
    if (loadAbortController && !loadAbortController.signal.aborted) {
      loadAbortController.abort();
    }
    // Re-register for subsequent unloads (SPA navigation)
    registerBeforeUnload();
  };
  window.addEventListener('beforeunload', handler, { once: true });
};
registerBeforeUnload();

const ensureSync = async (get: () => AppStore, set: (partial: Partial<AppStore>) => void) => {
  // Block all syncs while reset is in progress to prevent stale data from overwriting reset state
  if (isResetting) return;

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
      followUpScheduled = false;
      pendingPromise = null;
    }

    resolve?.();
  }, SYNC_DELAY_MS);

  return pendingPromise;
};

// Helper: add item to array only if not already present (avoids 5 duplicate patterns)
const addUnique = <T>(array: T[], item: T): T[] =>
  array.includes(item) ? array : [...array, item];

// Get CSRF token from cookie
const getCsrfToken = (): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const name = getCsrfCookieName() + '=';
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const c = cookie.trim();
    if (c.startsWith(name)) return c.substring(name.length);
  }
  return undefined;
};

// Build headers for API requests with CSRF token
const createApiHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const csrfToken = getCsrfToken();
  if (csrfToken) headers[getCsrfHeaderName()] = csrfToken;
  return headers;
};

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

    return response.json().catch(() => ({ error: 'Invalid server response' }));
  },

  async saveBatch(modules: { moduleId: string; completed: boolean; score?: number }[], quizzes: { quizId: string; score: number; total: number }[]) {
    const response = await fetch('/api', {
      method: 'POST',
      headers: createApiHeaders(),
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
      headers: createApiHeaders(),
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
      headers: createApiHeaders(),
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

  async saveItemProgress(items: { moduleId: string; itemIds: string[] }[]) {
    const response = await fetch('/api', {
      method: 'POST',
      headers: createApiHeaders(),
      body: JSON.stringify({
        type: 'item-progress-sync',
        payload: { items },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to sync item progress');
    }

    return response.json();
  },

  async saveNotes(notes: { id?: string; itemId: string; moduleId: string; moduleName: string; content: string }[]) {
    const response = await fetch('/api', {
      method: 'POST',
      headers: createApiHeaders(),
      body: JSON.stringify({
        type: 'notes-sync',
        payload: { notes },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to sync notes');
    }

    return response.json();
  },

  async deleteNote(noteId: string) {
    const response = await fetch('/api', {
      method: 'POST',
      headers: createApiHeaders(),
      body: JSON.stringify({
        type: 'note-delete',
        payload: { noteId },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to delete note');
    }

    return response.json();
  },

  async saveStudySessions(sessions: { id?: string; date: string; durationMs: number; pageType: string; xpEarned: number }[]) {
    const response = await fetch('/api', {
      method: 'POST',
      headers: createApiHeaders(),
      body: JSON.stringify({
        type: 'study-sessions-sync',
        payload: { sessions },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to sync study sessions');
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

    // Sync item-level progress (SQL levels, XSS levels, OWASP items, CSRF viewed challenges)
    const itemProgress = [
      { moduleId: 'sql-injection', itemIds: state.sqlCompletedLevels },
      { moduleId: 'xss', itemIds: state.xssCompletedLevels },
      { moduleId: 'owasp', itemIds: state.studiedOwaspItems },
      { moduleId: 'csrf', itemIds: state.csrfViewedChallenges.map(String) },
    ].filter((ip) => ip.itemIds.length > 0);

    if (itemProgress.length > 0) {
      savePromises.push(apiClient.saveItemProgress(itemProgress));
    }

    // Sync notes
    const notesArray = Object.values(state.notes).map((note) => ({
      id: note.id,
      itemId: note.itemId,
      moduleId: note.moduleId,
      moduleName: note.moduleName,
      content: note.content,
    }));

    if (notesArray.length > 0) {
      savePromises.push(apiClient.saveNotes(notesArray));
    }

    // Sync study sessions
    const sessionsToSync = state.studySessions
      .filter((ss) => ss.id?.startsWith('session-') || !ss.id)
      .map((ss) => ({
        id: ss.id,
        date: ss.date,
        durationMs: ss.durationMs,
        pageType: ss.pageType,
        xpEarned: ss.xpEarned,
      }));

    if (sessionsToSync.length > 0) {
      savePromises.push(apiClient.saveStudySessions(sessionsToSync));
    }

    if (savePromises.length > 0) {
      const results = await Promise.allSettled(savePromises);
      const failures = results.filter((r) => r.status === 'rejected');
      if (failures.length > 0) {
        const reasons = failures.map((f) => (f as PromiseRejectedResult).reason);
        logger.error(`${failures.length} sync operation(s) failed:`, reasons);
        // Mark as error so the UI reflects that some data was not persisted.
        // Local state is preserved by zustand, so the next sync retry will re-send it.
        set({ syncStatus: 'error' });
        return;
      }
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

    // Runtime validation: normalize top-level fields
    const completedModules = Array.isArray(data.completedModules) ? data.completedModules : [];
    const quizScores = data.quizScores && typeof data.quizScores === 'object' && !Array.isArray(data.quizScores) ? data.quizScores : {};

    if (completedModules.length > 0 || Object.keys(quizScores).length > 0) {
      set({
        completedModules,
        quizScores,
        userId,
        syncStatus: 'synced',
      });
    } else {
      set({ userId, syncStatus: 'synced' });
    }

    // Restore challenge progress if available
    if (data.challenges && typeof data.challenges === 'object') {
      const challenges = data.challenges;
      const defaultChallenge = { correct: 0, total: 0, answered: [], selectedOptions: {} };
      set({
        owaspChallengeScores: (challenges.owasp && typeof challenges.owasp === 'object') ? challenges.owasp : defaultChallenge,
        authChallengeScores: (challenges.auth && typeof challenges.auth === 'object') ? challenges.auth : defaultChallenge,
        headersChallengeScores: (challenges.headers && typeof challenges.headers === 'object') ? challenges.headers : defaultChallenge,
        secureCodingChallengeScores: (challenges['secure-coding'] && typeof challenges['secure-coding'] === 'object') ? challenges['secure-coding'] : defaultChallenge,
      });
    }

    // Restore item-level progress if available
    if (data.itemProgress && typeof data.itemProgress === 'object') {
      const itemProgress = data.itemProgress;
      set({
        studiedOwaspItems: Array.isArray(itemProgress.owasp) ? itemProgress.owasp : [],
        sqlCompletedLevels: Array.isArray(itemProgress['sql-injection']) ? itemProgress['sql-injection'] : [],
        xssCompletedLevels: Array.isArray(itemProgress.xss) ? itemProgress.xss : [],
      });
    }

    // Restore CSRF viewed challenges if available
    if (Array.isArray(data.csrfViewedChallenges)) {
      set({ csrfViewedChallenges: data.csrfViewedChallenges.map(Number) });
    }

    // Restore notes if available
    if (data.notes && typeof data.notes === 'object' && !Array.isArray(data.notes)) {
      set({ notes: data.notes });
    }

    // Restore study sessions if available — merge with local unsaved sessions
    if (Array.isArray(data.studySessions)) {
      set((state) => {
        const serverIds = new Set(data.studySessions.filter((ss: unknown) => ss && typeof ss === 'object' && 'id' in ss).map((ss: { id: string }) => ss.id));
        const localUnsaved = state.studySessions.filter((ss) => !serverIds.has(ss.id));
        return { studySessions: [...data.studySessions, ...localUnsaved].slice(0, 100) };
      });
    }

    // Restore totalXP if available (computed server-side from study sessions)
    if (typeof data.totalXP === 'number') {
      set({ totalXP: data.totalXP });
    }

    // Restore quiz history if available
    if (Array.isArray(data.quizHistory)) {
      set({ quizHistory: data.quizHistory.slice(0, 50) });
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
  studySessions: [],
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
      const willBeAllComplete = state.completedModules.length + 1 >= modules.length;
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
    set({ syncStatus: 'syncing' });
    // Cancel any pending debounced sync to prevent stale data from being pushed
    if (syncTimeout) {
      clearTimeout(syncTimeout);
      syncTimeout = null;
    }
    // Clear any in-flight sync to prevent it from overwriting reset state
    if (pendingResolve) {
      pendingResolve();
      pendingResolve = null;
      pendingPromise = null;
    }
    isExecuting = false;
    followUpScheduled = false;
    // Snapshot current state before any mutations so we can restore on failure
    const snapshot = get();
    isResetting = true;
    try {
      await apiClient.resetProgress();
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
        studySessions: [],
      });
      set({ syncStatus: 'synced', lastSyncedAt: Date.now() });
    } catch (error) {
      logger.error('Failed to reset progress:', error);
      // Restore snapshot on failure
      set({
        completedModules: snapshot.completedModules,
        quizScores: snapshot.quizScores,
        quizHistory: snapshot.quizHistory,
        studiedOwaspItems: snapshot.studiedOwaspItems,
        sqlCompletedLevels: snapshot.sqlCompletedLevels,
        xssCompletedLevels: snapshot.xssCompletedLevels,
        owaspChallengeScores: snapshot.owaspChallengeScores,
        authChallengeScores: snapshot.authChallengeScores,
        headersChallengeScores: snapshot.headersChallengeScores,
        secureCodingChallengeScores: snapshot.secureCodingChallengeScores,
        csrfViewedChallenges: snapshot.csrfViewedChallenges,
        totalXP: snapshot.totalXP,
        notes: snapshot.notes,
        studySessions: snapshot.studySessions,
      });
      set({ syncStatus: 'error' });
    } finally {
      isResetting = false;
    }
    return Promise.resolve();
  },

  addStudiedOwasp: (id: string) => {
    set((state) => ({
      studiedOwaspItems: addUnique(state.studiedOwaspItems, id),
    }));
    ensureSync(get, set).catch((err) => logger.error('Sync failed after addStudiedOwasp:', err));
  },

  addSqlLevel: (level: string) => {
    set((state) => ({
      sqlCompletedLevels: addUnique(state.sqlCompletedLevels, level),
    }));
    ensureSync(get, set).catch((err) => logger.error('Sync failed after addSqlLevel:', err));
  },

  addXssLevel: (level: string) => {
    set((state) => ({
      xssCompletedLevels: addUnique(state.xssCompletedLevels, level),
    }));
    ensureSync(get, set).catch((err) => logger.error('Sync failed after addXssLevel:', err));
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
      xpToNext: xpToNextLevel(state.totalXP),
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
    const todayTotalMs = getTodayTotalMs(state.studySessions);
    const studySessionXP = calculateSessionXP(todayTotalMs);
    return calculateXPBreakdown(state.completedModules, state.quizScores, totalChallengeCorrect, studySessionXP, modules.length);
  },

  addNote: (itemId: string, moduleId: string, moduleName: string, content: string) => {
    const now = Date.now();
    const noteId = generateNoteId();
    const sanitized = sanitizeNoteContent(content);
    set((state) => ({
      notes: {
        ...state.notes,
        [noteId]: { id: noteId, itemId, moduleId, moduleName, content: sanitized, createdAt: now, updatedAt: now },
      },
    }));
    ensureSync(get, set).catch((err) => logger.error('Sync failed after addNote:', err));
  },

  updateNote: (noteId: string, content: string) => {
    const sanitized = sanitizeNoteContent(content);
    set((state) => {
      const existing = state.notes[noteId];
      if (!existing) return state;
      return {
        notes: {
          ...state.notes,
          [noteId]: { ...existing, content: sanitized, updatedAt: Date.now() },
        },
      };
    });
    ensureSync(get, set).catch((err) => logger.error('Sync failed after updateNote:', err));
  },

  deleteNote: async (noteId: string) => {
    const removedNote = get().notes[noteId];
    set((state) => {
      const { [noteId]: _removed, ...rest } = state.notes;
      return { notes: rest };
    });
    // Delete from DB first, then trigger full sync to reconcile state.
    // Awaiting the delete prevents the full sync from re-inserting the note.
    if (get().userId) {
      try {
        await apiClient.deleteNote(noteId);
      } catch (err) {
        logger.error('Failed to delete note from DB:', err);
        // Restore the note locally if DB delete failed to prevent data loss
        if (removedNote && !get().notes[noteId]) {
          set((state) => ({
            notes: { ...state.notes, [noteId]: removedNote },
          }));
        }
      }
    }
    ensureSync(get, set).catch((err) => logger.error('Sync failed after deleteNote:', err));
  },

  getNotesForItem: (itemId: string) => {
    const state = get();
    return Object.values(state.notes)
      .filter((n) => n.itemId === itemId)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },

  startStudySession: (pageType: PageType) => {
    activeSessionStart = Date.now();
    activeSessionPage = pageType;
  },

  endStudySession: () => {
    if (!activeSessionStart || !activeSessionPage) return;
    const durationMs = Date.now() - activeSessionStart;
    const xpEarned = calculateSessionXP(durationMs);
    set((state) => ({
      studySessions: [
        ...state.studySessions,
        {
          id: generateSessionId(),
          date: new Date().toISOString(),
          durationMs,
          pageType: activeSessionPage!,
          xpEarned,
        },
      ].slice(0, 100),
      totalXP: state.totalXP + xpEarned,
    }));
    activeSessionStart = null;
    activeSessionPage = null;
    ensureSync(get, set).catch((err) => logger.error('Sync failed after endStudySession:', err));
  },

  getTodayStudyTime: () => {
    const state = get();
    return getTodayTotalMs(state.studySessions);
  },

  getTotalStudyTime: () => {
    const state = get();
    return getTotalStudyTimeMs(state.studySessions);
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
      notes: ((data as Record<string, unknown>).notes as NotesMap | undefined) ?? {},
    });
    ensureSync(get, set).catch((err) => logger.error('Sync failed after importProgressData:', err));
  },

  syncWithDatabase: async () => {
    await ensureSync(get, set);
  },

  loadFromDatabase: async (userId: string, signal?: AbortSignal) => {
    // Skip loading if reset is in progress to prevent stale DB data from overwriting reset state
    if (isResetting) return;
    // Abort any prior in-flight load request that used an internally created controller
    if (loadAbortController && !loadAbortController.signal.aborted) {
      loadAbortController.abort();
    }
    // Only create a new internal controller if no signal was provided
    const isInternalSignal = !signal;
    if (isInternalSignal) {
      loadAbortController = new AbortController();
    }
    const effectiveSignal = signal ?? loadAbortController!.signal;
    try {
      await loadFromDatabase(set, get, userId, effectiveSignal);
    } finally {
      // Only clear the internal controller if it hasn't been replaced by another call
      if (isInternalSignal && loadAbortController?.signal === effectiveSignal) {
        loadAbortController = null;
      }
    }
  },
});

// Create the store with persistence
const useAppStore = create<AppStore>()(
  persist(createStore, {
    name: 'security-trainer-progress',
    // Persist progress data but exclude runtime-only and UI-only fields.
    // currentPage and sidebarOpen are pure UI state — persisting them triggers
    // unnecessary localStorage serialization on every navigation/toggle.
    partialize: (state) => {
      const { syncStatus: _ss, lastSyncedAt: _lsa, currentPage: _cp, sidebarOpen: _so, ...rest } = state;
      return rest as Omit<AppState, 'syncStatus' | 'lastSyncedAt' | 'currentPage' | 'sidebarOpen'>;
    },
  })
);

export { useAppStore };
