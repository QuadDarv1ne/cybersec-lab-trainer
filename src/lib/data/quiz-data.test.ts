import { describe, it, expect } from 'vitest';
import { quizQuestions, quizCategories } from './quiz-data';

describe('Quiz data integrity', () => {
  it('all questions have unique IDs', () => {
    const ids = quizQuestions.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('all correctIndex values are within bounds', () => {
    for (const question of quizQuestions) {
      expect(question.correctIndex).toBeGreaterThanOrEqual(0);
      expect(question.correctIndex).toBeLessThan(question.options.length);
    }
  });

  it('all questions have exactly 4 options', () => {
    for (const question of quizQuestions) {
      expect(question.options.length).toBe(4);
    }
  });

  it('category counts match actual questions', () => {
    for (const category of quizCategories) {
      const actualCount = quizQuestions.filter((q) => q.category === category.name).length;
      expect(category.count).toBe(actualCount);
    }
  });

  it('all categories have at least one question', () => {
    for (const category of quizCategories) {
      expect(category.count).toBeGreaterThan(0);
    }
  });

  it('all questions have non-empty explanation', () => {
    for (const question of quizQuestions) {
      expect(question.explanation.length).toBeGreaterThan(0);
    }
  });
});
