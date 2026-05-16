import { achievements } from '@/lib/security-data';
import { modules } from '@/lib/data/modules-data';

/**
 * Checks whether a given achievement is unlocked based on progress state.
 * Centralised to avoid duplication between Dashboard and AchievementsGlossary.
 */
export function getAchievementStatus(
  id: string,
  completedModules: string[],
  quizScores: Record<string, number>
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
    default: return false;
  }
}

/** Returns the number of unlocked achievements. */
export function countUnlockedAchievements(
  completedModules: string[],
  quizScores: Record<string, number>
): number {
  return achievements.filter((a) =>
    getAchievementStatus(a.id, completedModules, quizScores)
  ).length;
}
