import { describe, it, expect } from 'vitest';
import {
  quizAnswerSchema,
  quizAnswersSchema,
  progressUpdateSchema,
  glossarySearchSchema,
  userDataSchema,
} from './api';

describe('quizAnswerSchema', () => {
  it('validates correct input', () => {
    const result = quizAnswerSchema.safeParse({ questionId: 'q1', answerIndex: 0 });
    expect(result.success).toBe(true);
  });

  it('rejects empty questionId', () => {
    const result = quizAnswerSchema.safeParse({ questionId: '', answerIndex: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative answerIndex', () => {
    const result = quizAnswerSchema.safeParse({ questionId: 'q1', answerIndex: -1 });
    expect(result.success).toBe(false);
  });

  it('accepts answerIndex 0', () => {
    const result = quizAnswerSchema.safeParse({ questionId: 'q1', answerIndex: 0 });
    expect(result.success).toBe(true);
  });
});

describe('quizAnswersSchema', () => {
  it('validates array of answers', () => {
    const result = quizAnswersSchema.safeParse([
      { questionId: 'q1', answerIndex: 0 },
      { questionId: 'q2', answerIndex: 2 },
    ]);
    expect(result.success).toBe(true);
  });

  it('accepts empty array', () => {
    const result = quizAnswersSchema.safeParse([]);
    expect(result.success).toBe(true);
  });

  it('rejects invalid entry in array', () => {
    const result = quizAnswersSchema.safeParse([{ questionId: '', answerIndex: 0 }]);
    expect(result.success).toBe(false);
  });
});

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

describe('userDataSchema', () => {
  it('validates correct input', () => {
    const result = userDataSchema.safeParse({
      userId: 'user1',
      action: 'complete',
      data: { key: 'value' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid action', () => {
    const result = userDataSchema.safeParse({
      userId: 'user1',
      action: 'invalid',
      data: {},
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty userId', () => {
    const result = userDataSchema.safeParse({
      userId: '',
      action: 'complete',
      data: {},
    });
    expect(result.success).toBe(false);
  });
});
