import { achievements } from '@/lib/security-data';
import { modules } from '@/lib/data/modules-data';

/**
 * Checks whether a given achievement is unlocked based on progress state.
 * Centralised to avoid duplication between Dashboard and AchievementsGlossary.
 */
export function getAchievementStatus(
  id: string,
  completedModules: string[],
  quizScores: Record<string, number>,
  challengeStats?: { owaspCorrect: number; authCorrect: number }
): boolean {
  switch (id) {
    case 'first-steps': return completedModules.length >= 1;
    case 'sql-master': return completedModules.includes('sql-injection');
    case 'xss-hunter': return completedModules.includes('xss');
    case 'security-guard': return completedModules.includes('owasp');
    case 'auth-expert': return completedModules.includes('auth');
    case 'code-reviewer': return completedModules.includes('secure-coding');
    case 'quiz-master': return Object.keys(quizScores).length >= 3;
    case 'quiz-perfect': return Object.values(quizScores).some((s) => s === 100);
    case 'crypto-ninja': return completedModules.includes('tools');
    case 'headers-master': return completedModules.includes('security-headers');
    case 'full-completion': return completedModules.length >= modules.length;
    case 'owasp-challenger': return (challengeStats?.owaspCorrect ?? 0) >= 11;
    case 'auth-challenger': return (challengeStats?.authCorrect ?? 0) >= 8;
    case 'quiz-streak': {
      const scores = Object.values(quizScores);
      if (scores.length < 3) return false;
      return scores.slice(-3).every((s) => s >= 80);
    }
    case 'all-categories': {
      const categoryCount = Object.keys(quizScores).length;
      return categoryCount >= 8;
    }
    case 'first-challenge': return (challengeStats?.owaspCorrect ?? 0) > 0 || (challengeStats?.authCorrect ?? 0) > 0;
    case 'perfect-challenges': {
      return (challengeStats?.owaspCorrect === 11) || (challengeStats?.authCorrect === 8);
    }
    default: return false;
  }
}

/** Returns the number of unlocked achievements. */
export function countUnlockedAchievements(
  completedModules: string[],
  quizScores: Record<string, number>,
  challengeStats?: { owaspCorrect: number; authCorrect: number }
): number {
  return achievements.filter((a) =>
    getAchievementStatus(a.id, completedModules, quizScores, challengeStats)
  ).length;
}
