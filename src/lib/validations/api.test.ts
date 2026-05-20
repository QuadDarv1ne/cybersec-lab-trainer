import { describe, it, expect } from 'vitest';
import {
  progressUpdateSchema,
  glossarySearchSchema,
  quizResultSchema,
  batchSyncSchema,
  challengeProgressSchema,
  challengeBatchSchema,
} from './api';

describe('progressUpdateSchema', () => {
  it('validates correct input', () => {
    const result = progressUpdateSchema.safeParse({ moduleId: 'sql', completed: true });
    expect(result.success).toBe(true);
  });

  it('accepts optional score within range', () => {
    const result = progressUpdateSchema.safeParse({ moduleId: 'sql', completed: true, score: 85 });
    expect(result.success).toBe(true);
  });

  it('rejects score above 100', () => {
    const result = progressUpdateSchema.safeParse({ moduleId: 'sql', completed: true, score: 101 });
    expect(result.success).toBe(false);
  });

  it('rejects score below 0', () => {
    const result = progressUpdateSchema.safeParse({ moduleId: 'sql', completed: true, score: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects empty moduleId', () => {
    const result = progressUpdateSchema.safeParse({ moduleId: '', completed: true });
    expect(result.success).toBe(false);
  });
});

describe('glossarySearchSchema', () => {
  it('validates correct input', () => {
    const result = glossarySearchSchema.safeParse({ query: 'SQL', category: 'vulns' });
    expect(result.success).toBe(true);
  });

  it('accepts query without category', () => {
    const result = glossarySearchSchema.safeParse({ query: 'test' });
    expect(result.success).toBe(true);
  });

  it('rejects empty query', () => {
    const result = glossarySearchSchema.safeParse({ query: '' });
    expect(result.success).toBe(false);
  });

  it('rejects query over 100 chars', () => {
    const result = glossarySearchSchema.safeParse({ query: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });
});

describe('quizResultSchema', () => {
  it('validates correct input', () => {
    const result = quizResultSchema.safeParse({ quizId: 'owasp', score: 8, total: 10 });
    expect(result.success).toBe(true);
  });

  it('rejects score greater than total', () => {
    const result = quizResultSchema.safeParse({ quizId: 'owasp', score: 15, total: 10 });
    expect(result.success).toBe(false);
  });

  it('accepts score equal to total', () => {
    const result = quizResultSchema.safeParse({ quizId: 'owasp', score: 10, total: 10 });
    expect(result.success).toBe(true);
  });

  it('rejects empty quizId', () => {
    const result = quizResultSchema.safeParse({ quizId: '', score: 5, total: 10 });
    expect(result.success).toBe(false);
  });
});

describe('batchSyncSchema', () => {
  it('validates correct input', () => {
    const result = batchSyncSchema.safeParse({
      modules: [{ moduleId: 'sql', completed: true }],
      quizzes: [{ quizId: 'owasp', score: 8, total: 10 }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects quiz with score greater than total', () => {
    const result = batchSyncSchema.safeParse({
      quizzes: [{ quizId: 'owasp', score: 99, total: 10 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 50 modules', () => {
    const modules = Array.from({ length: 51 }, (_, i) => ({ moduleId: `m${i}`, completed: true }));
    const result = batchSyncSchema.safeParse({ modules });
    expect(result.success).toBe(false);
  });

  it('rejects more than 50 quizzes', () => {
    const quizzes = Array.from({ length: 51 }, (_, i) => ({ quizId: `q${i}`, score: 5, total: 10 }));
    const result = batchSyncSchema.safeParse({ quizzes });
    expect(result.success).toBe(false);
  });
});

describe('challengeProgressSchema', () => {
  it('validates correct input', () => {
    const result = challengeProgressSchema.safeParse({
      challengeType: 'owasp',
      correct: 5,
      total: 10,
    });
    expect(result.success).toBe(true);
  });

  it('rejects correct greater than total', () => {
    const result = challengeProgressSchema.safeParse({
      challengeType: 'owasp',
      correct: 99,
      total: 10,
    });
    expect(result.success).toBe(false);
  });

  it('accepts correct equal to total', () => {
    const result = challengeProgressSchema.safeParse({
      challengeType: 'owasp',
      correct: 10,
      total: 10,
    });
    expect(result.success).toBe(true);
  });

  it('rejects more than 1000 answered items', () => {
    const result = challengeProgressSchema.safeParse({
      challengeType: 'owasp',
      correct: 5,
      total: 10,
      answered: Array.from({ length: 1001 }, (_, i) => i),
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 100 selectedOptions entries', () => {
    const selectedOptions = Object.fromEntries(Array.from({ length: 101 }, (_, i) => [i, i]));
    const result = challengeProgressSchema.safeParse({
      challengeType: 'owasp',
      correct: 5,
      total: 10,
      selectedOptions,
    });
    expect(result.success).toBe(false);
  });
});

describe('challengeBatchSchema', () => {
  it('rejects more than 50 challenges', () => {
    const challenges = Array.from({ length: 51 }, (_, i) => ({
      challengeType: 'owasp',
      correct: 5,
      total: 10,
    }));
    const result = challengeBatchSchema.safeParse({ challenges });
    expect(result.success).toBe(false);
  });
});

