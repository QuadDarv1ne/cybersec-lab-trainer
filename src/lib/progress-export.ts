import { logger } from '@/lib/logger';
import { modules } from '@/lib/data/modules-data';
import { quizCategories } from '@/lib/data/quiz-data';

// Build sets of valid IDs for import validation
const validModuleIds = new Set(modules.map((m) => m.id));
const validQuizCategoryIds = new Set(quizCategories.map((c) => c.id));

type ChallengeScores = {
  correct: number;
  total: number;
  answered: number[];
  selectedOptions: Record<string, number>;
};

type QuizHistoryEntry = {
  id: string;
  categoryId: string;
  categoryName: string;
  score: number;
  correct: number;
  total: number;
  answers: (boolean | null)[];
  timestamp: number;
};

const EXPORT_VERSION = 3;

export interface ExportData {
  version: number;
  exportedAt: string;
  data: {
    completedModules: string[];
    quizScores: Record<string, number>;
    studiedOwaspItems: string[];
    sqlCompletedLevels: string[];
    xssCompletedLevels: string[];
    owaspChallengeScores: ChallengeScores;
    authChallengeScores: ChallengeScores;
    headersChallengeScores: ChallengeScores;
    secureCodingChallengeScores: ChallengeScores;
    csrfViewedChallenges: number[];
    quizHistory: QuizHistoryEntry[];
    totalXP: number;
    notes: Record<string, { id: string; itemId: string; moduleId: string; moduleName: string; content: string; createdAt: number; updatedAt: number }>;
  };
}

/**
 * Exports all progress data as a downloadable JSON file.
 */
export function exportProgress(state: {
  completedModules: string[];
  quizScores: Record<string, number>;
  studiedOwaspItems: string[];
  sqlCompletedLevels: string[];
  xssCompletedLevels: string[];
  owaspChallengeScores: ChallengeScores;
  authChallengeScores: ChallengeScores;
  headersChallengeScores: ChallengeScores;
  secureCodingChallengeScores: ChallengeScores;
  csrfViewedChallenges: number[];
  quizHistory: QuizHistoryEntry[];
  totalXP: number;
  notes: Record<string, { id: string; itemId: string; moduleId: string; moduleName: string; content: string; createdAt: number; updatedAt: number }>;
}): string {
  const exportData: ExportData = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
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
      quizHistory: state.quizHistory,
      totalXP: state.totalXP,
      notes: state.notes,
    },
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cybersec-lab-progress-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  try {
    a.click();
  } finally {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return exportData.exportedAt;
}

/**
 * Validates and parses imported JSON data.
 * Returns the parsed data or null if invalid.
 */
export function importProgress(jsonString: string): {
  completedModules: string[];
  quizScores: Record<string, number>;
  studiedOwaspItems: string[];
  sqlCompletedLevels: string[];
  xssCompletedLevels: string[];
  owaspChallengeScores: ChallengeScores;
  authChallengeScores: ChallengeScores;
  headersChallengeScores: ChallengeScores;
  secureCodingChallengeScores: ChallengeScores;
  csrfViewedChallenges: number[];
  quizHistory: QuizHistoryEntry[];
  totalXP: number;
} | null {
  try {
    const parsed: ExportData = JSON.parse(jsonString);

    if (!parsed.version || parsed.version < 1 || parsed.version > EXPORT_VERSION) {
      logger.error(`Unsupported export version: ${parsed?.version}`);
      return null;
    }

    if (!parsed.data || typeof parsed.data !== 'object') {
      logger.error('Invalid export data structure');
      return null;
    }

    const d = parsed.data;

    // Validate required array fields
    const requiredArrays = ['completedModules', 'studiedOwaspItems', 'sqlCompletedLevels', 'xssCompletedLevels', 'csrfViewedChallenges', 'quizHistory'] as const;
    for (const key of requiredArrays) {
      if (!Array.isArray(d[key])) {
        logger.error(`Invalid or missing field: ${key}`);
        return null;
      }
    }

    // Validate quizScores is a record with number values
    if (typeof d.quizScores !== 'object' || d.quizScores === null || Array.isArray(d.quizScores)) {
      logger.error('Invalid quizScores format');
      return null;
    }
    for (const [key, val] of Object.entries(d.quizScores)) {
      if (typeof val !== 'number') {
        logger.error(`Invalid quiz score for category: ${key}`);
        return null;
      }
      if (val < 0 || val > 100) {
        logger.error(`Quiz score out of range for ${key}: ${val}`);
        return null;
      }
      if (!validQuizCategoryIds.has(key)) {
        logger.warn(`Unknown quiz category: ${key} (may be from a newer version)`);
      }
    }

    // Validate module IDs against known valid IDs
    const unknownModules = d.completedModules.filter((id) => typeof id !== 'string' || !validModuleIds.has(id));
    if (unknownModules.length > 0) {
      logger.warn(`Unknown or invalid module IDs in import: ${unknownModules.join(', ')} (may be from a newer version)`);
    }

    // Validate challenge score objects
    const challengeKeys = ['owaspChallengeScores', 'authChallengeScores', 'headersChallengeScores', 'secureCodingChallengeScores'] as const;
    for (const key of challengeKeys) {
      const cs = d[key];
      if (!cs || typeof cs !== 'object' || typeof cs.correct !== 'number' || typeof cs.total !== 'number' || !Array.isArray(cs.answered) || typeof cs.selectedOptions !== 'object') {
        logger.error(`Invalid challenge scores: ${key}`);
        return null;
      }
    }

    // Validate quiz history scores are within bounds
    for (let i = 0; i < d.quizHistory.length; i++) {
      const entry = d.quizHistory[i];
      if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string' || typeof entry.categoryId !== 'string' || typeof entry.score !== 'number' || typeof entry.correct !== 'number' || typeof entry.total !== 'number' || typeof entry.timestamp !== 'number' || !Array.isArray(entry.answers)) {
        logger.error(`Invalid quiz history entry at index ${i}`);
        return null;
      }
      if (entry.score < 0 || entry.score > 100) {
        logger.error(`Quiz history score out of range at index ${i}: ${entry.score}`);
        return null;
      }
    }

    // Clamp totalXP to prevent arbitrary XP injection (max ~1490 possible, allow up to 10000 for safety)
    const MAX_REASONABLE_XP = 10000;
    const rawXP = typeof d.totalXP === 'number' ? d.totalXP : 0;
    const clampedXP = Math.max(0, Math.min(rawXP, MAX_REASONABLE_XP));
    if (rawXP !== clampedXP) {
      logger.warn(`Clamped totalXP from ${rawXP} to ${clampedXP}`);
    }

    return {
      ...d,
      totalXP: clampedXP,
    };
  } catch (error) {
    logger.error('Failed to parse import file:', error);
    return null;
  }
}
