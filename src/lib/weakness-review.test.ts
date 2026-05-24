import { describe, it, expect } from 'vitest';
import { buildWeaknessReview, getWeaknessCount } from './weakness-review';
import type { QuizAttempt } from './store';

describe('weakness-review', () => {
  const emptyScores = {
    correct: 0,
    total: 0,
    answered: [] as number[],
    selectedOptions: {} as Record<string, number>,
  };

  describe('buildWeaknessReview', () => {
    it('returns empty review when no history or scores', () => {
      const review = buildWeaknessReview([], emptyScores, emptyScores, emptyScores, emptyScores);
      expect(review.totalCount).toBe(0);
      expect(review.items).toHaveLength(0);
      expect(Object.keys(review.categoryBreakdown)).toHaveLength(0);
    });

    it('extracts wrong quiz answers from history', () => {
      const quizHistory: QuizAttempt[] = [
        {
          id: 'test-1',
          categoryId: 'sql',
          categoryName: 'SQL-инъекции',
          score: 50,
          correct: 1,
          total: 2,
          answers: [false, true], // First wrong, second correct
          timestamp: Date.now(),
        },
      ];

      const review = buildWeaknessReview(quizHistory, emptyScores, emptyScores, emptyScores, emptyScores);
      expect(review.totalCount).toBeGreaterThanOrEqual(1);
      const quizItems = review.items.filter((i) => i.type === 'quiz');
      expect(quizItems.length).toBeGreaterThanOrEqual(1);
      expect(quizItems[0].category).toBe('SQL-инъекции');
    });

    it('does not duplicate questions across multiple attempts', () => {
      const quizHistory: QuizAttempt[] = [
        {
          id: 'test-1',
          categoryId: 'sql',
          categoryName: 'SQL-инъекции',
          score: 0,
          correct: 0,
          total: 2,
          answers: [false, false],
          timestamp: Date.now(),
        },
        {
          id: 'test-2',
          categoryId: 'sql',
          categoryName: 'SQL-инъекции',
          score: 0,
          correct: 0,
          total: 2,
          answers: [false, false],
          timestamp: Date.now() + 1,
        },
      ];

      const review = buildWeaknessReview(quizHistory, emptyScores, emptyScores, emptyScores, emptyScores);
      const quizItems = review.items.filter((i) => i.type === 'quiz');
      const uniqueIds = new Set(quizItems.map((i) => i.id));
      expect(quizItems.length).toBe(uniqueIds.size); // No duplicates
    });

    it('builds correct category breakdown', () => {
      const quizHistory: QuizAttempt[] = [
        {
          id: 'test-1',
          categoryId: 'sql',
          categoryName: 'SQL-инъекции',
          score: 0,
          correct: 0,
          total: 1,
          answers: [false],
          timestamp: Date.now(),
        },
      ];

      const review = buildWeaknessReview(quizHistory, emptyScores, emptyScores, emptyScores, emptyScores);
      expect(review.categoryBreakdown['SQL-инъекции']).toBeGreaterThan(0);
    });
  });

  describe('getWeaknessCount', () => {
    it('returns 0 for empty data', () => {
      const count = getWeaknessCount([], emptyScores, emptyScores, emptyScores, emptyScores);
      expect(count).toBe(0);
    });

    it('returns correct count for quiz mistakes', () => {
      const quizHistory: QuizAttempt[] = [
        {
          id: 'test-1',
          categoryId: 'sql',
          categoryName: 'SQL-инъекции',
          score: 50,
          correct: 1,
          total: 3,
          answers: [false, false, true],
          timestamp: Date.now(),
        },
      ];

      const count = getWeaknessCount(quizHistory, emptyScores, emptyScores, emptyScores, emptyScores);
      expect(count).toBeGreaterThanOrEqual(2);
    });

    it('returns 0 when all quiz answers correct', () => {
      const quizHistory: QuizAttempt[] = [
        {
          id: 'test-1',
          categoryId: 'sql',
          categoryName: 'SQL-инъекции',
          score: 100,
          correct: 3,
          total: 3,
          answers: [true, true, true],
          timestamp: Date.now(),
        },
      ];

      const count = getWeaknessCount(quizHistory, emptyScores, emptyScores, emptyScores, emptyScores);
      expect(count).toBe(0);
    });
  });

  describe('WeaknessItem structure', () => {
    it('quiz items have all required fields', () => {
      const quizHistory: QuizAttempt[] = [
        {
          id: 'test-1',
          categoryId: 'sql',
          categoryName: 'SQL-инъекции',
          score: 0,
          correct: 0,
          total: 1,
          answers: [false],
          timestamp: Date.now(),
        },
      ];

      const review = buildWeaknessReview(quizHistory, emptyScores, emptyScores, emptyScores, emptyScores);
      const quizItem = review.items.find((i) => i.type === 'quiz');
      expect(quizItem).toBeDefined();
      expect(quizItem!.id).toBeDefined();
      expect(quizItem!.type).toBe('quiz');
      expect(quizItem!.category).toBe('SQL-инъекции');
      expect(quizItem!.question.length).toBeGreaterThan(0);
      expect(quizItem!.options.length).toBeGreaterThan(0);
      expect(quizItem!.correctIndex).toBeGreaterThanOrEqual(0);
      expect(quizItem!.explanation.length).toBeGreaterThan(0);
      expect(quizItem!.sourceModule).toBe('quiz');
    });
  });
});
