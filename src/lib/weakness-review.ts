import { quizQuestions } from '@/lib/data/quiz-data';
import { owaspChallenges, authChallenges, headerChallenges, secureCodingChallenges } from '@/lib/data';
import type { QuizAttempt } from '@/lib/store';

export interface WeaknessItem {
  id: string;
  type: 'quiz' | 'challenge';
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceModule: string;
}

export interface WeaknessReviewSession {
  items: WeaknessItem[];
  totalCount: number;
  categoryBreakdown: Record<string, number>;
}

/**
 * Extracts wrong quiz answers from quiz history.
 * For each attempt where score < 100%, collects incorrectly answered questions.
 */
function extractWrongQuizQuestions(quizHistory: QuizAttempt[]): WeaknessItem[] {
  const items: WeaknessItem[] = [];
  const seenIds = new Set<string>();

  if (!quizHistory || !Array.isArray(quizHistory)) return items;

  for (const attempt of quizHistory) {
    const questions = quizQuestions.filter((q) => q.category === attempt.categoryName);
    for (let i = 0; i < attempt.answers.length; i++) {
      const answer = attempt.answers[i];
      if (answer === false && i < questions.length) {
        const question = questions[i];
        const uniqueId = `quiz-${attempt.categoryId}-${question.id}`;
        if (seenIds.has(uniqueId)) continue;
        seenIds.add(uniqueId);

        items.push({
          id: uniqueId,
          type: 'quiz',
          category: attempt.categoryName,
          question: question.question,
          options: question.options,
          correctIndex: question.correctIndex,
          explanation: question.explanation,
          sourceModule: 'quiz',
        });
      }
    }
  }

  return items;
}

/**
 * Extracts wrong challenge answers from a challenge set.
 * Compares selectedOptions against correct answers to find mistakes.
 */
function extractWrongChallenges<T extends { id: string }>(
  challenges: T[],
  scores: { correct: number; total: number; answered: number[]; selectedOptions: Record<string, number> },
  getOptions: (ch: T) => Array<{ text: string; correct: boolean }>,
  getQuestion: (ch: T) => string,
  category: string,
  sourceModule: string,
): WeaknessItem[] {
  const items: WeaknessItem[] = [];

  for (let i = 0; i < challenges.length; i++) {
    const challenge = challenges[i];
    // Check if this challenge was answered
    if (!scores.answered.includes(i)) continue;

    const selectedIdx = scores.selectedOptions[String(i)] ?? scores.selectedOptions[i] ?? -1;
    if (selectedIdx < 0) continue;

    const options = getOptions(challenge);
    const isCorrect = options[selectedIdx]?.correct;
    if (isCorrect) continue; // Only collect wrong answers

    const correctIdx = options.findIndex((o) => o.correct);
    const optionTexts = options.map((o) => o.text);

    items.push({
      id: `ch-${sourceModule}-${challenge.id}`,
      type: 'challenge',
      category,
      question: getQuestion(challenge),
      options: optionTexts,
      correctIndex: correctIdx,
      explanation: (challenge as Record<string, unknown>).explanation as string ?? '',
      sourceModule,
    });
  }

  return items;
}

/**
 * Builds a weakness review session from quiz history and challenge scores.
 * Collects all incorrectly answered questions across all modules.
 */
export function buildWeaknessReview(
  quizHistory: QuizAttempt[],
  owaspChallengeScores: { correct: number; total: number; answered: number[]; selectedOptions: Record<string, number> },
  authChallengeScores: { correct: number; total: number; answered: number[]; selectedOptions: Record<string, number> },
  headersChallengeScores: { correct: number; total: number; answered: number[]; selectedOptions: Record<string, number> },
  secureCodingChallengeScores: { correct: number; total: number; answered: number[]; selectedOptions: Record<string, number> },
): WeaknessReviewSession {
  const items: WeaknessItem[] = [];

  // Wrong quiz answers
  items.push(...extractWrongQuizQuestions(quizHistory));

  // Wrong OWASP challenge answers
  items.push(
    ...extractWrongChallenges(
      owaspChallenges,
      owaspChallengeScores,
      (ch) => ch.options,
      (ch) => ch.question,
      'OWASP Top 10',
      'owasp',
    ),
  );

  // Wrong Auth challenge answers
  items.push(
    ...extractWrongChallenges(
      authChallenges,
      authChallengeScores,
      (ch) => ch.options,
      (ch) => ch.question,
      'Аутентификация',
      'auth',
    ),
  );

  // Wrong Headers challenge answers
  items.push(
    ...extractWrongChallenges(
      headerChallenges,
      headersChallengeScores,
      (ch) => ch.options,
      (ch) => ch.question,
      'Заголовки безопасности',
      'security-headers',
    ),
  );

  // Wrong Secure Coding challenge answers
  items.push(
    ...extractWrongChallenges(
      secureCodingChallenges,
      secureCodingChallengeScores,
      (ch) => ch.options,
      (ch) => ch.code,
      'Безопасное кодирование',
      'secure-coding',
    ),
  );

  // Build category breakdown
  const categoryBreakdown: Record<string, number> = {};
  for (const item of items) {
    categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
  }

  return {
    items,
    totalCount: items.length,
    categoryBreakdown,
  };
}

/**
 * Returns the total count of weakness items across all sources.
 * Memoized to avoid expensive recalculation on every render.
 */
let lastCacheKey: string | null = null;
let lastCacheResult = 0;

export function getWeaknessCount(
  quizHistory: QuizAttempt[] = [],
  owaspChallengeScores: { correct: number; total: number; answered: number[]; selectedOptions: Record<string, number> },
  authChallengeScores: { correct: number; total: number; answered: number[]; selectedOptions: Record<string, number> },
  headersChallengeScores: { correct: number; total: number; answered: number[]; selectedOptions: Record<string, number> },
  secureCodingChallengeScores: { correct: number; total: number; answered: number[]; selectedOptions: Record<string, number> },
): number {
  const cacheKey = JSON.stringify([
    quizHistory.map((h) => ({ id: h.id, score: h.score })),
    owaspChallengeScores.total,
    authChallengeScores.total,
    headersChallengeScores.total,
    secureCodingChallengeScores.total,
    owaspChallengeScores.answered?.length ?? 0,
    authChallengeScores.answered?.length ?? 0,
    headersChallengeScores.answered?.length ?? 0,
    secureCodingChallengeScores.answered?.length ?? 0,
  ]);

  if (cacheKey === lastCacheKey) {
    return lastCacheResult;
  }

  const review = buildWeaknessReview(
    quizHistory,
    owaspChallengeScores,
    authChallengeScores,
    headersChallengeScores,
    secureCodingChallengeScores,
  );

  lastCacheKey = cacheKey;
  lastCacheResult = review.totalCount;

  return review.totalCount;
}

/** Reset the internal cache (useful for testing) */
export function resetWeaknessReviewCache(): void {
  lastCacheKey = null;
  lastCacheResult = 0;
}
