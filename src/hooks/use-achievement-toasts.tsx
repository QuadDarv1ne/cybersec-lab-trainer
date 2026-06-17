'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { achievements } from '@/lib/security-data';
import { getAchievementStatus } from '@/lib/achievement-utils';
import { toast } from 'sonner';
import { useTranslations } from '@/lib/intlStub';

/**
 * Hook that detects newly unlocked achievements and shows toast notifications.
 * Compares current achievement status with the previous render to find newly unlocked ones.
 * On initial mount, populates the previous set so that already-unlocked achievements don't trigger toasts.
 */
export function useAchievementToasts() {
  const completedModules = useAppStore((s) => s.completedModules);
  const quizScores = useAppStore((s) => s.quizScores);
  const owaspChallengeScores = useAppStore((s) => s.owaspChallengeScores);
  const authChallengeScores = useAppStore((s) => s.authChallengeScores);
  const headersChallengeScores = useAppStore((s) => s.headersChallengeScores);
  const secureCodingChallengeScores = useAppStore((s) => s.secureCodingChallengeScores);
  const previousUnlockedRef = useRef<Set<string> | null>(null);
  const t = useTranslations('common');

  // Stable challenge stats — only changes when underlying values change
  const challengeStats = useMemo(() => ({
    owaspCorrect: owaspChallengeScores.correct,
    authCorrect: authChallengeScores.correct,
    owaspTotal: owaspChallengeScores.total,
    authTotal: authChallengeScores.total,
    headersCorrect: headersChallengeScores.correct,
    headersTotal: headersChallengeScores.total,
    secureCodingCorrect: secureCodingChallengeScores.correct,
    secureCodingTotal: secureCodingChallengeScores.total,
  }), [
    owaspChallengeScores.correct, owaspChallengeScores.total,
    authChallengeScores.correct, authChallengeScores.total,
    headersChallengeScores.correct, headersChallengeScores.total,
    secureCodingChallengeScores.correct, secureCodingChallengeScores.total,
  ]);

  useEffect(() => {
    const currentlyUnlocked = new Set<string>();

    for (const achievement of achievements) {
      const isUnlocked = getAchievementStatus(
        achievement.id,
        completedModules,
        quizScores,
        challengeStats
      );

      if (isUnlocked) {
        currentlyUnlocked.add(achievement.id);
      }
    }

    // On first run, just record the current state — don't fire toasts for already-unlocked achievements
    if (previousUnlockedRef.current === null) {
      previousUnlockedRef.current = currentlyUnlocked;
      return;
    }

    // Find newly unlocked achievements
    const newlyUnlocked: typeof achievements = [];
    for (const achievement of achievements) {
      if (
        currentlyUnlocked.has(achievement.id) &&
        !previousUnlockedRef.current.has(achievement.id)
      ) {
        newlyUnlocked.push(achievement);
      }
    }

    // Show toasts for newly unlocked achievements
    for (const achievement of newlyUnlocked) {
      toast.success(
        <div className="flex items-start gap-3">
          <div className="text-2xl">🏆</div>
          <div>
            <p className="font-semibold text-sm">{t('achievementUnlocked')}</p>
            <p className="font-medium text-sm">{achievement.title}</p>
            <p className="text-xs text-slate-500">{achievement.description}</p>
          </div>
        </div>,
        {
          duration: 5000,
          className: 'border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-700',
        }
      );
    }

    previousUnlockedRef.current = currentlyUnlocked;
  }, [completedModules, quizScores, challengeStats, t]);
}
