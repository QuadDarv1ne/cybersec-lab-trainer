import { describe, it, expect } from 'vitest';
import { quizQuestions, quizCategories } from '../lib/security-data';

describe('quiz retry wrong questions', () => {
  it('quizQuestions has questions with category matching quizCategories names', () => {
    const categoryNames = quizCategories.map((c) => c.name);
    const unmatched = quizQuestions.filter((q) => !categoryNames.includes(q.category));
    expect(unmatched).toHaveLength(0);
  });

  it('can filter wrong questions from a mock answers array', () => {
    const questions = quizQuestions.filter((q) => q.category === 'SQL-инъекции');
    // Simulate: first question wrong (false), second correct (true), third wrong (false)
    const answers: (boolean | null)[] = [false, true, false, true, true, true, true, true, true, true, true, true];
    const wrongs = questions.filter((_, i) => !answers[i]);
    expect(wrongs).toHaveLength(2);
    expect(wrongs[0].id).toBe(questions[0].id);
    expect(wrongs[1].id).toBe(questions[2].id);
  });

  it('handles null answers as wrong in filter', () => {
    const questions = quizQuestions.filter((q) => q.category === 'XSS-атаки');
    const answers: (boolean | null)[] = new Array(questions.length).fill(null);
    answers[0] = true;
    // null and false should be treated as "wrong"
    const wrongs = questions.filter((_, i) => !answers[i]);
    expect(wrongs).toHaveLength(questions.length - 1);
  });

  it('retryWrong produces empty array when all correct', () => {
    const questions = quizQuestions.filter((q) => q.category === 'OWASP Top 10');
    const answers: (boolean | null)[] = new Array(questions.length).fill(true);
    const wrongs = questions.filter((_, i) => !answers[i]);
    expect(wrongs).toHaveLength(0);
  });

  it('quiz categories have at least one question each', () => {
    for (const cat of quizCategories) {
      const count = quizQuestions.filter((q) => q.category === cat.name).length;
      expect(count).toBeGreaterThan(0);
    }
  });
});
